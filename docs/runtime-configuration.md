# Runtime, configuration, middleware, and health checks

## 1. Startup sequence

Source: `src/app.ts`.

The current startup sequence is:

1. Set `resource.multipleStatements = true` for `mysql2-core`.
2. Create a logger using the default `config.log`.
3. Load environment variables with `dotenv.config()`.
4. Merge `config`, `process.env`, the `environments` object, and `process.env.ENV` using `config-plus`.
5. Apply the merged log configuration with `updateLog`.
6. Create the Express application.
7. Construct `MiddlewareLogger` with request-context, response-mask, and request-mask callbacks.
8. Install CORS/allow rules, JSON parsing, and the middleware logger.
9. Create the MySQL pool using `cfg.db`.
10. Build the application context with `useContext(pool, logger, middleware)`.
11. Register routes with `route(app, ctx)`.
12. Start an HTTP server on `cfg.port`.

The startup log uses `console.log` and prints the configured port.

## 2. Configuration

Source: `src/config.ts`.

| Config section | Current default behavior |
|---|---|
| `port` | `8080` |
| `allow` | Origin `*`, credentials string `"true"`, methods `GET,PUT,POST,DELETE,OPTIONS,PATCH`, headers `*` |
| `log` | Level `info`, maps time to `@timestamp` and message to `message` |
| `middleware` | Logging enabled; skip list `health,log,middleware`; field names configured for request, response, status, and size |
| `db` | MySQL host `127.0.0.1`, port `3306`, user `root`, database `masterdata`, and a literal password fallback in source |

The source defines two environment presets:

- `sit`: database name becomes `masterdata_sit`.
- `prd`: log level becomes `error` and middleware logging is disabled.

`app.ts` passes `process.env.ENV` as the final environment selector to `merge`. The archive's `.env` contains the keys `DB_DATABASE`, `DB_PASSWORD`, and `ENV`. The exact mapping and precedence of environment variables are determined by the installed `config-plus` package; verify that contract before adding new variable names or relying on merge precedence.

### Secret handling

The checked-in source config contains a literal database password fallback, and the project archive contains a `.env` file. Do not copy any credential values to documentation, examples, tests, or logs. Production secrets should be supplied through a secure environment/secret mechanism, not committed source defaults.

## 3. Express middleware and request context

`app.ts` installs middleware in this order:

```ts
app.use(allow(cfg.allow), json(), middleware.log)
```

The `MiddlewareLogger` receives three project callbacks:

- `buildContext(req, context)` copies `X-Request-ID` and `X-Correlation-ID` headers into `context.requestId` and `context.correlationId`, defaulting each to an empty string.
- `encryptResponse(rs)` attempts to parse a JSON response string and masks top-level `phone` and `email` values before serializing it again. On parse failure, it logs an error and returns the original response string.
- `encryptRequest(body)` masks top-level `phone` and `email` properties on the object it receives, then JSON-stringifies the value.

Despite the callback names `encryptRequest` and `encryptResponse`, the visible implementation performs masking, not cryptographic encryption. The `mask` helper is imported from `middleware-logging`.

The masking logic shown here only checks top-level `phone` and `email` properties; no recursive traversal is implemented in these functions. Both helpers use two visible leading/trailing characters and `*` for the masked middle according to the arguments passed to `mask`.

`encryptRequest` mutates the object it receives before serializing it. Do not change this behavior or assume how/when the middleware invokes it without checking the `middleware-logging` contract; the source only establishes the callback implementation.

## 4. Application context and health

Source: `src/context.ts`.

`ApplicationContext` exposes:

- `health: HealthController`
- `log: LogController`
- `middleware: MiddlewareController`
- `user: UserController`

`useContext` creates:

- `PoolManager` from the MySQL pool.
- `LogController` using the logger and `updateLogger`.
- `MiddlewareController` using the configured middleware logger.
- `MySQLChecker` from `pool.promise()`.
- `HealthController` with the MySQL checker.
- `UserController` from `useUserController(db)`.

The health controller is therefore configured with a MySQL database checker in this snapshot. Do not document or promise other health probes unless they are added to the context.

## 5. Build and scripts

The package scripts are:

| Script | Command/behavior |
|---|---|
| `start` | `nodemon --exec ts-node-dev src/app` |
| `dev` | Same as `start` |
| `build` | `webpack --config webpack.config.js` |
| `prod` | `node dist/app` |
| `test` | Placeholder that exits with an error |
| `lint` | `eslint -c .eslintrc.js --ext .ts src` |

`webpack.config.js` targets Node, uses `ts-loader` for `.ts` files, resolves `.ts` and `.js`, writes `dist/app.js`, and adds `BundleAnalyzerPlugin`.

`tsconfig.json` has `strict: true`, `target: "es6"`, `module: "nodenext"`, `moduleResolution: "nodenext"`, `esModuleInterop: true`, and `skipLibCheck: true`. It includes `src/**/*.ts` and excludes `node_modules`.

The supplied archive does not include `.eslintrc.js`, and `eslint` is not declared in the listed dependencies. As a result, the `lint` script is not verifiably runnable from this archive without additional setup. There is no configured test framework or test suite.
