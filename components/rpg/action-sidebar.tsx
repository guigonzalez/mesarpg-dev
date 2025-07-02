"use client"

import React from "react"
import { useState } from "react"
import { useMesaStore } from "@/lib/store"
import {
  MousePointer,
  Ruler,
  MapPin,
  Trash2,
  Ghost,
  User,
  Palette,
  Eraser,
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { GridTool } from "./grid"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Chat } from "./chat"
import { PlayerHandoutPanel } from "./player-handout-panel" // Importar novo componente

// --- Painéis de Conteúdo ---

const MarkToolPanel = ({
  markerColor,
  onMarkerColorChange,
  onClearMarkers,
}: {
  markerColor: string
  onMarkerColorChange: (color: string) => void
  onClearMarkers: () => void
}) => (
  <div className="flex flex-col items-center gap-3 p-2">
    <div className="flex flex-wrap gap-2 justify-center">
      {markerColors.map((color) => (
        <Button
          key={color}
          size="icon"
          className={`h-6 w-6 rounded-full ${markerColor === color ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`}
          style={{ backgroundColor: color }}
          onClick={() => onMarkerColorChange(color)}
        />
      ))}
    </div>
    <Button size="sm" variant="destructive" onClick={onClearMarkers} className="w-full">
      <Trash2 className="h-4 w-4 mr-2" /> Limpar Marcadores
    </Button>
  </div>
)

const DrawToolPanel = ({
  drawColor,
  onDrawColorChange,
  onClearDrawing,
}: {
  drawColor: string
  onDrawColorChange: (color: string) => void
  onClearDrawing: () => void
}) => (
  <div className="flex flex-col items-center gap-3 p-2">
    <div className="flex flex-wrap gap-2 justify-center">
      {markerColors.map((color) => (
        <Button
          key={color}
          size="icon"
          className={`h-6 w-6 rounded-full ${drawColor === color ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`}
          style={{ backgroundColor: color }}
          onClick={() => onDrawColorChange(color)}
        />
      ))}
    </div>
    <Button size="sm" variant="destructive" onClick={onClearDrawing} className="w-full">
      <Eraser className="h-4 w-4 mr-2" /> Limpar Desenhos
    </Button>
  </div>
)

const NpcListPanel = () => {
  const campaign = useMesaStore((state) => state.activeCampaign)
  const handleDragStart = (e: any, npcId: string) => e.dataTransfer.setData("npcId", npcId)
  if (!campaign || !campaign.npcs || campaign.npcs.length === 0) {
    return <p className="text-sm text-muted-foreground p-4 text-center">Nenhum NPC criado.</p>
  }
  return (
    <div className="space-y-2 p-2">
      {campaign.npcs.map((npc) => (
        <div
          key={npc.id}
          draggable
          onDragStart={(e) => handleDragStart(e, npc.id)}
          className="flex items-center gap-3 p-2 rounded-md bg-muted hover:bg-accent cursor-grab active:cursor-grabbing"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={npc.tokenImage || npc.avatarUrl} />
            <AvatarFallback>{npc.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">{npc.name}</span>
        </div>
      ))}
    </div>
  )
}

const PlayerTokenPanel = () => {
  const campaign = useMesaStore((state) => state.activeCampaign)
  const user = useMesaStore((state) => state.currentUser)
  if (!campaign || !user || user.id === campaign.masterId) return null
  const playerTokenOnGrid = campaign.tokens.find((token) => token.ownerId === user.id)
  if (playerTokenOnGrid) {
    return <p className="text-sm text-muted-foreground p-4 text-center">Seu token já está no mapa.</p>
  }
  const handleDragStart = (e: any) => e.dataTransfer.setData("userId", user.id)
  return (
    <div className="p-2">
      <div
        draggable
        onDragStart={handleDragStart}
        className="flex items-center gap-3 p-2 rounded-md bg-muted hover:bg-accent cursor-grab active:cursor-grabbing"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.tokenImage || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.name}</span>
      </div>
    </div>
  )
}

// --- Componente Principal ---

type PanelView = "chat" | "mark" | "draw" | "npcs" | "player" | "handouts" // Adicionar handouts

interface ActionSidebarProps {
  isMaster: boolean
  activeTool: GridTool
  onToolChange: (tool: GridTool) => void
  markerColor: string
  onMarkerColorChange: (color: string) => void
  onClearMarkers: () => void
  drawColor: string
  onDrawColorChange: (color: string) => void
  onClearDrawing: () => void
}

export function ActionSidebar({ isMaster, onToolChange, ...props }: ActionSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [activeView, setActiveView] = useState<PanelView>("chat")

  const handleViewChange = (tool: GridTool, view: PanelView | null) => {
    onToolChange(tool)
    if (view) {
      if (isOpen && activeView === view) {
        setIsOpen(false)
        setActiveView(null)
      } else {
        setActiveView(view)
        setIsOpen(true)
      }
    } else {
      setIsOpen(false)
      setActiveView(null)
    }
  }

  const views: { [key in PanelView]: { title: string; component: any } } = {
    chat: { title: "Chat da Sessão", component: Chat },
    mark: { title: "Marcadores", component: () => <MarkToolPanel {...props} /> },
    draw: { title: "Desenho Livre", component: () => <DrawToolPanel {...props} /> },
    npcs: { title: "Criaturas", component: NpcListPanel },
    player: { title: "Seu Personagem", component: PlayerTokenPanel },
    handouts: { title: "Utilitários", component: PlayerHandoutPanel }, // Adicionar view
  }

  const ActiveComponent = activeView ? views[activeView].component : null
  const activeTitle = activeView ? views[activeView].title : ""

  const actionIcons = [
    { tool: "move", view: "chat", icon: MessageSquare, label: "Chat" },
    { tool: "move", view: "handouts", icon: FileText, label: "Utilitários", playerOnly: true }, // Ícone para jogadores
    { tool: "move", view: null, icon: MousePointer, label: "Mover / Selecionar", separator: true },
    { tool: "measure", view: null, icon: Ruler, label: "Medir Distância" },
    { tool: "mark", view: "mark", icon: MapPin, label: "Marcadores", masterOnly: true },
    { tool: "draw", view: "draw", icon: Palette, label: "Desenho Livre", masterOnly: true },
    { tool: "move", view: "npcs", icon: Ghost, label: "Criaturas", masterOnly: true, separator: true },
    { tool: "move", view: "player", icon: User, label: "Seu Personagem", playerOnly: true, separator: true },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "h-full bg-background border-l flex transition-all duration-300 ease-in-out z-10",
          isOpen ? "w-full max-w-sm" : "w-16",
        )}
      >
        <div className="flex flex-col h-full items-center gap-2 p-2 border-r">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <PanelRightClose /> : <PanelRightOpen />}
          </Button>
          {actionIcons.map((item) => {
            if ((item.masterOnly && !isMaster) || (item.playerOnly && isMaster)) return null
            const Icon = item.icon
            return (
              <React.Fragment key={item.label}>
                {item.separator && <Separator />}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isOpen && activeView === item.view ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => handleViewChange(item.tool as GridTool, item.view as PanelView | null)}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">{item.label}</TooltipContent>
                </Tooltip>
              </React.Fragment>
            )
          })}
        </div>

        <div
          className={cn(
            "flex-1 flex flex-col transition-opacity",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {ActiveComponent && (
            <>
              <header className="flex items-center justify-between p-4 border-b shrink-0">
                <h2 className="text-lg font-semibold">{activeTitle}</h2>
              </header>
              <div className="flex-1 h-full">
                <ActiveComponent />
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

const markerColors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ffffff"]
