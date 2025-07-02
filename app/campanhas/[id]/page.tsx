'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase-browser'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Settings, Plus, Mail, Crown, User } from 'lucide-react'

type Campaign = Database['public']['Tables']['campaigns']['Row']
type CampaignPlayer = Database['public']['Tables']['campaign_players']['Row'] & {
  users: {
    name: string | null
    email: string
  } | null
}

export default function CampaignPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [players, setPlayers] = useState<CampaignPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()
  const campaignId = params.id as string

  // Verificar se o usuário é o mestre da campanha
  const isMaster = campaign?.master_id === user?.id

  useEffect(() => {
    if (!user || !campaignId) return

    fetchCampaignData()
  }, [user, campaignId])

  const fetchCampaignData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar dados da campanha
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campaignError) {
        if (campaignError.code === 'PGRST116') {
          setError('Campanha não encontrada')
          return
        }
        throw campaignError
      }

      // Verificar se o usuário tem acesso à campanha
      const hasAccess = campaignData.master_id === user?.id
      if (!hasAccess) {
        // TODO: Verificar se é jogador da campanha
        setError('Você não tem acesso a esta campanha')
        return
      }

      setCampaign(campaignData)

      // Buscar jogadores da campanha
      const { data: playersData, error: playersError } = await supabase
        .from('campaign_players')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'active')

      if (playersError) {
        console.error('Erro ao buscar jogadores:', playersError)
      } else {
        setPlayers(playersData || [])
      }

    } catch (err) {
      console.error('Erro ao carregar campanha:', err)
      setError('Erro ao carregar dados da campanha')
    } finally {
      setLoading(false)
    }
  }

  const handleInvitePlayer = () => {
    // TODO: Implementar modal de convite
    console.log('Convidar jogador')
  }

  const handleSettings = () => {
    router.push(`/campanhas/${campaignId}/settings`)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando campanha...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header da Campanha */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {campaign.name}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{campaign.system}</Badge>
              {isMaster && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Crown className="w-3 h-3 mr-1" />
                  Mestre
                </Badge>
              )}
            </div>
            {campaign.description && (
              <p className="text-muted-foreground max-w-2xl">
                {campaign.description}
              </p>
            )}
          </div>
          
          {isMaster && (
            <div className="flex gap-2">
              <Button onClick={handleInvitePlayer} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Convidar Jogador
              </Button>
              <Button onClick={handleSettings} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="players">
            <Users className="w-4 h-4 mr-2" />
            Jogadores ({players.length})
          </TabsTrigger>
          <TabsTrigger value="characters">Personagens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card de Informações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Sistema:</span>
                  <p className="font-medium">{campaign.system}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Criada em:</span>
                  <p className="font-medium">
                    {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Jogadores:</span>
                  <p className="font-medium">{players.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Card de Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              </CardContent>
            </Card>

            {/* Card de Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isMaster && (
                  <>
                    <Button 
                      onClick={handleInvitePlayer} 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Convidar Jogador
                    </Button>
                    <Button 
                      onClick={handleSettings} 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Meu Personagem
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Jogadores da Campanha</h2>
            {isMaster && (
              <Button onClick={handleInvitePlayer} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Convidar Jogador
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Card key={player.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {player.users?.name || 'Usuário'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {player.users?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {players.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum jogador na campanha ainda
                </p>
                {isMaster && (
                  <Button onClick={handleInvitePlayer} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Convidar Primeiro Jogador
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="characters" className="space-y-6">
          <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Sistema de personagens em desenvolvimento
            </p>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá criar e gerenciar fichas de personagem
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
