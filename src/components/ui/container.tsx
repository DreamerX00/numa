import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const containerSizes = {
  sm: "max-w-4xl",
  md: "max-w-6xl", 
  lg: "max-w-7xl",
  xl: "max-w-[1400px]"
}

export function Container({ children, className, size = "xl" }: ContainerProps) {
  return (
    <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", containerSizes[size], className)}>
      {children}
    </div>
  )
}