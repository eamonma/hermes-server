import {
  Collection,
  Entity,
  OneToMany,
  Property,
  SerializedPrimaryKey,
} from "@mikro-orm/core"
import { IsEmail } from "class-validator"
import { Field, ID, ObjectType } from "type-graphql"
import { Base } from "./Base"
import Project from "./Project"

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
  @IsEmail()
  email: string

  @Property()
  password: string

  @Property()
  refreshTokenCount: number = 0

  @Field(type => [Project], { nullable: true })
  @OneToMany(type => Project, (project: Project) => project.owner)
  projects = new Collection<Project>(this)
}
