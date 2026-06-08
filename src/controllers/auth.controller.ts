import { Request, Response, NextFunction } from 'express'
import {
  registerService,
  loginService,
  refreshService,
} from '../services/auth.service'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name } = req.body

    const result = await registerService(email, password, name)

    res.cookie(
      'refreshToken',
      result.refreshToken,
      COOKIE_OPTIONS
    )

    return res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    })
  } catch (error) {
    next(error)
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body

    const result = await loginService(email, password)

    res.cookie(
      'refreshToken',
      result.refreshToken,
      COOKIE_OPTIONS
    )

    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    })
  } catch (error) {
    next(error)
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.refreshToken

    if (!token) {
      return res.status(401).json({
        message: 'Refresh token não encontrado',
      })
    }

    const result = await refreshService(token)

    res.cookie(
      'refreshToken',
      result.refreshToken,
      COOKIE_OPTIONS
    )

    return res.status(200).json({
      accessToken: result.accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function logout(
  req: Request,
  res: Response
) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  return res.status(200).json({
    message: 'Logout realizado com sucesso',
  })
}