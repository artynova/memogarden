import {
    REDIRECT_WITH_AUTH_TO,
    REDIRECT_WITHOUT_AUTH_TO,
    ROUTES_ALLOWED_WITHOUT_AUTH,
    ROUTES_FORBIDDEN_WITH_AUTH,
} from "@/lib/routes";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

const { auth } = NextAuth({
    providers: [],
    callbacks: {
        session({ session, token }) {
            return { ...session, user: { ...session.user, id: token.id } }; // The ID is present on the JWT token, but it still needs to be forwarded to the session's user object with this code
        },
    },
}); // Lightweight instance, only used as a convenience wrapper for NextAuth API calls. Full instance cannot be used because some libraries used in the implementation are not available in the edge (middleware) runtime

/**
 * Catches most simple session errors and redirects away from routes that either strictly require a session or cannot
 * be visited by users with a session (an example of the latter is, for example, the sign-up route).
 *
 * @returns Next.js response.
 */
export default auth((req) => {
    const { nextUrl } = req;
    const isAuthenticated = !!req.auth?.user?.id;

    const isAllowedWithoutAuth = ROUTES_ALLOWED_WITHOUT_AUTH.includes(nextUrl.pathname);
    if (!isAuthenticated && !isAllowedWithoutAuth)
        return NextResponse.redirect(new URL(REDIRECT_WITHOUT_AUTH_TO, nextUrl));

    const isForbiddenWithAuth = ROUTES_FORBIDDEN_WITH_AUTH.includes(nextUrl.pathname);
    if (isAuthenticated && isForbiddenWithAuth)
        return NextResponse.redirect(new URL(REDIRECT_WITH_AUTH_TO, nextUrl));
});

/**
 * Middleware config that excludes API endpoints (which handle protection themselves) and static content (which is
 * public).
 */
export const config = {
    matcher: ["/((?!api|static|_next/static|_next/image|favicon.ico).*)"],
};
