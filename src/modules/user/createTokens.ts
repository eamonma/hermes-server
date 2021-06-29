import { sign } from "jsonwebtoken"
import User from "../../entities/User"

export const createTokens = (
  user: User
): {
  refreshToken: string
  accessToken: string
} => {
  const refreshToken = sign(
    {
      id: user.id,
      refreshTokenCount: user.refreshTokenCount,
    },
    process.env.REFRESH_SECRET as string,
    {
      expiresIn: "14 days",
    }
  )

  const accessToken = sign(
    { id: user.id },
    process.env.ACCESS_SECRET as string,
    {
      expiresIn: "15 min",
    }
  )

  return { accessToken, refreshToken }
}
