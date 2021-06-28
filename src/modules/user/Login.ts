import { Arg, Ctx, Mutation, ObjectType, Query, Resolver } from "type-graphql"
import User from "../../entity/User"
import { ExpressContext } from "../../contexts/ExpressContext"
import argon2 from "argon2"
import { sign } from "jsonwebtoken"

@Resolver()
@ObjectType()
export class LoginResolver {
  @Query()
  yee(@Ctx() ctx: ExpressContext): string {
    return JSON.stringify(ctx.em)
  }
  @Mutation(type => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: ExpressContext
  ): Promise<User | null> {
    const user = await ctx.em.findOne(User, { email })
    if (!user) return null

    const valid = await argon2.verify(user.password, password)
    if (!valid) return null

    const refreshToken = sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "14 days",
      }
    )
    const accessToken = sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15 min",
      }
    )
    console.log(refreshToken)
    // // ctx.res.locals.user
    return user
  }
  // @Mutation(type => User)
  // async login(): Promise<UserType | null> {
  //   return new Promise(() => {})
  // }
}
