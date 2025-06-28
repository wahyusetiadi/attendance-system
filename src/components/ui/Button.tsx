import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg",
        outline: "border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 shadow-sm",
        secondary: "bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        accent: "bg-purple-500 text-white hover:bg-purple-600 shadow-md hover:shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={`${cn(buttonVariants({ variant, size }), className)} cursor-pointer`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
