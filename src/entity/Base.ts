import { BaseEntity, PrimaryKey, Property } from "@mikro-orm/core"
import { ObjectId } from "mongodb"
import { Field, ID, ObjectType } from "type-graphql"

@ObjectType({ isAbstract: true })
export class Base<T extends { id: string }> extends BaseEntity<T, "id"> {
  @Field(type => ID)
  @PrimaryKey()
  public _id: ObjectId

  @Field()
  @Property()
  public createdAt: Date = new Date()

  @Field()
  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date()

  constructor(body = {}) {
    super()
    this.assign(body)
  }
}
