import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message })
    return
  }

  console.error('Unexpected error:', error)
  res.status(500).json({ message: 'Erro interno do servidor' })
}