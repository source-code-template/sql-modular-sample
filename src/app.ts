import { merge } from "config-plus"
import dotenv from "dotenv"
import express, { json, Request } from "express"
import { allow, MiddlewareLogger, SimpleMap } from "express-core-web"
import http from "http"
import { createLogger, updateLog } from "logger-core"
import { createPool, PoolManager, resource } from "mysql2-core"
import { config, environments } from "./config"
import { useContext } from "./context"
import { route } from "./route"

resource.multipleStatements = true

const logger = createLogger(config.log)

dotenv.config()
const cfg = merge(config, process.env, environments, process.env.ENV)
updateLog(logger, cfg.log)

const app = express()

const middleware = new MiddlewareLogger(logger.info, cfg.middleware, buildHeader)
app.use(allow(cfg.allow), json(), middleware.log)

const pool = createPool(cfg.db)
const db = new PoolManager(pool)
const ctx = useContext(db, logger, middleware)
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
