import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-700 focus:ring-gray-500',
    link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline focus:ring-blue-500'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const spacing = {
    xs: 'space-x-1',
    sm: 'space-x-1.5',
    md: 'space-x-2',
    lg: 'space-x-2.5',
    xl: 'space-x-3'
  };

  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    (Icon || loading) ? spacing[size] : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner size="small" className={iconSizes[size]} />;
    }
    if (Icon) {
      return <Icon className={iconSizes[size]} />;
    }
    return null;
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

// Группа кнопок
export const ButtonGroup = ({ children, className = '', orientation = 'horizontal' }) => {
  const orientationClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col'
  };

  return (
    <div className={`${orientationClasses[orientation]} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          let roundedClasses = '';
          if (orientation === 'horizontal') {
            if (isFirst) roundedClasses = 'rounded-r-none';
            else if (isLast) roundedClasses = 'rounded-l-none';
            else roundedClasses = 'rounded-none';
          } else {
            if (isFirst) roundedClasses = 'rounded-b-none';
            else if (isLast) roundedClasses = 'rounded-t-none';
            else roundedClasses = 'rounded-none';
          }

          return React.cloneElement(child, {
            className: `${child.props.className || ''} ${roundedClasses}`.trim()
          });
        }
        return child;
      })}
    </div>
  );
};

// Кнопка-иконка
export const IconButton = ({
  icon: Icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const buttonSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      variant={variant}
      className={`${buttonSizes[size]} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
};

export default Button;
