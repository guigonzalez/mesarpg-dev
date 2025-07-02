"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from '@/lib/supabase-browser'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/lib/database.types'
import { Grid, type GridTool } from "@/components/rpg/grid"
import { useMesaStore } from "@/lib/store"
import { ArrowLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MasterSidebar } from "@/components/rpg/master-sidebar"
import { ActionSidebar } from "@/components/rpg/action-sidebar"
import type { DrawnLine } from "@/lib/types"

type Campaign = Database['public']['Tables']['campaigns']['Row']

export default function CampaignPage() {
  console.log('CampaignPage - Componente iniciado')
  
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const supabase = createClientComponentClient()
  const setActiveCampaign = useMesaStore((state) => state.setActiveCampaign)

  console.log('CampaignPage - Params:', params)
  console.log('CampaignPage - Campaign ID:', campaignId)
  console.log('CampaignPage - User:', user?.id)
  console.log('CampaignPage - Auth Loading:', authLoading)

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados do grid (mockados por enquanto)
  const [activeTool, setActiveTool] = useState<GridTool>("move")
  const [markerColor, setMarkerColor] = useState("#ef4444")
  const [drawColor, setDrawColor] = useState("#ef4444")
  const [lines, setLines] = useState<DrawnLine[]>([])

  useEffect(() => {
    // Aguardar o loading da autenticação terminar
    if (authLoading) {
      console.log('CampaignPage - Aguardando autenticação...')
      return
    }

    if (!user) {
      console.log('CampaignPage - Usuário não autenticado, redirecionando para login')
      router.replace("/login")
      return
    }
    
    if (!campaignId) {
      console.log('CampaignPage - ID da campanha não encontrado, redirecionando para dashboard')
      router.replace("/dashboard")
      return
    }

    console.log('CampaignPage - Iniciando busca da campanha')
    fetchCampaignData()
  }, [user, router, campaignId, authLoading])

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
      const isMaster = campaignData.master_id === user?.id
      console.log('🔍 VERIFICAÇÃO DE MESTRE DETALHADA:')
      console.log('  Campaign master_id:', campaignData.master_id)
      console.log('  Campaign master_id type:', typeof campaignData.master_id)
      console.log('  User ID:', user?.id)
      console.log('  User ID type:', typeof user?.id)
      console.log('  User email:', user?.email)
      console.log('  IDs são iguais?', campaignData.master_id === user?.id)
      console.log('  Comparação string:', String(campaignData.master_id) === String(user?.id))
      console.log('  isMaster resultado:', isMaster)
      
      let hasAccess = isMaster
      
      // Se não é mestre, verificar se é jogador da campanha
      if (!isMaster) {
        console.log('Usuário não é mestre, verificando se é jogador...')
        const { data: playerData, error: playerError } = await supabase
          .from('campaign_players')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('user_id', user?.id)
          .eq('status', 'active')
          .single()

        console.log('Resultado da busca de jogador:', { playerData, playerError })
        
        if (playerData) {
          hasAccess = true
          console.log('Usuário é jogador da campanha')
        }
      }

      if (!hasAccess) {
        console.log('Usuário não tem acesso à campanha')
        setError('Você não tem acesso a esta campanha')
        return
      }

      console.log('Acesso permitido:', { isMaster, hasAccess })
      setCampaign(campaignData)
      
      // Definir campanha ativa no store para a MasterSidebar
      console.log('🏪 Definindo campanha ativa no store:', campaignData.id)
      setActiveCampaign(campaignData)

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
  
  console.log('🎮 RENDERIZAÇÃO DA INTERFACE:')
  console.log('  isMaster na renderização:', isMaster)
  console.log('  Vai mostrar sidebar do mestre?', isMaster)
  console.log('  Vai mostrar botão de settings?', isMaster)

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
