import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql"
import config from "../../../app.config.json"
import { ExpressContext } from "../../contexts/ExpressContext"
import Project from "../../entities/Project"
import { Disabled } from "../Disabled"

@Resolver()
export class CreateProjectResolver {
  @Mutation(type => Project)
  async createProject(
    @Arg("input") input: string,
    @Ctx() ctx: ExpressContext
  ): Promise<Project> {
    return new Project({ id: "123123123123" })
  }
}
