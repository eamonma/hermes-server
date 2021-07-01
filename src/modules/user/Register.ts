import argon2 from "argon2"
import { Args, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql"
import config from "../../../app.config.json"
import { ExpressContext } from "../../contexts/ExpressContext"
import User from "../../entities/User"
import { Disabled } from "../Disabled"
import { createTokens } from "./createTokens"
import { RegisterInput } from "./register/RegisterInput"

@Resolver(type => User)
export class RegisterResolver {
  @Mutation(type => User)
  @UseMiddleware(Disabled(!config.registration))
  async register(
    @Args() { name, email, password }: RegisterInput,
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
