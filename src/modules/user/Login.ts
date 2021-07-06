import argon2 from "argon2"
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import User from "../../entities/User"
import { createTokens } from "./createTokens"

@Resolver(type => User)
export class LoginResolver {
  // Sample authorized query
  @Authorized()
  @Query()
  topSecret(): string {
    return `Top secret number: ${Math.floor(Math.random() * 10)}`
  }

  // Sample non-authorized query
  @Query()
  datetime(): string {
    return new Date().toISOString()
  }

  @Query(type => User)
  @Authorized()
  async me(@Ctx() ctx: ExpressContext): Promise<User> {
    const { user } = ctx.res.locals
    await user.projects.init()
    return user
  }

  @Mutation(type => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res, em }: ExpressContext
  ): Promise<User | null> {
    const user = (await em.findOne(User, { email })) as User
    if (!user) return null

    const valid = await argon2.verify(user.password, password)
    if (!valid) return null

    const { accessToken, refreshToken } = createTokens(user)

    res.set({
      "Token": accessToken,
      "Refresh-Token": refreshToken,
    })

    return user
  }
}
