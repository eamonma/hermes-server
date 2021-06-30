import argon2 from "argon2"
import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import User from "../../entities/User"
import { createTokens } from "./createTokens"

@Resolver()
@ObjectType()
export class LoginResolver {
  @Authorized()
  @Query()
  topSecret(): string {
    return `Top secret number: ${Math.floor(Math.random() * 10)}`
  }

  @Query()
  datetime(): string {
    return new Date().toISOString()
  }

  @Query()
  @Authorized()
  me(@Ctx() ctx: ExpressContext): User {
    return ctx.res.locals.user
  }

  @Mutation(type => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req, res, em }: ExpressContext
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
