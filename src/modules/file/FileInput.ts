import { IsMimeType } from "class-validator"
import { ArgsType, Field } from "type-graphql"

@ArgsType()
export class FileInput {
  @Field()
  name: string

  @Field()
  @IsMimeType()
  mime: string

  @Field()
  projectId: string

  @Field()
  key: string
}
