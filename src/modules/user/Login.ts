import argon2 from "argon2"
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import User from "../../entity/User"
import { createTokens } from "./createTokens"

@ObjectType()
class LoggedInUser extends User {
  @Field()
  refreshToken: string = ""

  @Field()
  accessToken: string = ""
}

@Resolver()
@ObjectType()
export class LoginResolver {
  @Authorized()
  @Query()
  pingshhh(): string {
    return "pongshhh"
  }

  @Query()
  hello(): string {
    return "world"
  }

  @Query()
  @Authorized()
  me(@Ctx() ctx: ExpressContext): LoggedInUser {
    const user = ctx.res.locals.user as LoggedInUser

    return user
  }

  @Mutation(type => LoggedInUser, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { em }: ExpressContext
  ): Promise<LoggedInUser | null> {
    const user = (await em.findOne(User, { email })) as LoggedInUser
    if (!user) return null

    const valid = await argon2.verify(user.password, password)
    if (!valid) return null

    const { accessToken, refreshToken } = createTokens(user)

    user.accessToken = accessToken
    user.refreshToken = refreshToken

    return user
  }
}
