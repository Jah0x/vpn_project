import React from "react";
import { Loader } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const base =
  "px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50";
const map: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-600 hover:bg-gray-500 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading,
  children,
  className = "",
  ...props
}) => (
  <button
    className={`${base} ${map[variant]} ${className}`}
    disabled={isLoading || props.disabled}
    {...props}
  >
    {isLoading && <Loader className="w-4 h-4 animate-spin" />}
    {!isLoading && children}
  </button>
);

export default Button;
