/**
 * Where the user is returned upon clicking the "home" button.
 */
export const HOME = "/home";
/**
 * Where the user without a session should be redirected if they visit a non-public route.
 */
export const REDIRECT_WITHOUT_AUTH_TO = "/signin";
/**
 * Public routes accessible without a session.
 */
export const ROUTES_ALLOWED_WITHOUT_AUTH = ["/signin", "/signup", "/"];
/**
 * Routes from which the user should be redirected if they are already authenticated (e.g., the signin route should not be visited by authenticated users).
 */
export const ROUTES_FORBIDDEN_WITH_AUTH = ["/signin", "/signup"];
/**
 * Where the user with a session should be redirected if they visit a route that does not make sense for authenticated users (e.g., signin).
 */
export const REDIRECT_WITH_AUTH_TO = "/home";
