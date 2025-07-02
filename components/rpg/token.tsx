"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import type { Token as TokenType } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Shield, Ghost } from "lucide-react"

interface TokenProps {
  token: TokenType
}

export function Token({ token }: TokenProps) {
  const currentUser = useMesaStore((state) => state.currentUser)
  const campaign = useMesaStore((state) => state.activeCampaign)
  const isMaster = currentUser?.id === campaign?.masterId
  const isOwner = token.ownerId === currentUser?.id

  const canDrag = isMaster || isOwner

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canDrag) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData("tokenId", token.id)
  }

  const Icon = token.type === "player" ? Shield : Ghost

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable={canDrag}
            onDragStart={handleDragStart}
            className={cn(
              "w-full h-full p-0.5 rounded-full hover:bg-primary/20 transition-all flex items-center justify-center pointer-events-auto",
              canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default",
            )}
          >
            <Avatar className="h-full w-full border-2 border-primary bg-muted">
              {token.image ? (
                <AvatarImage src={token.image || "/placeholder.svg"} alt={token.name} className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <Icon className="h-[60%] w-[60%] text-primary-foreground" />
                </div>
              )}
              <AvatarFallback>{token.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{token.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
