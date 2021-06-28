import { EntityManager, Connection, IDatabaseDriver } from "@mikro-orm/core"
import { Request, Response } from "express"

export interface ExpressContext {
  req: Request
  res: Response
  em: EntityManager<IDatabaseDriver<Connection>>
}
