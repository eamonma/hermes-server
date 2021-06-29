import argon2 from "argon2"
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql"
import User from "../../entity/User"
import { RegisterInput } from "./register/RegisterInput"
import { ExpressContext } from "../../contexts/ExpressContext"

@Resolver(type => User)
export class RegisterResolver {
  @Mutation(type => User)
  async register(
    @Arg("input") { name, email, password }: RegisterInput,
    @Ctx() ctx: ExpressContext
  ): Promise<User> {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    })

    const user = new User({ name, email, password: hashedPassword })

    console.debug(ctx.em)

    await ctx.em.persist(user).flush()

    return user
  }
}
