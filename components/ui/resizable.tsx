"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Componente simplificado sem dependências externas
const ResizablePanelGroup = ({
  className,
  children,
  direction = "horizontal",
  ...props
}: {
  className?: string
  children: React.ReactNode
  direction?: "horizontal" | "vertical"
}) => (
  <div
    className={cn(
      "flex h-full w-full",
      direction === "vertical" ? "flex-col" : "flex-row",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const ResizablePanel = ({
  className,
  children,
  defaultSize = 50,
  ...props
}: {
  className?: string
  children: React.ReactNode
  defaultSize?: number
}) => (
  <div
    className={cn("flex-1", className)}
    style={{ flexBasis: `${defaultSize}%` }}
    {...props}
  >
    {children}
  </div>
)

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: {
  withHandle?: boolean
  className?: string
}) => (
  <div
    className={cn(
      "relative flex w-1 items-center justify-center bg-border cursor-col-resize",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <div className="h-2.5 w-2.5 text-muted-foreground">⋮</div>
      </div>
    )}
  </div>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
