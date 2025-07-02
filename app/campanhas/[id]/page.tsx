"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from '@/lib/supabase-browser'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/lib/database.types'
import { Grid, type GridTool } from "@/components/rpg/grid"
import { ArrowLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MasterSidebar } from "@/components/rpg/master-sidebar"
import { ActionSidebar } from "@/components/rpg/action-sidebar"
import type { DrawnLine } from "@/lib/types"

type Campaign = Database['public']['Tables']['campaigns']['Row']

export default function CampaignPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const supabase = createClientComponentClient()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados do grid (mockados por enquanto)
  const [activeTool, setActiveTool] = useState<GridTool>("move")
  const [markerColor, setMarkerColor] = useState("#ef4444")
  const [drawColor, setDrawColor] = useState("#ef4444")
  const [lines, setLines] = useState<DrawnLine[]>([])

  useEffect(() => {
    if (!user) {
      router.replace("/login")
      return
    }
    
    if (!campaignId) {
      router.replace("/dashboard")
      return
    }

    fetchCampaignData()
  }, [user, router, campaignId])

  const fetchCampaignData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Buscando campanha:', campaignId)
      console.log('Usuário:', user?.id)

      // Buscar dados da campanha
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      console.log('Resultado da busca:', { campaignData, campaignError })

      if (campaignError) {
        if (campaignError.code === 'PGRST116') {
          setError('Campanha não encontrada')
          return
        }
        throw campaignError
      }

      // Verificar se o usuário tem acesso à campanha
      const hasAccess = campaignData.master_id === user?.id
      console.log('Verificando acesso:', { master_id: campaignData.master_id, user_id: user?.id, hasAccess })
      
      if (!hasAccess) {
        // TODO: Verificar se é jogador da campanha
        console.log('Usuário não tem acesso como mestre, verificando se é jogador...')
        setError('Você não tem acesso a esta campanha')
        return
      }

      setCampaign(campaignData)

    } catch (err) {
      console.error('Erro ao carregar campanha:', err)
      setError('Erro ao carregar dados da campanha')
    } finally {
      setLoading(false)
    }
  }

  const handleSetLines = (newLines: DrawnLine[]) => {
    setLines(newLines)
    // TODO: Salvar no Supabase
  }

  const handleClearDrawing = () => handleSetLines([])

  const clearMarkers = () => {
    // TODO: Implementar limpeza de marcadores
    console.log('Limpar marcadores')
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando campanha...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return null
  }

  const isMaster = user?.id === campaign.master_id

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40">
      {/* Header da Campanha */}
      <header className="flex items-center justify-between p-2 border-b bg-background shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" aria-label="Voltar ao Dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">{campaign.name}</h1>
            <p className="text-xs text-muted-foreground">{campaign.system}</p>
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

      {/* Conteúdo Principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar do Mestre (esquerda) */}
        {isMaster && <MasterSidebar />}
        
        {/* Grid Principal */}
        <main className="relative flex-1 overflow-hidden h-full flex flex-col">
          <Grid
            activeTool={activeTool}
            markerColor={markerColor}
            drawColor={drawColor}
            lines={lines}
            setLines={handleSetLines}
          />
        </main>
        
        {/* Sidebar de Ações (direita) */}
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
