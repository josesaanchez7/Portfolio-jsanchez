import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface CommonProps {
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
}

type LinkProps = CommonProps & {
  href: string;
  /** Abre en una pestaña nueva (enlaces externos). */
  external?: boolean;
  download?: string;
  onClick?: never;
};

type ActionProps = CommonProps & {
  href?: undefined;
  onClick: () => void;
  ariaLabel?: string;
};

const BASE = [
  "inline-flex items-center justify-center gap-[0.55rem] py-[0.7rem]",
  "rounded-sm border text-[0.95rem] leading-[1.2] font-semibold cursor-pointer",
  "transition-[background-color,border-color,color,translate] duration-200 ease-[ease]",
  "hover:-translate-y-px active:translate-y-0",
  "disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50",
  "[&_svg]:shrink-0",
].join(" ");

const VARIANT: Record<Variant, string> = {
  primary:
    "border-transparent bg-accent px-5 text-accent-contrast hover:bg-accent-hover hover:text-accent-contrast",
  secondary:
    "border-border-strong bg-transparent px-5 text-fg hover:border-accent hover:text-accent",
  ghost: "border-transparent bg-transparent px-2 text-fg-muted hover:text-accent",
};

/** Enlace (si recibe `href`) o botón (si recibe `onClick`) con estilos coherentes. */
const Button = (props: LinkProps | ActionProps) => {
  const { variant = "primary", icon, children } = props;
  const className = `${BASE} ${VARIANT[variant]}`;

  if (props.href !== undefined) {
    return (
      <a
        href={props.href}
        className={className}
        download={props.download}
        {...(props.external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;
