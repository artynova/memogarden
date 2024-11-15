export interface Response {
    status: number;
    message?: string;
}

export const ResponseOK: Response = { status: 200 };
export const ResponseUnauthorized: Response = { status: 401 };
export const ResponseConflict: Response = { status: 409 };
export const ResponseServerError: Response = { status: 500 };
