import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  // THAY ĐỔI CÁC CLASS Ở DÒNG NÀY ĐỂ TĂNG KÍCH THƯỚC
  "inline-flex items-center rounded-lg border px-4 py-1 text-base font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        // Các variant cho trạng thái tài khoản
        available: "border-transparent bg-green-500 text-white",
        // Xóa variant pending, không còn dùng
        rented: "border-transparent bg-red-600 text-white",
        waiting: "border-transparent bg-red-600 text-white",
        updating: "border-transparent bg-gray-500 text-white",
        paused: "border-transparent bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }