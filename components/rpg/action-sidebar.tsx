"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { GridTool } from "./grid"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Database } from '@/lib/database.types'
import type { SheetTemplate } from '@/lib/database.types'
import { CharacterListPanel } from './character-list-panel'

type Campaign = Database['public']['Tables']['campaigns']['Row']
type User = Database['public']['Tables']['users']['Row']

type Token = {
  id: string
  ownerId: string
  type: 'player' | 'npc'
  name: string
  image: string
  position: { x: number; y: number }
}

type Npc = {
  id: string
  name: string
  tokenImage?: string
  avatarUrl?: string
}

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

const SimpleNpcListPanel = ({ npcs }: { npcs: Npc[] }) => {
  console.log('🎮 ActionSidebar - SimpleNpcListPanel:', npcs.length, 'NPCs')
  
  const handleDragStart = (e: any, npcId: string) => e.dataTransfer.setData("npcId", npcId)
  
  if (!npcs || npcs.length === 0) {
    return <p className="text-sm text-muted-foreground p-4 text-center">Nenhum NPC criado.</p>
  }
  
  return (
    <div className="space-y-2 p-2">
      {npcs.map((npc) => (
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

const SimplePlayerTokenPanel = ({ 
  user, 
  tokens, 
  isMaster 
}: { 
  user: User
  tokens: Token[]
  isMaster: boolean 
}) => {
  console.log('🎮 ActionSidebar - SimplePlayerTokenPanel:', user.name, 'isMaster:', isMaster)
  
  if (isMaster) return null
  
  const playerTokenOnGrid = tokens.find((token) => token.ownerId === user.id)
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
          <AvatarImage src={user.token_image || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.name}</span>
      </div>
    </div>
  )
}

const SimpleChatPanel = () => (
  <div className="p-4 text-center">
    <p className="text-sm text-muted-foreground">Chat em desenvolvimento</p>
  </div>
)

const SimpleHandoutPanel = () => (
  <div className="p-4 text-center">
    <p className="text-sm text-muted-foreground">Utilitários em desenvolvimento</p>
  </div>
)

const CharacterCreationPanel = ({ 
  campaign, 
  user, 
  isMaster 
}: { 
  campaign: Campaign
  user: User
  isMaster: boolean 
}) => {
  const router = useRouter()
  
  const handleCreateCharacter = () => {
    // Verificar se a campanha tem template configurado
    const template = campaign.sheet_template as SheetTemplate | null
    if (!template || !template.fields?.length) {
      alert('Template de ficha não configurado. Configure o template nas configurações da campanha primeiro.')
      router.push(`/campanhas/${campaign.id}/settings`)
      return
    }
    
    // Redirecionar para página de criação de personagem
    router.push(`/campanhas/${campaign.id}/personagem/novo`)
  }
  
  const handleEditCharacter = () => {
    // TODO: Buscar ID do personagem existente e redirecionar para edição
    router.push(`/campanhas/${campaign.id}/personagem`)
  }
  
  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <h3 className="font-semibold mb-2">
          {isMaster ? 'Gerenciar Personagens' : 'Meu Personagem'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isMaster 
            ? 'Crie personagens para NPCs ou gerencie fichas dos jogadores'
            : 'Crie e edite a ficha do seu personagem para esta campanha'
          }
        </p>
      </div>
      
      <div className="space-y-2">
        <Button 
          onClick={handleCreateCharacter}
          className="w-full"
          variant="default"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {isMaster ? 'Criar Personagem' : 'Criar Meu Personagem'}
        </Button>
        
        {!isMaster && (
          <Button 
            onClick={handleEditCharacter}
            className="w-full"
            variant="outline"
          >
            <User className="h-4 w-4 mr-2" />
            Ver Minha Ficha
          </Button>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        {(() => {
          const template = campaign.sheet_template as SheetTemplate | null
          return template?.fields?.length 
            ? `Template: ${template.fields.length} campos`
            : 'Template não configurado'
        })()}
      </div>
    </div>
  )
}

// --- Componente Principal ---

type PanelView = "chat" | "mark" | "draw" | "npcs" | "player" | "handouts" | "character"

interface ActionSidebarProps {
  campaign: Campaign
  user: User
  isMaster: boolean
  activeTool: GridTool
  onToolChange: (tool: GridTool) => void
  markerColor: string
  onMarkerColorChange: (color: string) => void
  onClearMarkers: () => void
  drawColor: string
  onDrawColorChange: (color: string) => void
  onClearDrawing: () => void
  // Data props
  tokens: Token[]
  npcs: Npc[]
}

export function ActionSidebar({ 
  campaign,
  user,
  isMaster, 
  onToolChange, 
  tokens,
  npcs,
  ...props 
}: ActionSidebarProps) {
  console.log('🎮 ActionSidebar - Componente iniciado (REFATORADO)')
  console.log('🎮 ActionSidebar - Campaign:', campaign?.name)
  console.log('🎮 ActionSidebar - User:', user?.name)
  console.log('🎮 ActionSidebar - Is Master:', isMaster)
  console.log('🎮 ActionSidebar - Tokens count:', tokens.length)
  console.log('🎮 ActionSidebar - NPCs count:', npcs.length)
  
  const [isOpen, setIsOpen] = useState(true)
  const [activeView, setActiveView] = useState<PanelView | null>("chat")

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
    chat: { title: "Chat da Sessão", component: SimpleChatPanel },
    mark: { title: "Marcadores", component: () => <MarkToolPanel {...props} /> },
    draw: { title: "Desenho Livre", component: () => <DrawToolPanel {...props} /> },
    npcs: { title: "Criaturas", component: () => <SimpleNpcListPanel npcs={npcs} /> },
    player: { title: "Seu Personagem", component: () => <SimplePlayerTokenPanel user={user} tokens={tokens} isMaster={isMaster} /> },
    handouts: { title: "Utilitários", component: SimpleHandoutPanel },
    character: { title: "Personagens", component: () => <CharacterListPanel campaign={campaign} currentUser={user} isMaster={isMaster} /> },
  }

  const ActiveComponent = activeView ? views[activeView].component : null
  const activeTitle = activeView ? views[activeView].title : ""

  const actionIcons = [
    { tool: "move", view: "chat", icon: MessageSquare, label: "Chat" },
    { tool: "move", view: "character", icon: UserPlus, label: "Criar Personagem" },
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
