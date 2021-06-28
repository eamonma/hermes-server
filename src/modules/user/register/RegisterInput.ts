import { IsEmail, Length } from "class-validator"
import { Field, InputType } from "type-graphql"
// import { IsEmailAlreadyExist } from "./isEmailAlreadyExist"

@InputType()
export class RegisterInput {
  @Field()
  @Length(1, 30)
  name: string

  @Field()
  @IsEmail()
  //   @IsEmailAlreadyExist({ message: "Email already exists" })
  email: string

  @Field()
  password: string
}
