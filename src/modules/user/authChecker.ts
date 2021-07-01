import { verify } from "jsonwebtoken"
import { AuthChecker } from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import User from "../../entities/User"
import { createTokens } from "./createTokens"

export const authChecker: AuthChecker<ExpressContext> = async (
  { context: { req, res, em }, args: { client } },
  roles
): Promise<boolean> => {
  if (client) {
    return true
  }
  try {
    const accessToken = (req.header("Authorization") as string).replace(
      "Bearer ",
      ""
    )
    const refreshToken = req.header("refresh-token") as string

    // Guard for neither token exists
    if (!accessToken && !refreshToken) return false

    // Check accessToken is valid
    try {
      const verified = verify(
        accessToken,
        process.env.ACCESS_SECRET as string
      ) as { id: string }

      const { id } = verified
      const user = await em.findOne(User, { id })

      // Guard for user not exist
      if (!user) return false
      res.locals.user = user

      return true
    } catch (error) {}

    let data

    try {
      data = verify(refreshToken, process.env.REFRESH_SECRET as string) as {
        id: string
        refreshTokenCount: number
      }
    } catch (error) {
      return false
    }

    const { id, refreshTokenCount } = data

    const user = (await em.findOne(User, { id })) as User

    // Invalid token or user not exist
    if (!user || user.refreshTokenCount !== refreshTokenCount) return false

    // Valid refreshToken so send new token pair
    const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
      createTokens(user)

    res.set({
      "Token": newAccessToken,
      "Refresh-Token": newRefreshToken,
    })

    return true
  } catch (err) {
    return false
  }
}
