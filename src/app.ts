import { merge } from "config-plus"
import dotenv from "dotenv"
import express, { json } from "express"
import { allow, MiddlewareLogger } from "express-ext"
import http from "http"
import { createLogger } from "logger-core"
import { createPool, PoolManager, resource } from "mysql2-core"
import { Statement } from "onecore"
import { config, env } from "./config"
import { useContext } from "./context"
import { route } from "./route"

resource.multipleStatements = true

dotenv.config()
const cfg = merge(config, process.env, env, process.env.ENV)

const app = express()
const logger = createLogger(cfg.log)
const middleware = new MiddlewareLogger(logger.info, cfg.middleware)
app.use(allow(cfg.allow), json(), middleware.log)

const pool = createPool(cfg.db)
const db = new PoolManager(pool)
const arr: Statement[] = []
arr.push({ query: "insert into users(id,username)values(?,?)", params: ["t1", "t1"] })
arr.push({ query: "insert into users(id,username)values(?,?)", params: ["t2", "t2"] })
arr.push({ query: "insert into users(id,username)values(?,?)", params: ["t3", "t3"] })

// executeBatch(pool, arr)
/*
getConnection(pool).then((connection) => {
  executeBatchConnection(connection, arr)
})
*/
const ctx = useContext(db, logger, middleware)
route(app, ctx)
http.createServer(app).listen(cfg.port, () => {
  console.log("Start server at port " + cfg.port)
})
