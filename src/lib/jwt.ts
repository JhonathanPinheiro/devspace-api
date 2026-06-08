import jwt, { SignOptions } from 'jsonwebtoken'

interface TokenPayload {
  sub: string  // subject — ID do usuário
  email: string
}

export function generateAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET as string
  const options = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m',
  } as SignOptions
  return jwt.sign(payload, secret, options)
}

export function generateRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET as string
  const options = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  } as SignOptions
  return jwt.sign(payload, secret, options)
}

export function verifyAccessToken(token: string): TokenPayload {
  const secret = process.env.JWT_ACCESS_SECRET as string
  return jwt.verify(token, secret) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET as string
  return jwt.verify(token, secret) as TokenPayload
}