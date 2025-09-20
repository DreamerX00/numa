import { cn } from "@/lib/utils"

export interface AnimatedBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedBackground({ children, className }: AnimatedBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80" />
      {children}
    </div>
  )
}

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-20 w-4 h-4 bg-brand/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
      <div className="absolute top-40 right-32 w-3 h-3 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
      <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-brand/25 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      <div className="absolute bottom-20 right-20 w-5 h-5 bg-brand/15 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
    </div>
  )
}