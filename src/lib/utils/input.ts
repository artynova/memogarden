/**
 * Option for a select-type input.
 */
export interface SelectOption {
    /**
     * Value that will be submitted if the option is selected.
     */
    value: string;
    /**
     * Option's label shown in the UI.
     */
    label: string;
}

/**
 * String select value that denotes no specific deck being selected. Only for cases when this is a permissible choice that can be processed by the
 * server.
 */
export const NO_DECK_OPTION = "any";
