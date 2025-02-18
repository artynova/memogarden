import { NextURL } from "next/dist/server/web/next-url";

/**
 * Where the user is returned upon clicking the "home" button inside the app.
 */
export const HOME = "/home";

const ROUTE_PREFIXES_FORBIDDEN_WITHOUT_TOKEN = [
    "/home",
    "/account",
    "/statistics",
    "/browse",
    "/deck",
    "/card",
];

/**
 * Checks whether the URL should be accessible without a JWT session token.
 *
 * @param nextUrl URL to check.
 * @returns `true` if it should be accessible, `false` otherwise.
 */
export function shouldAllowWithoutToken(nextUrl: NextURL) {
    return !ROUTE_PREFIXES_FORBIDDEN_WITHOUT_TOKEN.includes(`/${nextUrl.pathname.split("/")[1]}`); // / is always the leading character, causing a single empty string to become the first in the splits array; thus, the second string in the array is the route's first segment ("prefix") that needs to be checked
}

const ROUTES_FORBIDDEN_WITH_TOKEN = ["/signin", "/signup"];

/**
 * Checks whether the URL should be accessible if the user is authenticated. Routes forbidden by this function are ones
 * that should not be normally visited by authenticated users (e.g., the sign-up route).
 *
 * @param nextUrl URL to check.
 * @returns `true` if it should be accessible, `false` otherwise.
 */
export function shouldAllowWithToken(nextUrl: NextURL) {
    if (nextUrl.pathname === "/signin") return nextUrl.searchParams.has("invalidToken"); // The sign-in route should normally be avoided if the request has a session token, except for cases when the "invalidToken" search parameter is used to explicitly specify that the current token is invalid and should be destroyed
    return !ROUTES_FORBIDDEN_WITH_TOKEN.includes(nextUrl.pathname);
}

/**
 * Where the user without a JWT session token should be redirected if they visit a non-public route.
 */
export const REDIRECT_WITHOUT_TOKEN_TO = "/signin";

/**
 * Where the user with a JWT session token should be redirected if they visit a route that does not make sense for
 * authenticated users (e.g., the sign-up route).
 */
export const REDIRECT_WITH_TOKEN_TO = "/home";
