import { type ComponentProps } from "solid-js"

export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  const mask = "zyraxon-wordmark-mask"
  const maskGradient = "zyraxon-wordmark-gradient"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 129"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g opacity="0.6">
        <g mask={`url(#${mask})`}>
          <text
            x="50%"
            y="85"
            text-anchor="middle"
            font-family="'Inter', 'SF Pro Display', 'Segoe UI', system-ui, sans-serif"
            font-size="110"
            font-weight="800"
            letter-spacing="18"
            fill="currentColor"
            opacity="0.7"
          >
            ZYRAXON
          </text>
        </g>
      </g>
      <defs>
        <mask id={mask} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="129">
          <rect width="900" height="129" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="450" y1="68" x2="450" y2="129" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
