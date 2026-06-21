export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`rounded-lg border border-gray-100 bg-white shadow-sm ${padding ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        {title && <h3 className="font-heading text-lg font-bold text-primary">{title}</h3>}
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
