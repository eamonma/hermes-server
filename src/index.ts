import chalk from "chalk"
import { existsSync } from "fs"
import "dotenv/config"
import "reflect-metadata"

// Check environment and configuration exist
const envExists = existsSync(".env")
const configExists = existsSync("app.config.json")
const bothExist = envExists && configExists

const existsString = `${!envExists ? ".env" : ""}${
  !envExists && !configExists ? " and " : ""
}${!configExists ? "app.config.json" : ""} ${
  !envExists && !configExists ? "don't" : "doesn't"
} exist. Run ${chalk.green("npm run setup")} to setup.`

if (!bothExist) {
  console.log(existsString)
  process.exit()
}

import Application from "./application"
;(async () => {
  const application = new Application()
  await application.connect()
  await application.init()
})()
