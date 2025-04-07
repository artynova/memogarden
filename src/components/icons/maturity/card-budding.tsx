import { IconProps } from "@/components/icons/common";

/**
 * Icon for the "Budding" card maturity stage.
 *
 * @param props Component properties.
 * @param props.color Icon color (defaults to current color).
 * @param props.size Icon size.
 * @param props.strokeWidth Icon stroke width.
 * @returns The component.
 */
export function CardBudding({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    ...rest
}: IconProps) {
    return (
        <svg
            viewBox="0 0 19.953299 20.50219"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={size}
            height={size}
            {...rest}
        >
            <g transform="translate(-1.6945692,-1.84156)">
                <path
                    d="m 13.297437,15.36307 c 0.184532,-1.180096 0.369061,-2.360167 0.212273,-3.139756 -0.156787,-0.779589 -0.654876,-1.15863 -1.152976,-1.537679"
                    transform="matrix(1.7237466,0,0,1.7237466,-12.087208,-5.8184313)"
                />
                <path d="M 7.294497,13.672181 C 10.38717,13.048434 9.733421,8.4702364 6.566346,8.572946 4.4234028,8.5966091 3.8402333,8.5197331 2.9135734,7.7731613 2.720625,8.5678553 2.542699,9.4274366 2.8614824,10.804498 c 0.4589811,1.98268 2.5545981,3.252498 4.4330146,2.867683 z" />
                <path
                    d="m 5.25,16.5 c 5.114583,0 10.229167,0 15.34375,0"
                    transform="translate(-1.46875,4.84375)"
                />
                <path
                    d="m 12.528372,16.334292 c 0.488761,-1.228619 0.977512,-2.457212 1.441132,-3.242178 0.463619,-0.784967 0.90207,-1.126243 1.340529,-1.467525"
                    transform="matrix(1.2881366,0,0,1.2881366,-4.9519938,-6.1079391)"
                />
                <path d="m 16.957168,9.5620553 c -3.15407,0.074345 -3.527083,-4.5352248 -0.415466,-5.1341788 2.095302,-0.4499745 2.647114,-0.6536882 3.386109,-1.5864021 0.363617,0.7324959 0.726906,1.5315948 0.719971,2.9450568 -0.01,2.0350874 -1.77359,3.7361858 -3.690615,3.7755246 z" />
            </g>
        </svg>
    );
}
