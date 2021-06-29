import { Entity, Property, SerializedPrimaryKey } from "@mikro-orm/core"
import { Field, ID, ObjectType } from "type-graphql"
import { Base } from "./Base"

@ObjectType()
@Entity()
export default class User extends Base<User> {
  @Field(type => ID)
  @SerializedPrimaryKey()
  id!: string

  @Field()
  @Property()
  name: string

  @Field()
  @Property({ unique: true })
  email: string

  @Property()
  password: string

  @Property()
  refreshTokenCount: number = 0
}
