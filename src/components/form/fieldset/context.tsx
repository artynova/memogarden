import React from "react";

/**
 * Data provided about a form field set.
 */
export type FieldsetContextValue = {
    /**
     * Error message (optional).
     */
    error?: string;
};

/**
 * Context providing data about a form field set.
 */
export const FieldsetContext = React.createContext<FieldsetContextValue>({});
