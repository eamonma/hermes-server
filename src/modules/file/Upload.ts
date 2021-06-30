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

  @Mutation(type => [String])
  async getMultipartUrls(
    @Arg("size") size: number,
    @Ctx() { req, res, em }: ExpressContext
  ): Promise<string[]> {
    return [""]
  }
}
