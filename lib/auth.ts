import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  emailVerified: boolean
  createdAt: Date
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateTokens = (user: User) => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })

  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export const generateEmailVerificationToken = (email: string): string => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' })
}

export const verifyEmailToken = (token: string): { email: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { email: string }
  } catch {
    return null
  }
}