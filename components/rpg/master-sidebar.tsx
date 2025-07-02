"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useMesaStore } from "@/lib/store"
import { Ghost, Map, Users, FileText, ScrollText, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapManagement } from "@/components/master-view/map-management"
import { SheetViewer } from "@/components/master-view/sheet-viewer"
import { NpcManagement } from "@/components/master-view/npc-management"
import { HandoutManagement } from "@/components/master-view/handout-management"
import { PlayerList } from "./player-list"

type PanelView = "players" | "maps" | "npcs" | "handouts" | "sheets"

export function MasterSidebar() {
  console.log('🎮 MasterSidebar - Componente iniciado')
  
  const campaign = useMesaStore((state) => state.activeCampaign)
  const [isOpen, setIsOpen] = useState(true)
  const [activeView, setActiveView] = useState<PanelView>("players")
  const [shouldRender, setShouldRender] = useState(false)

  console.log('🎮 MasterSidebar - Campaign do store:', campaign)
  console.log('🎮 MasterSidebar - Campaign existe?', !!campaign)

  // Aguardar o store ser atualizado
  useEffect(() => {
    if (campaign) {
      console.log('🎮 MasterSidebar - Store atualizado, permitindo renderização')
      setShouldRender(true)
    } else {
      console.log('🎮 MasterSidebar - Store ainda vazio, aguardando...')
      setShouldRender(false)
    }
  }, [campaign])

  if (!campaign || !shouldRender) {
    console.log('🎮 MasterSidebar - Retornando null (sem campanha ou aguardando store)')
    return null
  }

  console.log('🎮 MasterSidebar - Renderizando sidebar')

  const handleViewChange = (view: PanelView) => {
    setActiveView(view)
    setIsOpen(true)
  }

  const views: { [key in PanelView]: { title: string; component: React.FC<any> } } = {
    players: { title: "Jogadores na Mesa", component: PlayerList },
    maps: { title: "Gerenciar Mapas", component: MapManagement },
    npcs: { title: "Gerenciar NPCs", component: NpcManagement },
    handouts: { title: "Gerenciar Utilitários", component: HandoutManagement },
    sheets: { title: "Fichas dos Jogadores", component: SheetViewer },
  }

  const ActiveComponent = views[activeView].component

  const sidebarIcons = [
    { view: "players", icon: Users, label: "Jogadores" },
    { view: "maps", icon: Map, label: "Mapas" },
    { view: "npcs", icon: Ghost, label: "NPCs" },
    { view: "handouts", icon: FileText, label: "Utilitários" },
    { view: "sheets", icon: ScrollText, label: "Fichas dos Jogadores" },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "h-full bg-background border-r flex transition-all duration-300 ease-in-out z-10",
          isOpen ? "w-full max-w-sm" : "w-16",
        )}
      >
        <div className="flex flex-col h-full items-center gap-2 p-2 border-r">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
          <Separator />
          {sidebarIcons.map((item) => {
            const Icon = item.icon
            return (
              <Tooltip key={item.view}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isOpen && activeView === item.view ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => handleViewChange(item.view as PanelView)}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        <div
          className={cn(
            "flex-1 flex flex-col transition-opacity",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <header className="flex items-center justify-between p-4 border-b shrink-0">
            <h2 className="text-lg font-semibold">{views[activeView].title}</h2>
          </header>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <ActiveComponent campaign={campaign} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  )
}
