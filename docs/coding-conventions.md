# Coding conventions

This guide records conventions observed in the supplied TypeScript source and formatting configuration. Treat the actual surrounding file as the final style reference when a convention is not explicitly stated here.

## Formatting

`.prettierrc.json` specifies:

```json
{
  "printWidth": 260,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": false
}
```

Apply these rules:

- Two spaces for indentation.
- Double quotes for strings and imports.
- No semicolons.
- Trailing commas where supported.
- A wide print width of 260 characters.

The TypeScript files generally follow these settings. `webpack.config.js` is CommonJS configuration and has some formatting differences; do not use it as the TypeScript style template.

## Naming

- Classes and interfaces: `PascalCase` (`UserController`, `UserRepository`, `ApplicationContext`).
- Variables, functions, properties, and methods: `camelCase` (`useContext`, `userModel`, `dateOfBirth`).
- Module folders and source files: lowercase feature names (`src/user/user.ts`, `src/user/controller.ts`).
- Shared feature factory: `use<Feature>Controller`, for example `useUserController`.
- Model metadata constant: `<feature>Model`, for example `userModel`.

## Imports and exports

- Keep imports at the top of each file.
- Use double-quoted module paths.
- Import external dependencies before local relative modules, as seen in the current source.
- Prefer named exports.
- A feature `index.ts` acts as its module entry point and re-exports public contracts/controller symbols.
- Use explicit exported factory functions for dependency construction.

## Types and interfaces

- `tsconfig.json` enables `strict: true`; preserve strict typing.
- Use interfaces for entity, filter, repository, service, and application-context contracts.
- Use generic shared contracts from `onecore` and `sql-core` when they fit.
- Use `Date` for the TypeScript `dateOfBirth` field in the current user model; the search filter additionally allows `DateRange`.
- Avoid `any`; the existing use in request masking is a boundary-level exception, not a general pattern.

## Classes and dependency injection

- Use constructor injection for controllers, repositories, and use cases.
- Keep constructors small and focused on storing dependencies or forwarding them to a base class.
- Bind Express handler instance methods in the controller constructor before passing them to Express.
- Keep feature object construction in the feature's `index.ts` factory, then call the factory from `useContext`.

## Asynchronous HTTP handlers

The current controller style is:

1. Parse request data before the service call.
2. Enter `try` and `await` the service operation.
3. Map the result to an HTTP status and response body.
4. In `catch`, call `handleError(err, res)`.

Validation is performed before the service call in create/update/patch handlers using the feature model and localized resource map. Preserve the exact validation helper signatures used in nearby code unless the validation dependency contract has been checked.

## Model metadata

Use an exported `Attributes` constant to describe validation and persistence metadata. Existing examples include:

- `key: true` for the primary identifier field.
- `length` for field length limits.
- `required: true` for required validation fields.
- `format: "email"` and `format: "phone"` for formats.
- `resource` for localized labels.
- `column` when the SQL column name differs from the TypeScript property.
- `type: "datetime"` for the current date-of-birth mapping.

Do not infer the exact semantics of metadata flags from their names alone. Consult dependency contracts if changing how they behave.

## Localization

- English strings live in `src/resources/en.ts`.
- Vietnamese strings live in `src/resources/vi.ts`.
- `src/resources/index.ts` combines the dictionaries and exposes `getResource`.
- Model metadata references resource keys such as `username`, `email`, `phone`, and `date_of_birth`.

When adding a localized model field, add the corresponding resource key to both languages unless the feature explicitly supports a different fallback policy.

## Keep changes focused

- Follow the existing small-module pattern instead of adding a large framework layer.
- Do not reformat unrelated source files.
- Do not add dependencies for behavior already supplied by the current dependency stack.
- Keep route declarations, dependency construction, business logic, and SQL persistence in their current separate responsibilities.
