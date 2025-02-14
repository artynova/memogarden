import { IconProps } from "@/components/icons/common";

/**
 * Icon for the "Sprout" card maturity stage.
 *
 * @param props Component properties.
 * @param props.color Icon color (defaults to current color).
 * @param props.size Icon size.
 * @param props.strokeWidth Icon stroke width.
 * @returns The component.
 */
export function CardSprout({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    ...rest
}: IconProps) {
    return (
        <svg
            viewBox="0 0 14.288312 20.567533"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={size}
            height={size}
            {...rest}
        >
            <g transform="translate(-2.5594337,-1.7453791)">
                <path d="m 14.700532,10.711268 c 2.294614,2.32383 0.914662,6.521585 -1.938485,8.716659 -2.853145,2.195075 -7.5544792,3.081305 -9.0035058,-0.751109 -0.508394,-1.344611 0.017483,-2.629461 0.8934648,-3.194044 1.4670918,-0.945561 1.8887962,0.487639 3.9647173,-1.109474 2.2172247,-1.705828 0.8760597,-2.522223 2.5322637,-3.895138 0.04543,-0.03769 0.09316,-0.07573 0.143249,-0.114268 0.793708,-0.6106418 2.176783,-0.8998095 3.408314,0.347401 z" />
                <path d="M 12.40625,9.78125 C 13.468751,8.1249989 14.531228,6.4687841 14.562479,5.2552173 14.593729,4.0416506 13.59377,3.2708489 12.848963,2.9427174 12.104156,2.6145858 11.614583,2.7291667 11.125,2.84375" />
            </g>
        </svg>
    );
}
