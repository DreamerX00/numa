import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "!bg-white !text-black border border-gray-200 shadow-sm hover:!bg-[#E7654D] hover:!text-white hover:!border-[#E7654D] transform hover:scale-105 transition-all duration-300",
        destructive:
          "!bg-white !text-red-600 border border-red-200 shadow-sm hover:!bg-red-600 hover:!text-white hover:!border-red-600 transform hover:scale-105 transition-all duration-300",
        outline:
          "!bg-white !text-black border border-gray-200 shadow-sm hover:!bg-[#E7654D] hover:!text-white hover:!border-[#E7654D] transform hover:scale-105 transition-all duration-300",
        secondary:
          "!bg-white !text-black border border-gray-200 shadow-sm hover:!bg-[#E7654D] hover:!text-white hover:!border-[#E7654D] transform hover:scale-105 transition-all duration-300",
        ghost: 
          "!bg-transparent !text-black hover:!bg-[#E7654D] hover:!text-white transform hover:scale-105 transition-all duration-300",
        link: 
          "!text-black underline-offset-4 hover:underline hover:!text-[#E7654D] transition-all duration-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
