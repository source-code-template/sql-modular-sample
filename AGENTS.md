# Instructions for AI coding agents

## Mission

Make changes that fit the existing TypeScript project structure and coding style. Prefer the smallest change that completes the requested feature while preserving the current modular design. Do not turn this sample into a different framework or introduce new architectural layers without an explicit requirement.

## Read these files first

1. `README.md` for the human overview and setup.
2. `docs/architecture.md` for the module dependency direction and feature workflow.
3. `docs/coding-conventions.md` for code style.
4. `docs/data-model.md` before touching SQL mappings, entities, filters, or validation metadata.
5. `docs/http-api.md` before changing routes or controller behavior.
6. `docs/runtime-configuration.md` before changing application setup, configuration, middleware, logging, or health checks.

When a task concerns a particular feature, read every source file in that feature before editing it. Treat source code as the actual current behavior; these documents describe the supplied snapshot and must be updated when the implementation intentionally changes.

## Source-of-truth rules

- Follow the user's explicit task and the existing source code. Do not silently infer requirements that are not present.
- For the `users` table, the SQL DDL supplied with the task is the database design. Its column names and lengths are recorded in `docs/data-model.md`.
- The existing `userModel` validation metadata conflicts with that DDL in a few places. Do not silently copy those mismatches into new code or silently change existing runtime validation. When a task touches one of the mismatched fields, identify the conflict and either preserve current behavior when compatibility is required or explicitly align it when the task authorizes that change.
- Do not assume that a database column is `NOT NULL` unless the DDL or a confirmed migration says so.
- Do not invent SQL migrations, indexes, relationships, API payload formats, search syntax, response shapes, or library behavior. Check project source and installed library contracts first.
- Do not expose, copy, or commit `.env` values, passwords, tokens, or other secrets. The supplied `src/config.ts` also contains a literal database-password fallback; do not repeat it in generated files.
- Distinguish behavior implemented in this repository from behavior supplied by `express-web-kit`, `onecore`, `sql-core`, `mysql2-core`, and other dependencies.

## Architecture rules

For a new business module, use the current `src/user` module as the primary example:

1. `<feature>/<feature>.ts`: define the entity interface, filter interface, repository interface, service interface, and `Attributes` model metadata when the feature needs SQL mapping/validation metadata.
2. `<feature>/repository.ts`: implement the feature repository by extending the appropriate `sql-core` `Repository` base and passing the database, table name, and model to `super`.
3. `<feature>/service.ts`: implement the use case by extending the appropriate `onecore` `UseCase` base and passing the repository to `super` when generic CRUD behavior is sufficient.
4. `<feature>/controller.ts`: translate Express requests into service calls and map results/errors to HTTP responses. Bind instance handler methods in the constructor, as `UserController` does.
5. `<feature>/index.ts`: export the feature's public contracts/controller and provide a `use<Feature>Controller(db)` factory that constructs repository → use case → controller.
6. `src/context.ts`: add the controller to `ApplicationContext` and construct it inside `useContext`.
7. `src/route.ts`: register HTTP routes and attach validation middleware where appropriate.
8. `src/resources/en.ts` and `src/resources/vi.ts`: add localized field labels or validation messages when the model metadata refers to resource keys.
9. `README.md` and relevant `docs/*.md`: update them when the new module changes project capabilities, routes, configuration, or architecture.

Do not add every layer mechanically if a task does not need it. For example, do not create a SQL repository for a feature that has no persistence requirement. Preserve the responsibility boundaries that the task needs.

## Controller behavior pattern

- Use `Request` and `Response` from Express.
- Use the relevant helpers from `express-web-kit` rather than creating parallel helper abstractions without a reason.
- Use `getResource(req)` when validation messages are localized.
- Use `validate<Entity>(...)` with the feature's model metadata when controller-level validation is needed.
- Return validation errors using `getStatusCode(errors)` and `.json(errors).end()`, following the current controller pattern.
- Wrap asynchronous service calls in `try/catch` and pass caught errors to `handleError(err, res)` unless the task establishes a different project-wide convention.
- Choose HTTP status codes based on the operation's actual result and existing API semantics; do not copy user-specific status behavior blindly to unrelated resources.
- If an Express handler is an instance method, bind it in the constructor so `this` remains correct when the handler is passed to `app.get`, `app.post`, etc.

## Repository and service pattern

- Keep SQL access in repository classes, not in Express controllers.
- Keep application/use-case coordination in service classes, not in route registration.
- Reuse the generic `Repository` and `UseCase` base classes when their contracts fit the feature.
- Keep feature repository and service interfaces in the feature contract file, following `UserRepository` and `UserService`.
- Use the project's existing `DB` abstraction for repository construction; do not couple a feature repository directly to the raw MySQL pool unless the task requires a driver-specific operation.

## TypeScript and formatting

- Use strict TypeScript types; avoid introducing `any` unless a dependency or boundary forces it.
- Use `interface` for object/entity contracts, as in the current source.
- Use `PascalCase` for classes and interfaces, `camelCase` for variables, functions, properties, and file-local values.
- Use double-quoted imports and string literals.
- Omit semicolons.
- Use two-space indentation and trailing commas where supported.
- Prefer named exports and explicit exported factory functions.
- Use `async`/`await` for asynchronous controller operations.
- Keep imports at the top of the file and group them by external package then local module, matching the existing source.
- Keep code formatting compatible with `.prettierrc.json` (`printWidth: 260`, `tabWidth: 2`, `trailingComma: all`, `semi: false`, `singleQuote: false`).
- Do not reformat unrelated files as part of a focused feature change.

## Routing and module registration

- Keep Express route declarations in `src/route.ts`.
- Keep dependency construction in `src/context.ts` and feature factories in each feature's `index.ts`.
- Add the relevant controller to `ApplicationContext` instead of constructing a repository or service inside a route handler.
- Register static paths such as `/users/search` before parameterized paths such as `/users/:id`, as the current route file does.
- Reuse the existing middleware composition and validation approach unless the task calls for a deliberate change.

## Validation and database mapping

- Define field mappings in the feature's `Attributes` object when using the shared model/repository approach.
- Use the `column` metadata property for explicit database column names that differ from the TypeScript property name, as shown by `dateOfBirth` → `date_of_birth`.
- Record lengths, formats, required flags, and resource keys in the model metadata only after checking the actual schema and desired API contract.
- Keep TypeScript optionality, validation `required` flags, and SQL nullability consistent when the task is to establish a new contract.
- Do not assume `key: true` is equivalent to a `required: true` validation rule; inspect the library contract if that distinction matters.

## Testing and verification

- The supplied project has no configured test suite: `npm test` is a placeholder that exits with an error.
- The `lint` script points to `.eslintrc.js`, which is absent from the supplied archive, and ESLint is not listed in the supplied dependencies. Do not claim lint passed unless the configuration is repaired and the command actually runs.
- After a code change, run the strongest available checks. At minimum, try the TypeScript/build command when dependencies are installed and report accurately which checks ran or could not run.
- Add tests only when a test framework has been selected or already exists in the working project; do not invent a framework and claim it is configured.

## Scope discipline

- Do not rename public routes, model fields, interfaces, exported symbols, package dependencies, or module paths unless requested or necessary for the feature.
- Avoid adding abstractions, dependencies, or generic frameworks for a single small use case.
- Preserve backwards compatibility unless the task explicitly permits a breaking change.
- Update documentation when behavior changes; do not leave AI guidance describing obsolete behavior.
