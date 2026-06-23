const variants = {
  app: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] ring-1 ring-white/70",
  plain: "rounded-lg border border-gray-100 bg-white shadow-sm",
};

export default function Card({
  children,
  className = "",
  padding = true,
  variant = "app",
  ...props
}) {
  return (
    <div
      className={`${variants[variant] || variants.app} ${padding ? "p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
      <div>
        {title && (
          <h3 className="font-heading text-lg font-bold tracking-tight text-primary">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
