import React from "react";

export type FieldsetContextValue = {
    error?: string;
};

export const FieldsetContext = React.createContext<FieldsetContextValue>({});
