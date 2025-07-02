"use client"

import type React from "react"
import { useState } from "react"
import { Ghost, Map, Users, FileText, ScrollText, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database } from '@/lib/database.types'

type Campaign = Database['public']['Tables']['campaigns']['Row']
type PanelView = "players" | "maps" | "npcs" | "handouts" | "sheets"

interface MasterSidebarProps {
  campaign: Campaign
}

export function MasterSidebar({ campaign }: MasterSidebarProps) {
  console.log('🎮 MasterSidebar - Componente iniciado (REFATORADO)')
  console.log('🎮 MasterSidebar - Campaign recebida via props:', campaign)
  
  const [isOpen, setIsOpen] = useState(true)
  const [activeView, setActiveView] = useState<PanelView>("players")

  if (!campaign) {
    console.log('🎮 MasterSidebar - Sem campanha, retornando null')
    return null
  }

  console.log('🎮 MasterSidebar - Renderizando sidebar (REFATORADO)')

  const handleViewChange = (view: PanelView) => {
    setActiveView(view)
    setIsOpen(true)
  }

  // Componentes simples para substituir os complexos do MVP
  const SimplePlayerList = () => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Lista de jogadores conectados aparecerá aqui</p>
      <div className="p-2 border rounded">
        <p className="font-medium">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )

  const SimpleMapManagement = () => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Gerenciamento de mapas aparecerá aqui</p>
      <div className="p-2 border rounded">
        <p className="font-medium">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )

  const SimpleNpcManagement = () => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Gerenciamento de NPCs aparecerá aqui</p>
      <div className="p-2 border rounded">
        <p className="font-medium">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )

  const SimpleHandoutManagement = () => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Utilitários e handouts aparecerão aqui</p>
      <div className="p-2 border rounded">
        <p className="font-medium">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )

  const SimpleSheetViewer = () => (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Fichas dos jogadores aparecerão aqui</p>
      <div className="p-2 border rounded">
        <p className="font-medium">Funcionalidade em desenvolvimento</p>
      </div>
    </div>
  )

  const views: { [key in PanelView]: { title: string; component: React.FC<any> } } = {
    players: { title: "Jogadores na Mesa", component: SimplePlayerList },
    maps: { title: "Gerenciar Mapas", component: SimpleMapManagement },
    npcs: { title: "Gerenciar NPCs", component: SimpleNpcManagement },
    handouts: { title: "Gerenciar Utilitários", component: SimpleHandoutManagement },
    sheets: { title: "Fichas dos Jogadores", component: SimpleSheetViewer },
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
