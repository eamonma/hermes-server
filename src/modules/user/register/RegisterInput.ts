import { IsEmail, Length } from "class-validator"
import { Field, InputType } from "type-graphql"
import { IsDomain } from "./isDomain"
// import { IsEmailAlreadyExist } from "./isEmailAlreadyExist"
import config from "../../../../app.config.json"

@InputType()
export class RegisterInput {
  @Field()
  @Length(1, 30)
  name: string

  @Field()
  @IsEmail()
  @IsDomain(config.domain)
  //   @IsEmailAlreadyExist({ message: "Email already exists" })
  email: string

  @Field()
  password: string
}
