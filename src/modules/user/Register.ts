import argon2 from "argon2"
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql"
import User from "../../entities/User"
import { RegisterInput } from "./register/RegisterInput"
import { ExpressContext } from "../../contexts/ExpressContext"
import { createTokens } from "./createTokens"
import { Disabled } from "../Disabled"
import config from "../../../app.config.json"

@Resolver()
export class RegisterResolver {
  @Mutation(type => User)
  @UseMiddleware(Disabled(!config.enableRegistration))
  async register(
    @Arg("input") { name, email, password }: RegisterInput,
    @Ctx() ctx: ExpressContext
  ): Promise<User> {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    })

    const user = new User({ name, email, password: hashedPassword })

    await ctx.em.persist(user).flush()

    const { refreshToken, accessToken } = createTokens(user)

    ctx.res.set({
      Token: accessToken,
      RefreshToken: refreshToken,
    })

    return user
  }
}
