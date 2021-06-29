import { Authorized, Ctx, Mutation, ObjectType, Resolver } from "type-graphql"
import { ExpressContext } from "../../contexts/ExpressContext"
import User from "../../entities/User"

@Resolver()
@ObjectType()
export class AuthorizationResolver {
  @Mutation(type => Boolean)
  @Authorized()
  async invalidateTokens(@Ctx() { res, em }: ExpressContext): Promise<boolean> {
    if (!res.locals.user.id) return false

    const user = res.locals.user as User

    user.assign({ refreshTokenCount: user.refreshTokenCount + 1 })
    await em.persist(user).flush()

    return true
  }
}
