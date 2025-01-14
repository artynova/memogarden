import { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: number;
}

export function CardSeed({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    ...rest
}: IconProps) {
    return (
        <svg
            viewBox="0 0 19.171299 18.028666"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={size}
            height={size}
            {...rest}
        >
            <g transform="translate(-2.0842718,-3.2330772)">
                <path d="m 18.650307,5.4493814 c 3.205975,3.2467941 1.277942,9.1117896 -2.7084,12.1786896 -3.986341,3.066902 -10.5549221,4.305119 -12.5794644,-1.04943 -0.7103148,-1.878656 0.024427,-3.673815 1.2483258,-4.462635 2.0497826,-1.321114 2.638977,0.681316 5.5393996,-1.55013 3.097849,-2.3833377 1.224008,-3.5239835 3.538013,-5.4421845 0.06347,-0.052667 0.130157,-0.1058099 0.200144,-0.1596528 1.108948,-0.8531723 3.041345,-1.2571899 4.762007,0.4853806 z" />
            </g>
        </svg>
    );
}
