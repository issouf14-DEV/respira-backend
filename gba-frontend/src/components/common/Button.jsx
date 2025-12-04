export default function Button({
  children,
  variant = "primary",
  size = "md",
  ...props
}) {
  const baseStyles = "font-bold rounded transition";

  const variants = {
    primary: "bg-kia_red text-white hover:bg-red-700",
    secondary: "bg-gray-200 text-kia_dark hover:bg-gray-300",
    outline: "border border-kia_red text-kia_red hover:bg-kia_red hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}