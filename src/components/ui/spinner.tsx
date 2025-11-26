import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-8 animate-spin text-purple-500 dark:text-purple-400", className)}
      {...props}
    />
  )
}

export { Spinner }
