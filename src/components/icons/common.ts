import { SVGProps } from "react";

/**
 * Properties of an icon.
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
    /**
     * Icon color string representation.
     */
    color?: string;
    /**
     * Icon size.
     */
    size?: string | number;
    /**
     * Icon stroke width.
     */
    strokeWidth?: number;
}
