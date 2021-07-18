import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  SerializedPrimaryKey,
} from "@mikro-orm/core"
import { IsEmail } from "class-validator"
import { Authorized, Field, ID, ObjectType } from "type-graphql"
import { Base } from "./Base"
import File from "./File"
import User from "./User"

import { customAlphabet } from "nanoid"
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const nanoid = customAlphabet(alphabet, 10)

@ObjectType()
@Entity()
export default class Project extends Base<Project> {
  @Field(type => ID)
  @SerializedPrimaryKey()
  id!: string

  @Field(type => String)
  @Property()
  shortId: string = nanoid()

  @Field()
  @Property()
  name: string

  @Field()
  @Property()
  client: string

  @Field()
  @Authorized()
  @Property()
  passphrase: string

  @Field(type => String, { nullable: true })
  @Property()
  clientContactName?: string

  @Field(type => String, { nullable: true })
  @Property()
  @IsEmail()
  clientContactEmail?: string

  @Field(type => [File], { nullable: true })
  @OneToMany(type => File, (file: File) => file.project)
  files = new Collection<File>(this)

  @Field(type => User)
  @ManyToOne(type => User)
  owner: User
}
