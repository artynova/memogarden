import {
    Column,
    InferModelFromColumns,
    isNotNull,
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
export type ColumnNameFromGroup<E extends ColumnGroupItem> = E extends PgColumn // Check if the type is just that of a column
    ? MapColumnName<"", E, true> // Retrieve column's own name
    : E extends readonly [PgColumn, string] // Check if the type is a tuple with a custom alias provided for the column
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
    readonly [K in T[number] as ColumnNameFromGroup<K>]: ColumnFromGroupItem<K>;
};

// Credit for key extraction code: https://stackoverflow.com/a/70061272
type UnionToParameter<U> = U extends unknown ? (k: U) => void : never;
type UnionToIntersection<U> = UnionToParameter<U> extends (k: infer I) => void ? I : never;
type ExtractParameter<F> = F extends { (a: infer A): void } ? A : never;
type ExtractOne<Union> = ExtractParameter<UnionToIntersection<UnionToParameter<Union>>>;
type SpliceOne<Union> = Exclude<Union, ExtractOne<Union>>;
// Instead of using the recursive trick to construct a generic tuple of union members, this code explicitly constructs the expected structure of the ColumnGroup
type ColumnGroupFromMappingRecursive<T extends ColumnMapping, Result extends readonly unknown[]> =
    SpliceOne<keyof T> extends never
        ? [
              [
                  T[ExtractOne<keyof T> extends keyof T ? ExtractOne<keyof T> : never],
                  ExtractOne<keyof T>,
              ],
              ...Result,
          ]
        : ColumnGroupFromMappingRecursive<
              Pick<T, SpliceOne<keyof T>>,
              [
                  [
                      T[ExtractOne<keyof T> extends keyof T ? ExtractOne<keyof T> : never],
                      ExtractOne<keyof T>,
                  ],
                  ...Result,
              ]
          >;
/**
 * Determines the type of the column group based on the column mapping type.
 */
export type ColumnGroupFromMapping<T extends ColumnMapping> = ColumnGroupFromMappingRecursive<
    T,
    []
>;

/**
 * Generates a column mapping (object mapping column name strings to column objects)
 * based on a column group (i.e., an array).
 */
export function toColumnMapping<T extends ColumnGroup>(columns: T) {
    return Object.fromEntries(
        columns.map((column) =>
            column instanceof PgColumn ? [column.name, column] : [column[1], column[0]],
        ),
    ) as ColumnMappingFromGroup<T>;
}

/**
 * Generates a column group (array with tuples of columns and aliases)
 * based on a column mapping. All
 */
export function toColumnGroup<T extends ColumnMapping>(columns: T) {
    return Object.entries(columns).map((entry) => [
        entry[1],
        entry[0],
    ]) as ColumnGroupFromMapping<T>;
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
type ColumnNamesFromGroup<T extends ColumnGroup> = {
    readonly [K in keyof T]: ColumnNameFromGroup<T[K]>;
};
type ColumnNamesFromMappingRecursive<T extends ColumnMapping, Result extends readonly unknown[]> =
    SpliceOne<keyof T> extends never
        ? [ExtractOne<keyof T>, ...Result]
        : ColumnNamesFromMappingRecursive<
              Pick<T, SpliceOne<keyof T>>,
              [ExtractOne<keyof T>, ...Result]
          >;
type ColumnNamesFromMapping<T extends ColumnMapping> = ColumnNamesFromMappingRecursive<T, []>;

/**
 * Retrieves column names (either inferred names or explicit aliases) from a column group in a type-safe way.
 *
 * @param columns Column group.
 * @return Array of name strings (const values are preserved if the input group is also marked as const).
 */
export function getNames<T extends ColumnGroup>(columns: T): ColumnNamesFromGroup<T>;

/**
 * Retrieves column names from a column mapping in a type-safe way.
 *
 * @param columns Column mapping.
 * @return Array of name strings (const values are preserved if the input mapping is also marked as const).
 */
export function getNames<T extends ColumnMapping>(columns: T): ColumnNamesFromMapping<T>;

export function getNames(columns: unknown) {
    if (Array.isArray(columns)) {
        return columns.map((column: ColumnGroupItem) =>
            column instanceof PgColumn ? column.name : column[1],
        );
    }
    return Object.keys(columns as ColumnMapping) as unknown[]; // Cast to avoid false compiler issues with the respective overload signature
}

// Utility types for defining makeInsertPlaceholders overloads
type InsertPlaceholdersFromNames<T extends readonly string[]> = {
    [K in T[number]]: ReturnType<typeof sql.placeholder>;
};
type InsertPlaceholdersFromGroup<T extends ColumnGroup> =
    ColumnNamesFromGroup<T> extends readonly string[]
        ? InsertPlaceholdersFromNames<ColumnNamesFromGroup<T>>
        : never;
type InsertPlaceholdersFromMapping<T extends ColumnMapping> =
    ColumnNamesFromMapping<T> extends readonly string[]
        ? InsertPlaceholdersFromNames<ColumnNamesFromMapping<T>>
        : never;

/**
 * Creates a mapping of string labels to SQL placeholders, each of which uses its respective label string as its name.
 * Intended to be used for configuring prepared INSERT statements.
 *
 * @param labels Label strings.
 * @return A mapping of placeholder labels to placeholder objects, e.g., ```{colName: sql.placeholder("colName")}```.
 */
export function makeInsertPlaceholders<T extends readonly string[]>(
    labels: T,
): InsertPlaceholdersFromNames<T>;

/**
 * Creates a mapping of inferred string labels to SQL placeholders, each of which uses its respective label string
 * as its name. Intended to be used for configuring prepared INSERT statements.
 *
 * @param columns Column group.
 * @return A mapping of placeholder labels to placeholder objects, e.g., ```{colName: sql.placeholder("colName")}```.
 */
export function makeInsertPlaceholders<T extends ColumnGroup>(
    columns: T,
): InsertPlaceholdersFromGroup<T>;

/**
 * Creates a mapping of inferred string labels to SQL placeholders, each of which uses its respective label string
 * as its name. Intended to be used for configuring prepared INSERT statements.
 *
 * @param columns Column mapping.
 * @return A mapping of placeholder labels to placeholder objects, e.g., ```{colName: sql.placeholder("colName")}```.
 */
export function makeInsertPlaceholders<T extends ColumnMapping>(
    columns: T,
): InsertPlaceholdersFromMapping<T>;

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

// Utility types for defining makeUpdatePlaceholders overloads
type UpdatePlaceholdersFromNames<T extends readonly string[]> = {
    [K in T[number]]: ReturnType<typeof sql>;
};
type UpdatePlaceholdersFromGroup<T extends ColumnGroup> =
    ColumnNamesFromGroup<T> extends readonly string[]
        ? UpdatePlaceholdersFromNames<ColumnNamesFromGroup<T>>
        : never;
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
 * @return A mapping of placeholder labels to SQL objects wrapping respective placeholders.
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
 * @return A mapping of placeholder labels to SQL objects wrapping respective placeholders.
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
 * @return A mapping of placeholder labels to SQL objects wrapping respective placeholders.
 */
export function makeUpdatePlaceholders<T extends ColumnMapping>(
    columns: T,
): UpdatePlaceholdersFromMapping<T>;

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
    deletedAt: PgColumn;
};

/**
 * Checks whether a row in the table was soft-deleted, based on the presence / absence of a value in
 * the table's "deletedAt" field.
 *
 * @param table The table (must support soft-delete via "deletedAt").
 * @return `true` if deleted, `false` otherwise.
 */
export function isDeleted(table: TableWithSoftDelete) {
    return isNotNull(table.deletedAt);
}

/**
 * Checks whether a row in the table was soft-deleted, based on the presence / absence of a value in
 * the table's "deletedAt" field.
 *
 * @param table The table (must support soft-delete via "deletedAt").
 * @return `false` if deleted, `true` otherwise.
 */
export function isNotDeleted(table: TableWithSoftDelete) {
    return isNull(table.deletedAt);
}

/**
 * Helper method to add automatic database-level update timestamp marking to update placeholders. Only intended
 * for updates to tables that support update timestamp tracking (i.e., have a field "updatedAt").
 *
 * @param updatePlaceholders Base update placeholders.
 * @return Base update placeholders with the added "updatedAt" field being set to the current timestamp.
 */
export function addUpdatedAt<T extends Record<string, SQL>>(
    updatePlaceholders: T,
): T & { updatedAt: SQL } {
    return { ...updatePlaceholders, updatedAt: sql`NOW()` };
}

/**
 * Creates a mapping for the "set" part of an update query that will assign the current timestamp to the "deletedAt"
 * timestamp field.
 */
export function makeDeletedAt() {
    return { deletedAt: sql`NOW()` };
}

/**
 * Case-insensitively matches the result of a SQL expression against a POSIX regular expression, using PostgreSQL's
 * operator "~*".
 *
 * @param column SQL expression.
 * @param regex Regular expression.
 */
export function imatch(column: Column | SQL.Aliased | SQL, regex: string | SQLWrapper) {
    return sql<boolean>`${column} ~* ${regex}`;
}

/**
 * Compares the result of a SQL expression against a given value, bypassing the check and yielding TRUE if
 * the value evaluates to NULL.
 *
 * @param column SQL expression.
 * @param value Value being compared against.
 */
export function eqOptional(column: Column | SQL.Aliased | SQL, value: string | SQLWrapper) {
    return sql<boolean>`${value} IS NULL OR ${column} = ${value}`; // Bypass the comparison and immediately yield TRUE for value NULL
}

/**
 * Shortcut for creating an equality check with an automatic (based on the column) or custom-labeled placeholder.
 *
 * @param column Column.
 * @param name Custom placeholder name, will be inferred from the column if not specified.
 * @return Equality check SQL with the placeholder.
 */
export function eqPlaceholder(column: PgColumn, name?: string) {
    return sql<boolean>`${column} = ${sql.placeholder(name ?? column.name)}`;
}

/**
 * Shortcut for creating an optional equality check with an automatic (based on the column) or
 * custom-labeled placeholder.
 *
 * @param column Column.
 * @param name Custom placeholder name, will be inferred from the column if not specified.
 * @return Optional equality check SQL with the placeholder.
 */
export function eqOptionalPlaceholder(column: PgColumn, name?: string) {
    return eqOptional(column, sql.placeholder(name ?? column.name));
}

/**
 * Shortcut for creating a case-insensitive regex match check with an automatic (based on the column) or
 * custom-labeled placeholder.
 *
 * @param column Column.
 * @param name Custom placeholder name, will be inferred from the column if not specified.
 * @return Regex match check SQL with the placeholder.
 */
export function imatchPlaceholder(column: PgColumn, name?: string) {
    return imatch(column, sql.placeholder(name ?? column.name));
}

/**
 * Utility primarily for converting query array results to single values where such are expected (e.g., when selecting
 * by ID).
 *
 * @param values Array.
 * @return First object in the array if present, `null` otherwise.
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
 * @return Mapping of "limit" and "offset" strings to the calculated numbers.
 */
export function toLimitOffset(pagination: Pagination) {
    return {
        limit: pagination.pageSize,
        offset: pagination.pageSize * (pagination.page - 1),
    };
}
