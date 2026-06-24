export default function PremiumButton({ href, children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl text-[13px] sm:text-sm font-semibold px-5 py-3 transition-all duration-200 active:scale-[0.98] whitespace-nowrap";
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-soft shadow-glow",
    ghost: "bg-white/[0.04] text-ink border border-line-strong hover:bg-white/[0.08]",
    subtle: "text-ink-muted hover:text-ink",
  };
  const cls = `${base} ${variants[variant]} ${className}`;
  return href ? (
    <a href={href} className={cls} {...props}>{children}</a>
  ) : (
    <button className={cls} {...props}>{children}</button>
  );
}
