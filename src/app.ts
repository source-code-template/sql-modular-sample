import { merge } from "config-plus"
import dotenv from "dotenv"
import express, { json, Request } from "express"
import { allow, toString } from "express-web-kit"
import http from "http"
import { createLogger, updateLog } from "logger-core"
import { mask, MiddlewareLogger, SimpleMap } from "middleware-logging"
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

const middleware = new MiddlewareLogger(logger.info, cfg.middleware, buildHeader, encryptResponse, encryptRequest)
app.use(allow(cfg.allow), json(), middleware.log)

const pool = createPool(cfg.db)
const ctx = useContext(pool, logger, middleware)
route(app, ctx)

http.createServer(app).listen(cfg.port, () => {
  console.log("Start server at port " + cfg.port)
})

function buildHeader(req: Request, map: SimpleMap): SimpleMap {
  const requestId = req.get("X-Request-ID")
  if (requestId) {
    map["requestId"] = requestId
  }
  const correlationId = req.get("X-Correlation-ID")
  if (correlationId) {
    map["correlationId"] = correlationId
  }
  return map
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
