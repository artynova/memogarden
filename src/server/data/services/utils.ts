import {
    Column,
    InferModelFromColumns,
    isNull,
    MapColumnName,
    sql,
    SQL,
    SQLWrapper,
} from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

/**
 * Item in a group of columns, potentially with an alias specified via a tuple.
 */
export type ColumnGroupItem = PgColumn | readonly [PgColumn, string];

/**
 * Array defining a group of columns, each potentially with an
 * alias (in which case the respective array element is a tuple).
 */
export type ColumnGroup = readonly ColumnGroupItem[];

/**
 * Mapping of column aliases to columns.
 */
export type ColumnMapping = Record<string, PgColumn>;

/**
 * Extracts the const name type of a column (or the explicit alias provided via a tuple) from the column group item type.
 */
export type ColumnNameFromGroupItem<E extends ColumnGroupItem> = E extends PgColumn // Check if the type is just that of a column
    ? MapColumnName<"", E, true> // Retrieve column's own name
    : E extends readonly [PgColumn, string] // If E does not extend PgColumn, then it definitely has to extend the tuple type; this condition is only used as an assertion for the positive branch
      ? E[1] // Use the alias
      : never;

/**
 * Extracts the type of a column from the column group item type.
 */
export type ColumnFromGroupItem<E extends ColumnGroupItem> = E extends PgColumn
    ? E
    : E extends readonly [PgColumn, string]
      ? E[0]
      : never;

/**
 * Determines the type of the column mapping (object mapping column name strings to column objects) based on the
 * column group type.
 */
export type ColumnMappingFromGroup<T extends ColumnGroup> = {
    readonly [K in T[number] as ColumnNameFromGroupItem<K>]: ColumnFromGroupItem<K>;
};

/**
 * Generates a column mapping (object mapping column name strings to column objects)
 * based on a column group (i.e., an array).
 *
 * @param columns Column group.
 * @returns Column mapping.
 */
export function toColumnMapping<T extends ColumnGroup>(columns: T) {
    return Object.fromEntries(
        columns.map((column) =>
            column instanceof PgColumn ? [column.name, column] : [column[1], column[0]],
        ),
    ) as ColumnMappingFromGroup<T>;
}

/**
 * Infers the type of the plain object corresponding to a SELECT operation involving the given
 * column group.
 */
export type InferSelectModelFromGroup<T extends ColumnGroup> = InferModelFromColumns<
    ColumnMappingFromGroup<T>
>;

/**
 * Infers the type of the plain object corresponding to an INSERT operation involving the given
 * column group.
 */
export type InferInsertModelFromGroup<T extends ColumnGroup> = InferModelFromColumns<
    ColumnMappingFromGroup<T>,
    "insert"
>;

// Utility types for defining getNames overloads
/**
 * Infers the const type of the column names array based on the column group type.
 */
type ColumnNamesFromGroup<T extends ColumnGroup> = {
    readonly [K in keyof T]: ColumnNameFromGroupItem<T[K]>;
};

// Credit for key extraction code: https://stackoverflow.com/a/70061272
type UnionToParameter<U> = U extends unknown ? (k: U) => void : never;
type UnionToIntersection<U> = UnionToParameter<U> extends (k: infer I) => void ? I : never;
type ExtractParameter<F> = F extends { (a: infer A): void } ? A : never;
type ExtractOne<Union> = ExtractParameter<UnionToIntersection<UnionToParameter<Union>>>;
type SpliceOne<Union> = Exclude<Union, ExtractOne<Union>>;
type ColumnNamesFromMappingRecursive<T extends ColumnMapping, Result extends readonly unknown[]> =
    SpliceOne<keyof T> extends never
        ? [ExtractOne<keyof T>, ...Result]
        : ColumnNamesFromMappingRecursive<
              Pick<T, SpliceOne<keyof T>>,
              [ExtractOne<keyof T>, ...Result]
          >;
/**
 * Infers the const type of the column names array based on the column mapping type.
 */
type ColumnNamesFromMapping<T extends ColumnMapping> = ColumnNamesFromMappingRecursive<T, []>;

/**
 * Retrieves column names (either inferred names or explicit aliases) from a column group in a type-safe way.
 *
 * @param columns Column group.
 * @returns Array of name strings (const values are preserved if the input group is also marked as const).
 */
export function getNames<T extends ColumnGroup>(columns: T): ColumnNamesFromGroup<T>;

/**
 * Retrieves column names from a column mapping in a type-safe way.
 *
 * @param columns Column mapping.
 * @returns Array of name strings (const values are preserved if the input mapping is also marked as const).
 */
export function getNames<T extends ColumnMapping>(columns: T): ColumnNamesFromMapping<T>;

/**
 * Retrieves column names in a type-safe way.
 *
 * @param columns Column group or mapping.
 * @returns Array of name strings (const values are preserved if the input mapping is also marked as const).
 */
export function getNames(columns: unknown) {
    if (Array.isArray(columns)) {
        return columns.map((column: ColumnGroupItem) =>
            column instanceof PgColumn ? column.name : column[1],
        );
    }
    return Object.keys(columns as ColumnMapping) as unknown[]; // Cast to avoid false compiler issues with the respective overload signature
}

// Utility types for defining makeInsertPlaceholders overloads
/**
 * Infers the insert placeholder mapping type based on the names array type.
 */
type InsertPlaceholdersFromNames<T extends readonly string[]> = {
    [K in T[number]]: ReturnType<typeof sql.placeholder>;
};
/**
 * Infers the insert placeholder mapping type based on the column group type.
 */
type InsertPlaceholdersFromGroup<T extends ColumnGroup> =
    ColumnNamesFromGroup<T> extends readonly string[]
        ? InsertPlaceholdersFromNames<ColumnNamesFromGroup<T>>
        : never;
/**
 * Infers the insert placeholder mapping type based on the column mapping type.
 */
type InsertPlaceholdersFromMapping<T extends ColumnMapping> =
    ColumnNamesFromMapping<T> extends readonly string[]
        ? InsertPlaceholdersFromNames<ColumnNamesFromMapping<T>>
        : never;

/**
 * Creates a mapping of string labels to SQL placeholders, each of which uses its respective label string as its name.
 * Intended to be used for configuring prepared INSERT statements.
 *
 * @param labels Label strings.
 * @returns A mapping of placeholder labels to placeholder objects, e.g., ```{colName: sql.placeholder("colName")}```.
 */
export function makeInsertPlaceholders<T extends readonly string[]>(
    labels: T,
): InsertPlaceholdersFromNames<T>;

/**
 * Creates a mapping of string labels to SQL placeholders, each of which uses its respective label string as its name.
 * Intended to be used for configuring prepared INSERT statements.
 *
 * @param columns Column group.
 * @returns A mapping of placeholder labels to placeholder objects, e.g., ```{colName: sql.placeholder("colName")}```.
 */
export function makeInsertPlaceholders<T extends ColumnGroup>(
    columns: T,
): InsertPlaceholdersFromGroup<T>;

/**
 * Creates a mapping of string labels to SQL placeholders, each of which uses its respective label string as its name.
 * Intended to be used for configuring prepared INSERT statements.
 *
 * @param columns Column mapping.
 * @returns A mapping of placeholder labels to placeholder objects, e.g., ```{colName: sql.placeholder("colName")}```.
 */
export function makeInsertPlaceholders<T extends ColumnMapping>(
    columns: T,
): InsertPlaceholdersFromMapping<T>;

/**
 * Creates a mapping of string labels to SQL placeholders, each of which uses its respective label string as its name.
 * Intended to be used for configuring prepared INSERT statements.
 *
 * @param input Column group, mapping, or array of label strings.
 * @returns A mapping of placeholder labels to placeholder objects, e.g., ```{colName: sql.placeholder("colName")}```.
 */
export function makeInsertPlaceholders(input: unknown) {
    if (!Array.isArray(input)) {
        return makeInsertPlaceholders(getNames(input as ColumnMapping));
    }
    if (input.length < 1) {
        return {}; // If an empty array gets passed in any scenario, the resulting placeholders map is also empty
    }
    if (typeof input[0] === "string") {
        return Object.fromEntries(input.map((label: string) => [label, sql.placeholder(label)])); // Base case, an array of name strings was passed
    }
    return makeInsertPlaceholders(getNames(input as ColumnGroup));
}

// Utility types for defining makeUpdatePlaceholders overloads. The difference with insert placeholders is that placeholders for updates in Drizzle ORM need to be wrapped in SQL strings because of the restrictive interface
/**
 * Infers the update placeholder mapping type based on the names array type.
 */
type UpdatePlaceholdersFromNames<T extends readonly string[]> = {
    [K in T[number]]: ReturnType<typeof sql>;
};
/**
 * Infers the update placeholder mapping type based on the column group type.
 */
type UpdatePlaceholdersFromGroup<T extends ColumnGroup> =
    ColumnNamesFromGroup<T> extends readonly string[]
        ? UpdatePlaceholdersFromNames<ColumnNamesFromGroup<T>>
        : never;
/**
 * Infers the update placeholder mapping type based on the column mapping type.
 */
type UpdatePlaceholdersFromMapping<T extends ColumnMapping> =
    ColumnNamesFromMapping<T> extends readonly string[]
        ? UpdatePlaceholdersFromNames<ColumnNamesFromMapping<T>>
        : never;

/**
 * Similar to {@linkcode makeInsertPlaceholders} but returns SQL strings instead of simply placeholders, accommodating
 * Drizzle's outdated signatures for prepared UPDATE statements. The SQL strings are generated by wrapping the
 * placeholders in Drizzle's "magic sql`` operator".
 *
 * @param labels Label strings, same as in {@linkcode makeInsertPlaceholders}.
 * @returns A mapping of placeholder labels to SQL objects wrapping respective placeholders.
 */
export function makeUpdatePlaceholders<T extends readonly string[]>(
    labels: T,
): UpdatePlaceholdersFromNames<T>;

/**
 * Similar to {@linkcode makeInsertPlaceholders} but returns SQL strings instead of simply placeholders, accommodating
 * Drizzle's outdated signatures for prepared UPDATE statements. The SQL strings are generated by wrapping the
 * placeholders in Drizzle's "magic sql`` operator".
 *
 * @param columns Column group, same as in {@linkcode makeInsertPlaceholders}.
 * @returns A mapping of placeholder labels to SQL objects wrapping respective placeholders.
 */
export function makeUpdatePlaceholders<T extends ColumnGroup>(
    columns: T,
): UpdatePlaceholdersFromGroup<T>;

/**
 * Similar to {@linkcode makeInsertPlaceholders} but returns SQL strings instead of simply placeholders, accommodating
 * Drizzle's outdated signatures for prepared UPDATE statements. The SQL strings are generated by wrapping the
 * placeholders in Drizzle's "magic sql`` operator".
 *
 * @param columns Column mapping, same as in {@linkcode makeInsertPlaceholders}.
 * @returns A mapping of placeholder labels to SQL objects wrapping respective placeholders.
 */
export function makeUpdatePlaceholders<T extends ColumnMapping>(
    columns: T,
): UpdatePlaceholdersFromMapping<T>;

/**
 * Similar to {@linkcode makeInsertPlaceholders} but returns SQL strings instead of simply placeholders, accommodating
 * Drizzle's outdated signatures for prepared UPDATE statements. The SQL strings are generated by wrapping the
 * placeholders in Drizzle's "magic sql`` operator".
 *
 * @param input Column group, mapping, or array of label strings, same as in {@linkcode makeInsertPlaceholders}.
 * @returns A mapping of placeholder labels to SQL objects wrapping respective placeholders.
 */
export function makeUpdatePlaceholders(input: unknown) {
    if (!Array.isArray(input)) {
        return makeUpdatePlaceholders(getNames(input as ColumnMapping));
    }
    if (input.length < 1) {
        return {};
    }
    if (typeof input[0] === "string") {
        return Object.fromEntries(
            input.map((label: string) => [label, sql`${sql.placeholder(label)}`]),
        );
    }
    return makeUpdatePlaceholders(getNames(input as ColumnGroup));
}

/**
 * Any table that has the "deletedAt" column, which marks any row as soft-deleted (no longer generally accessible)
 * when it is filled out with a timestamp. The row still remains in the database, e.g., for data aggregation or
 * statistical purposes.
 */
export type TableWithSoftDelete = {
    /**
     * Column storing the date of the object's deletion.
     */
    deletedAt: PgColumn;
};

/**
 * Checks whether a row in the table was soft-deleted, based on the presence / absence of a value in
 * the table's "deletedAt" field.
 *
 * @param table The table (must support soft-delete via "deletedAt").
 * @returns `false` if deleted, `true` otherwise.
 */
export function isNotDeleted(table: TableWithSoftDelete) {
    return isNull(table.deletedAt);
}

/**
 * Creates a mapping for the "set" part of an update query that will assign the current timestamp to the "deletedAt"
 * timestamp field.
 *
 * @returns The update query mapping.
 */
export function makeDeletedAt() {
    return {
        deletedAt: sql`NOW
        ()`,
    };
}

/**
 * Shortcut for creating an equality check with an automatic (based on the column) or custom-labeled placeholder.
 *
 * @param column Column.
 * @param name Custom placeholder name, will be inferred from the column if not specified.
 * @returns Equality check SQL with the placeholder.
 */
export function eqPlaceholder(column: PgColumn, name?: string) {
    return sql<boolean>`(${column} = ${sql.placeholder(name ?? column.name)})`;
}

/**
 * Compares the result of a SQL expression against a given value, bypassing the check and yielding TRUE if
 * the value evaluates to NULL.
 *
 * @param column SQL expression.
 * @param value Value being compared against.
 * @param useGenericComparison Whether to cast the column to TEXT, thus avoiding any implicit casts of the value to the
 * column's type when comparing the two. Enabled by default.
 * @returns Optional equality check SQL.
 */
export function eqOptional(
    column: Column | SQL.Aliased | SQL,
    value: string | SQLWrapper,
    useGenericComparison = true,
) {
    const preparedColumn = useGenericComparison
        ? sql`CAST(
            ${column}
            AS
            TEXT
            )`
        : column;
    return sql<boolean>`(CAST (${value} AS TEXT) IS NULL OR ${preparedColumn} = ${value})`; // Bypass the comparison and immediately yield TRUE for value NULL. In the NULL check, the value is cast to TEXT regardless of the generic comparison mode because the specific type does not actually matter for the nullity check
}

/**
 * Shortcut for creating an optional equality check with an automatic (based on the column) or
 * custom-labeled placeholder.
 *
 * @param column Column.
 * @param name Custom placeholder name, will be inferred from the column if not specified.
 * @param useGenericComparison Whether to cast the column to TEXT, thus avoiding any implicit casts of the value to the
 * column's type. Enabled by default.
 * @returns Optional equality check SQL with the placeholder.
 */
export function eqOptionalPlaceholder(
    column: PgColumn,
    name?: string,
    useGenericComparison = true,
) {
    return eqOptional(column, sql.placeholder(name ?? column.name), useGenericComparison);
}

/**
 * Case-insensitively matches the result of a SQL expression against a POSIX regular expression, using PostgreSQL's
 * operator "~*".
 *
 * @param column SQL expression.
 * @param regex Regular expression.
 * @returns Regex match check SQL.
 */
export function imatch(column: Column | SQL.Aliased | SQL, regex: string | SQLWrapper) {
    return sql<boolean>`(${column} ~* ${regex})`;
}

/**
 * Shortcut for creating a case-insensitive regex match check with an automatic (based on the column) or
 * custom-labeled placeholder.
 *
 * @param column Column.
 * @param name Custom placeholder name, will be inferred from the column if not specified.
 * @returns Regex match check SQL with the placeholder.
 */
export function imatchPlaceholder(column: PgColumn, name?: string) {
    return imatch(column, sql.placeholder(name ?? column.name));
}

/**
 * Utility primarily for converting query array results to single values where such are expected (e.g., when selecting
 * by ID).
 *
 * @param values Array.
 * @returns First object in the array if present, `null` otherwise.
 */
export function takeFirstOrNull<T>(values: T[]): T | null {
    if (values.length < 1) return null;
    return values[0];
}

/**
 * Parameters for page-based pagination.
 */
export interface Pagination {
    /**
     * Number of items on one page.
     */
    pageSize: number;
    /**
     * Current page, 1-indexed.
     */
    page: number;
}

/**
 * Converts pagination parameters to limit and offset values.
 *
 * @param pagination Pagination settings.
 * @returns Mapping of "limit" and "offset" strings to the calculated numbers.
 */
export function toLimitOffset(pagination: Pagination) {
    return {
        limit: pagination.pageSize,
        offset: pagination.pageSize * (pagination.page - 1),
    };
}
