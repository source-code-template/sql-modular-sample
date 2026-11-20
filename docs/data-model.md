# Data model: users

## 1. Supplied SQL schema

The user-provided schema for this project is:

```sql
create table if not exists users (
  id varchar(40) primary key,
  username varchar(120),
  email varchar(120),
  phone varchar(45),
  date_of_birth datetime
);
```

| SQL column | SQL type | Primary key | Nullable from this DDL |
|---|---|---:|---:|
| `id` | `varchar(40)` | Yes | No |
| `username` | `varchar(120)` | No | Yes |
| `email` | `varchar(120)` | No | Yes |
| `phone` | `varchar(45)` | No | Yes |
| `date_of_birth` | `datetime` | No | Yes |

Only `id` is constrained as a primary key. The other columns do not have `NOT NULL` constraints in the supplied DDL. This table contains no declared indexes other than the primary key, no foreign keys, and no default values.

## 2. TypeScript entity and filter

Source: `src/user/user.ts`.

```ts
export interface UserFilter extends Filter {
  id: string
  username: string
  email?: string
  phone?: string
  dateOfBirth?: Date | DateRange
}

export interface User {
  id: string
  username: string
  email?: string
  phone?: string
  dateOfBirth?: Date
}
```

The TypeScript entity requires `id` and `username`; `email`, `phone`, and `dateOfBirth` are optional. The filter also requires `id` and `username` at the TypeScript type level, while its other three fields are optional. `dateOfBirth` in the filter accepts `DateRange` as well as `Date`.

## 3. Existing model metadata

Source: `src/user/user.ts`.

| TypeScript property | Metadata | Mapping / notes |
|---|---|---|
| `id` | `key: true`, `length: 40` | Maps to primary key `id`; no explicit `required: true` is present |
| `username` | `required: true`, `length: 255`, `resource: "username"` | Implicit same-name column mapping in the current model |
| `email` | `format: "email"`, `required: true`, `length: 120`, `resource: "email"` | TypeScript property is optional despite validation required flag |
| `phone` | `format: "phone"`, `required: true`, `length: 14`, `resource: "phone"` | TypeScript property is optional despite validation required flag |
| `dateOfBirth` | `column: "date_of_birth"`, `type: "datetime"`, `resource: "date_of_birth"` | Explicit camelCase-to-snake_case SQL column mapping |

The SQL repository passes this metadata into the shared repository base:

```ts
export class SqlUserRepository extends Repository<User, string, UserFilter> implements UserRepository {
  constructor(db: DB) {
    super(db, "users", userModel)
  }
}
```

## 4. Known inconsistencies — do not silently normalize

There are differences between three separate contracts: SQL nullability/lengths, TypeScript optionality, and validation metadata.

| Field | Supplied SQL DDL | TypeScript `User` | `userModel` metadata | Difference |
|---|---|---|---|---|
| `id` | `varchar(40)` primary key, not nullable | Required `string` | `key: true`, length 40 | No explicit `required: true` metadata |
| `username` | `varchar(120)`, nullable | Required `string` | Required, length 255 | Metadata allows a longer value than the SQL column; SQL permits null but application metadata says required |
| `email` | `varchar(120)`, nullable | Optional `string` | Required, email format, length 120 | TypeScript optionality and SQL nullability differ from validation requirement |
| `phone` | `varchar(45)`, nullable | Optional `string` | Required, phone format, length 14 | Metadata length 14 differs from SQL length 45; optionality/nullability differ from validation requirement |
| `dateOfBirth` / `date_of_birth` | `datetime`, nullable | Optional `Date` | `datetime`, explicit column mapping | No obvious length/nullability conflict |

### Instructions for future changes

- Treat the supplied DDL as the database schema contract unless the user supplies a newer schema or explicitly asks to change it.
- Do not assume that nullable SQL columns must be required in API validation; that is a product/API decision, not established by this DDL.
- Do not assume that TypeScript optionality automatically controls validation behavior.
- If changing the `users` model, explicitly decide whether `username` validation length should match 120 and whether `phone` validation length should match 45. Do not change these values silently because they may be intentional API validation limits, even though they differ from storage capacity.
- If changing requiredness, consider the SQL DDL, TypeScript interface, `userModel`, and existing clients together.
- Do not add `NOT NULL`, defaults, indexes, or constraints to the schema without a requirement.
- Check the validation/persistence library contracts before assuming the exact semantics of `key`, `required`, `length`, or `type` metadata.

## 5. Field naming and mapping

The public TypeScript property uses camelCase (`dateOfBirth`) while the database column uses snake_case (`date_of_birth`). The model declares the mapping explicitly with `column: "date_of_birth"`.

The other current properties (`id`, `username`, `email`, and `phone`) have the same names as their SQL columns and have no explicit `column` mapping in the model.

For future fields:

1. Confirm the exact SQL column name and type.
2. Choose a TypeScript property name consistent with the feature's existing conventions.
3. Add explicit `column` metadata when the names differ.
4. Keep the entity type, filter type, metadata, and actual DDL aligned with the agreed contract.

## 6. Date handling

The entity property is `dateOfBirth?: Date`. The metadata maps it to SQL `datetime` and column `date_of_birth`.

In `UserController.search`, the request filter is parsed with `fromRequest<UserFilter>(req, ["fields"])`, then `format(filter, ["dateOfBirth"])` is called before service search. This is the only explicit date formatting operation visible in the project source. Do not assume undocumented accepted date formats or serialization rules; verify `express-web-kit` and persistence-library behavior before expanding the contract.
