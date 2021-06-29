import { verify } from "jsonwebtoken"
import { AuthChecker } from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import User from "../../entity/User"
import { createTokens } from "./createTokens"

export const authChecker: AuthChecker<ExpressContext> = async ({
  context: { req, res, em },
}) => {
  try {
    const accessToken = (req.header("Authorization") as string).replace(
      "Bearer ",
      ""
    )
    const refreshToken = req.header("RefreshToken") as string

    if (!accessToken && !refreshToken) return false

    // Check accessToken is valid
    try {
      const verified = verify(
        accessToken,
        process.env.ACCESS_SECRET as string
      ) as { id: string }

      console.log(`verfied: ${JSON.stringify(verified)}`)

      const { id } = verified
      const user = await em.findOne(User, { id })

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

      console.log(data)
    } catch (error) {
      return false
    }

    const { id, refreshTokenCount } = data

    const user = await em.findOne(User, { id })

    // invalid token
    if (!user || user.refreshTokenCount !== refreshTokenCount) return false

    // valid refreshToken
    const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
      createTokens(user)
    res.locals.user.refreshToken = newRefreshToken
    res.locals.user.accessToken = newAccessToken

    return true
  } catch (err) {
    return false
  }
}
