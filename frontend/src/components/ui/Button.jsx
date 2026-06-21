const variants = {
  primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary',
  accent: 'bg-accent text-primary-dark hover:bg-accent/90 focus:ring-accent',
  secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
  outline: 'border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary',
  ghost: 'text-primary hover:bg-primary/5 focus:ring-primary',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
