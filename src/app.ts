import { merge } from "config-plus"
import dotenv from "dotenv"
import express, { json, Request } from "express"
import { allow, toString } from "express-web-kit"
import http from "http"
import { createLogger, updateLog } from "logger-core"
import { Context, mask, MiddlewareLogger } from "middleware-logging"
import { createPool, resource } from "mysql2-core"
import { config, environments } from "./config"
import { useContext } from "./context"
import { route } from "./route"

resource.multipleStatements = true

const logger = createLogger(config.log)

dotenv.config()
const cfg = merge(config, process.env, environments, process.env.ENV)
updateLog(logger, cfg.log)

const app = express()

const middleware = new MiddlewareLogger(logger.info, cfg.middleware, buildContext, encryptResponse, encryptRequest)
app.use(allow(cfg.allow), json(), middleware.log)

const pool = createPool(cfg.db)
const ctx = useContext(pool, logger, middleware)
route(app, ctx)

http.createServer(app).listen(cfg.port, () => {
  console.log("Start server at port " + cfg.port)
})

function buildContext(req: Request, context: Context): Context {
  context.requestId = req.header("X-Request-ID") ?? ""
  context.correlationId = req.header("X-Correlation-ID") ?? ""
  return context
}
function encryptResponse(rs: string): string {
  try {
    const body = JSON.parse(rs)
    if (body["phone"]) {
      body["phone"] = mask(body["phone"], 2, 2, "*")
    }
    if (body["email"]) {
      body["email"] = mask(body["email"], 2, 2, "*")
    }
    return JSON.stringify(body)
  } catch (err) {
    logger.error("Failed to encrypt response: " + toString(err))
  }
  return rs
}
function encryptRequest(body: any): string {
  if (typeof body === "object") {
    if (body["phone"]) {
      body["phone"] = mask(body["phone"], 2, 2, "*")
    }
    if (body["email"]) {
      body["email"] = mask(body["email"], 2, 2, "*")
    }
  }
  return JSON.stringify(body)
}
