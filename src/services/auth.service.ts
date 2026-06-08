import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { generateAccessToken, generateRefreshToken } from '../lib/jwt'
import { AppError } from '../lib/errors'

export async function registerService(
    email: string,
    password: string,
    name: string
) {
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
        throw new AppError('Email already in use', 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
    })

    const accessToken = generateAccessToken({ sub: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ sub: user.id, email: user.email })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt,
        },
    })

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } }
}

export async function loginService(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        throw new AppError('Invalid email or password', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
        throw new AppError('Invalid email or password', 401)
    }

    const accessToken = generateAccessToken({ sub: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ sub: user.id, email: user.email })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt,
        },
    })

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } }
}

export async function refreshService(token: string) {
    const stored = await prisma.refreshToken.findFirst({
        where: { token },
        include: { user: true },
    })

    if (!stored) throw new AppError('Token inválido', 401)
    if (stored.expiresAt < new Date()) {
        // token expirado — remove do banco e rejeita
        await prisma.refreshToken.delete({
            where: {
                id: stored.id,
            },
        })
        throw new AppError('Token expirado', 401)
    }

    await prisma.refreshToken.delete({
        where: {
            id: stored.id,
        },
    })

    const newAccessToken = generateAccessToken({
        sub: stored.user.id,
        email: stored.user.email,
    })
    const newRefreshToken = generateRefreshToken({
        sub: stored.user.id,
        email: stored.user.email,
    })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
        data: { token: newRefreshToken, userId: stored.user.id, expiresAt },
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}