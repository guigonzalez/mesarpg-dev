"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useMesaStore } from "@/lib/store"
import { Grid, type GridTool } from "@/components/rpg/grid"
import { ArrowLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MasterSidebar } from "@/components/rpg/master-sidebar"
import { ActionSidebar } from "@/components/rpg/action-sidebar"
import type { DrawnLine } from "@/lib/types"

export default function CampaignPage() {
  const currentUser = useMesaStore((state) => state.currentUser)
  const activeCampaign = useMesaStore((state) => state.activeCampaign)
  const { setActiveCampaign, clearActiveCampaign, clearMarkers, updateActiveCampaign } = useMesaStore()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [activeTool, setActiveTool] = useState<GridTool>("move")
  const [markerColor, setMarkerColor] = useState("#ef4444")
  const [drawColor, setDrawColor] = useState("#ef4444")
  const [lines, setLines] = useState<DrawnLine[]>(activeCampaign?.drawing || [])

  useEffect(() => {
    if (!currentUser) router.replace("/login")
    if (!activeCampaign || activeCampaign.id !== campaignId) setActiveCampaign(campaignId)
  }, [currentUser, router, campaignId, activeCampaign, setActiveCampaign])

  useEffect(() => {
    if (activeCampaign?.drawing) setLines(activeCampaign.drawing)
  }, [activeCampaign?.drawing])

  const handleSetLines = (newLines: DrawnLine[]) => {
    setLines(newLines)
    updateActiveCampaign({ drawing: newLines })
  }

  const handleClearDrawing = () => handleSetLines([])

  useEffect(() => {
    return () => clearActiveCampaign()
  }, [clearActiveCampaign])

  if (!currentUser || !activeCampaign) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando campanha...</div>
  }

  const isMaster = currentUser.id === activeCampaign.masterId

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40">
      <header className="flex items-center justify-between p-2 border-b bg-background shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" aria-label="Voltar ao Dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">{activeCampaign.name}</h1>
            <p className="text-xs text-muted-foreground">{activeCampaign.system}</p>
          </div>
        </div>
        {isMaster && (
          <Link href={`/campanhas/${campaignId}/settings`}>
            <Button variant="outline" size="icon" aria-label="Configurações da Campanha">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </header>
      <div className="flex flex-1 overflow-hidden">
        {isMaster && <MasterSidebar />}
        <main className="relative flex-1 overflow-hidden h-full flex flex-col">
          <Grid
            activeTool={activeTool}
            markerColor={markerColor}
            drawColor={drawColor}
            lines={lines}
            setLines={handleSetLines}
          />
        </main>
        <ActionSidebar
          isMaster={isMaster}
          activeTool={activeTool}
          onToolChange={setActiveTool}
          markerColor={markerColor}
          onMarkerColorChange={setMarkerColor}
          onClearMarkers={clearMarkers}
          drawColor={drawColor}
          onDrawColorChange={setDrawColor}
          onClearDrawing={handleClearDrawing}
        />
      </div>
    </div>
  )
}
