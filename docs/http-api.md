# HTTP API reference

Routes are registered in `src/route.ts`. The user handlers are implemented by `UserController` in `src/user/controller.ts`.

## Routes

| Method | Path | Handler | Current behavior |
|---|---|---|---|
| `GET` | `/health` | `ctx.health.check` | Delegates to `HealthController` |
| `PATCH` | `/log` | `ctx.log.config` | Delegates log configuration |
| `PATCH` | `/middleware` | `ctx.middleware.config` | Delegates middleware configuration |
| `POST` | `/users/search` | `ctx.user.search` | Searches users |
| `GET` | `/users/search` | `ctx.user.search` | Searches users |
| `GET` | `/users/:id` | `ctx.user.load` | Loads one user by ID |
| `POST` | `/users` | `ctx.user.create` | Creates a user |
| `PUT` | `/users/:id` | `ctx.user.update` | Updates a user identified by path ID |
| `PATCH` | `/users/:id` | `ctx.user.patch` | Partially updates a user identified by path ID |
| `DELETE` | `/users/:id` | `ctx.user.delete` | Deletes a user by ID |

The static `/users/search` routes are registered before `/users/:id`.

## Request handling

### Search — `GET /users/search` and `POST /users/search`

- Calls `fromRequest<UserFilter>(req, ["fields"])` to create the filter.
- Calls `format(filter, ["dateOfBirth"])` before searching.
- Calls `service.search(filter, limit, page, fields)`.
- Returns the result with status `200`.
- Caught errors are passed to `handleError(err, res)`.

The source does not define the complete query-parameter/body grammar or the result object's structure. Those details are supplied by the shared request/repository libraries and must be verified before writing client examples or compatibility guarantees.

### Load — `GET /users/:id`

- Reads `req.params.id` as a string.
- Calls `service.load(id)`.
- Returns status `200` when a user is returned; otherwise status `404`.
- The returned user value (or `null`/undefined value from the service) is passed to `res.json` as-is.

### Create — `POST /users`

- Obtains the language resource using `getResource(req)`.
- Treats `req.body` as `User`.
- Calls `validate<User>(user, userModel, resource)` in the controller.
- Returns validation errors with `getStatusCode(errors)` when any are present.
- Calls `service.create(user)` otherwise.
- Returns `201` when `isSuccessful(result)` is true; otherwise `409`.

The route also attaches `check(userModel)` as middleware to this endpoint. Therefore, validation-related logic exists both at route middleware level and inside the controller. Check both paths and the dependency contracts before removing or changing either one.

### Update — `PUT /users/:id`

- Reads the body as `User`.
- Assigns the URL parameter to `user.id`, overwriting any body-supplied ID.
- Validates using `validate<User>(user, userModel, resource)`.
- Calls `service.update(user)`.
- Returns `200` when successful; otherwise `404`.

The route also attaches the shared `check(userModel)` middleware.

### Patch — `PATCH /users/:id`

- Reads the body as `User`.
- Assigns the URL parameter to `user.id`.
- Calls `validate<User>(user, userModel, resource, false, true)`.
- Calls `service.patch(user)`.
- Returns `200` when successful; otherwise `404`.

The route attaches the same `check(userModel)` middleware used by create and update. The meaning of the final boolean arguments to `validate` is not defined in this repository; do not change them without checking the `validation-core` contract.

### Delete — `DELETE /users/:id`

- Reads the URL parameter as a string.
- Calls `service.delete(id)`.
- Returns the affected count as the JSON body.
- Returns status `200` when the count is greater than zero; otherwise `410`.

## Validation and errors

- The shared model metadata is `userModel` from `src/user/user.ts`.
- Route-level validation middleware is created using `check(userModel)` from `express-web-kit`.
- Controller-level validation uses `validate` from `validation-core` and language resources from `src/resources`.
- Validation status codes are selected by `getStatusCode(errors)`.
- Caught service/controller errors are handled by `handleError(err, res)`.

Do not introduce a new error envelope or status-code convention without an explicit API requirement. Keep existing endpoint compatibility in mind.

## Controller implementation checklist

When adding a similar endpoint:

- Add its route in `src/route.ts`.
- Add/bind the corresponding method in the feature controller constructor.
- Parse input using existing `express-web-kit` helpers when suitable.
- Validate with the feature model and localized resources when required.
- Delegate application behavior to the service.
- Handle errors with the established helper.
- Document status codes and request/response contracts only when they are known.
