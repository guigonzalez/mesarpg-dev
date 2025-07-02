"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from '@/lib/supabase-browser'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/lib/database.types'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, Users, ClipboardList } from "lucide-react"

type Campaign = Database['public']['Tables']['campaigns']['Row']

export default function CampaignSettingsPage() {
  console.log('CampaignSettingsPage - Componente iniciado (REFATORADO)')
  
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const supabase = createClientComponentClient()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('CampaignSettingsPage - Campaign ID:', campaignId)
  console.log('CampaignSettingsPage - User:', user?.id)

  useEffect(() => {
    if (authLoading) {
      console.log('CampaignSettingsPage - Aguardando autenticação...')
      return
    }

    if (!user) {
      console.log('CampaignSettingsPage - Usuário não autenticado, redirecionando para login')
      router.replace("/login")
      return
    }
    
    if (!campaignId) {
      console.log('CampaignSettingsPage - ID da campanha não encontrado, redirecionando para dashboard')
      router.replace("/dashboard")
      return
    }

    console.log('CampaignSettingsPage - Iniciando busca da campanha')
    fetchCampaignData()
  }, [user, router, campaignId, authLoading])

  const fetchCampaignData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('CampaignSettingsPage - Buscando campanha:', campaignId)

      // Buscar dados da campanha
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      console.log('CampaignSettingsPage - Resultado da busca:', { campaignData, campaignError })

      if (campaignError) {
        if (campaignError.code === 'PGRST116') {
          setError('Campanha não encontrada')
          return
        }
        throw campaignError
      }

      // Verificar se o usuário é o mestre da campanha
      const isMaster = campaignData.master_id === user?.id
      console.log('CampaignSettingsPage - É mestre?', isMaster)

      if (!isMaster) {
        console.log('CampaignSettingsPage - Usuário não é mestre, redirecionando para campanha')
        router.replace(`/campanhas/${campaignId}`)
        return
      }

      console.log('CampaignSettingsPage - Acesso permitido, definindo campanha')
      setCampaign(campaignData)

    } catch (err) {
      console.error('CampaignSettingsPage - Erro ao carregar campanha:', err)
      setError('Erro ao carregar dados da campanha')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
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

  console.log('CampaignSettingsPage - Renderizando página de configurações')

  // Componentes simples para substituir os complexos do MVP
  const SimpleCampaignSettingsForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configurações Gerais</h3>
        <p className="text-sm text-muted-foreground">Gerencie as configurações básicas da campanha</p>
      </div>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Nome da Campanha</h4>
          <p className="text-sm text-muted-foreground mb-2">Nome atual: {campaign.name}</p>
          <p className="text-sm text-muted-foreground">Funcionalidade de edição em desenvolvimento</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Sistema de RPG</h4>
          <p className="text-sm text-muted-foreground mb-2">Sistema atual: {campaign.system}</p>
          <p className="text-sm text-muted-foreground">Funcionalidade de edição em desenvolvimento</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Descrição</h4>
          <p className="text-sm text-muted-foreground mb-2">Descrição atual: {campaign.description || 'Nenhuma descrição'}</p>
          <p className="text-sm text-muted-foreground">Funcionalidade de edição em desenvolvimento</p>
        </div>
      </div>
    </div>
  )

  const SimplePlayerManagement = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Gerenciamento de Jogadores</h3>
        <p className="text-sm text-muted-foreground">Convide e gerencie jogadores da campanha</p>
      </div>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Jogadores Atuais</h4>
          <p className="text-sm text-muted-foreground">Lista de jogadores aparecerá aqui</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Convidar Jogadores</h4>
          <p className="text-sm text-muted-foreground">Sistema de convites em desenvolvimento</p>
        </div>
      </div>
    </div>
  )

  const SimpleSheetTemplateEditor = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Template da Ficha</h3>
        <p className="text-sm text-muted-foreground">Configure os campos das fichas dos personagens</p>
      </div>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Template Atual</h4>
          <p className="text-sm text-muted-foreground mb-2">Sistema: {campaign.system}</p>
          <p className="text-sm text-muted-foreground">Editor de template em desenvolvimento</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Campos da Ficha</h4>
          <p className="text-sm text-muted-foreground">Configuração de campos em desenvolvimento</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/campanhas/${campaignId}`}>
            <Button variant="outline" size="icon" aria-label="Voltar para a Campanha">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Configurações da Campanha</h1>
            <p className="text-sm text-muted-foreground">{campaign.name}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              <Settings className="mr-2 h-4 w-4" /> Geral
            </TabsTrigger>
            <TabsTrigger value="players">
              <Users className="mr-2 h-4 w-4" /> Jogadores
            </TabsTrigger>
            <TabsTrigger value="sheet">
              <ClipboardList className="mr-2 h-4 w-4" /> Template da Ficha
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-6">
            <SimpleCampaignSettingsForm />
          </TabsContent>
          <TabsContent value="players" className="mt-6">
            <SimplePlayerManagement />
          </TabsContent>
          <TabsContent value="sheet" className="mt-6">
            <SimpleSheetTemplateEditor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
