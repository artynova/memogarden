import {
    REDIRECT_WITH_AUTH_TO,
    REDIRECT_WITHOUT_AUTH_TO,
    ROUTES_ALLOWED_WITHOUT_AUTH,
    ROUTES_FORBIDDEN_WITH_AUTH,
} from "@/lib/routes";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

const { auth } = NextAuth({ providers: [] }); // Configuration-less instance, only used as a convenience wrapper for NextAuth API calls. Full instance cannot be used because some libraries used in the implementation are not available in the edge (middleware) runtime

export default auth((req) => {
    const { nextUrl } = req;
    const isAuthenticated = !!req.auth;

    const isAllowedWithoutAuth = ROUTES_ALLOWED_WITHOUT_AUTH.includes(nextUrl.pathname);
    if (!isAuthenticated && !isAllowedWithoutAuth)
        return NextResponse.redirect(new URL(REDIRECT_WITHOUT_AUTH_TO, nextUrl));

    const isForbiddenWithAuth = ROUTES_FORBIDDEN_WITH_AUTH.includes(nextUrl.pathname);
    if (isAuthenticated && isForbiddenWithAuth)
        return NextResponse.redirect(new URL(REDIRECT_WITH_AUTH_TO, nextUrl));
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // The middleware should not apply to API routes and static resources.
};
