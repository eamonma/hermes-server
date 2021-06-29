import { MiddlewareFn } from "type-graphql"
import { Middleware } from "type-graphql/dist/interfaces/Middleware"

export function Disabled(disabled: boolean): MiddlewareFn {
  return async (_, next) => {
    if (disabled) {
      throw new Error("Function not allowed")
    }
    return next()
  }
}
