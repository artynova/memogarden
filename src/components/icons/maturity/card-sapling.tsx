import { IconProps } from "@/components/icons/common";

/**
 * Icon for the "Sapling" card maturity stage.
 *
 * @param props Component properties.
 * @param props.color Icon color (defaults to current color).
 * @param props.size Icon size.
 * @param props.strokeWidth Icon stroke width.
 * @returns The component.
 */
export function CardSapling({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    ...rest
}: IconProps) {
    return (
        <svg
            viewBox="0 0 13.471437 19.979124"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={size}
            height={size}
            {...rest}
        >
            <g transform="translate(-5.4252963,-2.2197946)">
                <path d="m 13.870543,16.344285 c 0.924552,1.534891 -0.352013,3.596018 -2.15639,4.399319 -1.804381,0.803301 -4.4259232,0.670532 -4.7052167,-1.560056 -0.09799,-0.782606 0.3479388,-1.400149 0.8878455,-1.588455 0.9042287,-0.315379 0.9445766,0.503311 2.2574242,-0.08116 1.402211,-0.624257 0.792045,-1.232389 1.852171,-1.751338 0.02909,-0.01424 0.05944,-0.02838 0.09112,-0.0425 0.501954,-0.223467 1.276844,-0.199582 1.773058,0.624201 z" />
                <path
                    d="m 12.6875,14.625 c 1.510417,-1.302084 3.020802,-2.60414 3.255182,-3.624994 C 16.177062,9.9791514 15.135417,9.2395833 14.09375,8.5"
                    transform="matrix(1.3381707,0,0,1.3381707,-3.4766753,-3.9002507)"
                />
                <path d="M 14.78931,7.0942382 A 2.9089268,2.9869209 72.472923 0 0 9.3982319,4.7357853 C 8.1328346,6.8316256 7.7075459,7.3518862 6.4252145,7.8031719 7.0811603,8.4683842 7.809168,9.158016 9.3384791,9.6762738 11.540364,10.422455 14.033768,9.1502526 14.78931,7.0942382 Z" />
            </g>
        </svg>
    );
}
