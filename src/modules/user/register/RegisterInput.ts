import { IsEmail, Length } from "class-validator"
import { ArgsType, Field } from "type-graphql"
// import { IsEmailAlreadyExist } from "./isEmailAlreadyExist"
import config from "../../../../app.config.json"
import { IsDomain } from "./isDomain"

@ArgsType()
export class RegisterInput {
  @Field()
  @Length(1, 256)
  name: string

  @Field()
  @IsEmail()
  @IsDomain(config.domain)
  email: string

  @Field()
  password: string
}
