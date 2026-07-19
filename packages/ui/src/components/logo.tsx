import { type ComponentProps } from "solid-js"

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 10 L45 50 L10 90 L25 90 L50 58 L75 90 L90 90 L55 50 L90 10 L75 10 L50 42 L25 10 Z"
        fill="var(--icon-strong-base)"
      />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 10 L45 50 L10 90 L25 90 L50 58 L75 90 L90 90 L55 50 L90 10 L75 10 L50 42 L25 10 Z"
        fill="var(--icon-strong-base)"
      />
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <path
        d="M10 10 L45 50 L10 90 L25 90 L50 58 L75 90 L90 90 L55 50 L90 10 L75 10 L50 42 L25 10 Z"
        fill="var(--icon-strong-base)"
      />
    </svg>
  )
}
