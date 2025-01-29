"use client";

import { ControlledSelect, ControlledSelectProps } from "@/components/ui/controlled-select";
import { useTimezoneSelect } from "react-timezone-select";

export type ControlledSelectTimezoneProps = Omit<ControlledSelectProps, "options">; // Options in this case are predefined

const timezones = Object.fromEntries(
    Intl.supportedValuesOf("timeZone")
        .filter((value) => value !== "UTC" && !value.startsWith("Etc/"))
        .map((value) => [value, value.replaceAll("_", " ").replaceAll("/", " / ")]),
);

export function ControlledSelectTimezone(props: ControlledSelectTimezoneProps) {
    const { options } = useTimezoneSelect({ labelStyle: "original", timezones });
    return <ControlledSelect {...props} options={options} />;
}
