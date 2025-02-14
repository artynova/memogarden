/**
 * HTTP-like status response from a Server Action (which cannot freely modify actual HTTP response
 * codes).
 */
export interface Response {
    /**
     * Response status code (meaning is the same as for HTTP responses).
     */
    status: number;
    /**
     * Optional explanatory message.
     */
    message?: string;
}

/**
 * Equivalent of the HTTP 400 response.
 */
export const ResponseBadRequest: Response = { status: 400 };

/**
 * Equivalent of the HTTP 401 response.
 */
export const ResponseUnauthorized: Response = { status: 401 };

/**
 * Equivalent of the HTTP 404 response.
 */
export const ResponseNotFound: Response = { status: 404 };

/**
 * Equivalent of the HTTP 409 response.
 */
export const ResponseConflict: Response = { status: 409 };
