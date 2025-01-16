import { auth } from "@/server/auth";
import { getUser, maybeSyncUserHealth } from "@/server/data/services/user";

/**
 * Convenience method that retrieves the currently authenticated user data from the JWT token in a type-safe way.
 * Designed to be used within Server Components in authentication-protected routes, where the presence of a JWT token
 * with valid user data is guaranteed.
 */
export async function getUserInProtectedRoute() {
    return (await auth())!.user!;
}

/**
 * Convenience method to retrieve the user ID of the currently authenticated user in a type-safe way.
 * Designed to be used within Server Components in authentication-protected routes, where the presence of a JWT token
 * with valid user data is guaranteed.
 */
export async function getUserIDInProtectedRoute() {
    return (await getUserInProtectedRoute()).id!;
}

/**
 * Convenience method to retrieve the database profile data of the currently authenticated user in a type-safe way.
 * Designed to be used within Server Components in authentication-protected routes, where the presence of a JWT token
 * with valid user data is guaranteed. Also synchronizes the user's health state.
 */
export async function getSyncedUserInProtectedRoute() {
    const id = await getUserIDInProtectedRoute();
    await maybeSyncUserHealth(id);
    return (await getUser(id))!;
}

export type SearchParam = string | string[] | undefined;

export function parseStringParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    return Array.isArray(param) ? param[0] : param;
}

export function parseIntParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    const parsed = parseInt(Array.isArray(param) ? param[0] : param);
    return isNaN(parsed) ? null : parsed;
}
