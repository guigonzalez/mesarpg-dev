"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from '@/lib/supabase-browser'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/lib/database.types'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, Users, ClipboardList, Trash2 } from "lucide-react"

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

  // Componente funcional para configurações gerais
  const CampaignSettingsForm = () => {
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
      name: campaign.name,
      system: campaign.system,
      description: campaign.description || ''
    })
    const [errors, setErrors] = useState<{[key: string]: string}>({})

    console.log('🎮 CampaignSettingsForm - Iniciado')
    console.log('🎮 CampaignSettingsForm - Campaign:', campaign.name)
    console.log('🎮 CampaignSettingsForm - Form data:', formData)

    const validateForm = () => {
      const newErrors: {[key: string]: string} = {}
      
      if (!formData.name.trim()) {
        newErrors.name = 'Nome da campanha é obrigatório'
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
      } else if (formData.name.trim().length > 100) {
        newErrors.name = 'Nome deve ter no máximo 100 caracteres'
      }

      if (!formData.system) {
        newErrors.system = 'Sistema de RPG é obrigatório'
      }

      if (formData.description.length > 500) {
        newErrors.description = 'Descrição deve ter no máximo 500 caracteres'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
      console.log('🎮 CampaignSettingsForm - Salvando:', formData)
      
      if (!validateForm()) {
        console.log('🎮 CampaignSettingsForm - Validação falhou:', errors)
        return
      }

      setIsSaving(true)
      setErrors({})

      try {
        const { data, error } = await supabase
          .from('campaigns')
          .update({
            name: formData.name.trim(),
            system: formData.system as Database['public']['Enums']['campaign_system'],
            description: formData.description.trim() || null
          })
          .eq('id', campaign.id)
          .eq('master_id', user?.id) // Política de segurança: só o mestre pode editar
          .select()
          .single()

        if (error) {
          console.error('🎮 CampaignSettingsForm - Erro ao salvar:', error)
          throw error
        }

        console.log('🎮 CampaignSettingsForm - Salvo com sucesso:', data)
        
        // Atualizar o estado local da campanha
        setCampaign(data)
        setIsEditing(false)
        
        // Mostrar feedback de sucesso (você pode adicionar um toast aqui)
        console.log('✅ Configurações salvas com sucesso!')

      } catch (err) {
        console.error('🎮 CampaignSettingsForm - Erro:', err)
        setErrors({ 
          general: err instanceof Error ? err.message : 'Erro ao salvar configurações' 
        })
      } finally {
        setIsSaving(false)
      }
    }

    const handleCancel = () => {
      setFormData({
        name: campaign.name,
        system: campaign.system,
        description: campaign.description || ''
      })
      setErrors({})
      setIsEditing(false)
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Configurações Gerais</h3>
          <p className="text-sm text-muted-foreground">Gerencie as configurações básicas da campanha</p>
        </div>

        {errors.general && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{errors.general}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Nome da Campanha */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Nome da Campanha</h4>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Nome da campanha"
                  maxLength={100}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">{errors.name}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{campaign.name}</p>
            )}
          </div>

          {/* Sistema de RPG */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Sistema de RPG</h4>
            {isEditing ? (
              <div className="space-y-2">
                <select
                  value={formData.system}
                  onChange={(e) => setFormData(prev => ({ ...prev, system: e.target.value as Database['public']['Enums']['campaign_system'] }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="D&D 5e">D&D 5e</option>
                  <option value="Vampiro: A Máscara">Vampiro: A Máscara</option>
                  <option value="Livre">Sistema Livre</option>
                </select>
                {errors.system && (
                  <p className="text-destructive text-sm">{errors.system}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{campaign.system}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Descrição</h4>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-md h-24 resize-none"
                  placeholder="Descrição da campanha (opcional)"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {formData.description.length}/500 caracteres
                  </span>
                  {errors.description && (
                    <p className="text-destructive text-sm">{errors.description}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {campaign.description || 'Nenhuma descrição'}
              </p>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Editar Configurações
              </Button>
            )}
          </div>
          
          {/* Botão de Deletar Campanha */}
          {!isEditing && (
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Deletar Campanha
            </Button>
          )}
        </div>
      </div>
    )
  }

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

  // Modal de confirmação para deletar campanha
  const DeleteCampaignModal = () => {
    const [confirmationText, setConfirmationText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState('')

    const handleDelete = async () => {
      console.log('🗑️ DeleteCampaignModal - Iniciando deleção da campanha')
      
      if (confirmationText !== campaign.name) {
        setError('O nome da campanha não confere')
        return
      }

      setIsDeleting(true)
      setError('')

      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ status: 'deleted' as Database['public']['Enums']['campaign_status'] })
          .eq('id', campaign.id)
          .eq('master_id', user?.id) // Política de segurança: só o mestre pode deletar

        if (error) {
          console.error('🗑️ DeleteCampaignModal - Erro ao deletar:', error)
          throw error
        }

        console.log('🗑️ DeleteCampaignModal - Campanha deletada com sucesso')
        
        // Redirecionar para o dashboard
        router.push('/dashboard')

      } catch (err) {
        console.error('🗑️ DeleteCampaignModal - Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro ao deletar campanha')
      } finally {
        setIsDeleting(false)
      }
    }

    const handleClose = () => {
      setConfirmationText('')
      setError('')
      setShowDeleteModal(false)
    }

    if (!showDeleteModal) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 border">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Deletar Campanha</h3>
                <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm">
                Você está prestes a deletar a campanha <strong>"{campaign.name}"</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                A campanha será marcada como deletada e não aparecerá mais no seu dashboard, 
                mas os dados serão preservados no banco de dados.
              </p>
              <p className="text-sm font-medium">
                Para confirmar, digite o nome da campanha abaixo:
              </p>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={campaign.name}
                  className="w-full p-2 border rounded-md"
                  disabled={isDeleting}
                />
                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || confirmationText !== campaign.name}
                className="flex-1 flex items-center gap-2"
              >
                {isDeleting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {isDeleting ? 'Deletando...' : 'Deletar Campanha'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            <CampaignSettingsForm />
          </TabsContent>
          <TabsContent value="players" className="mt-6">
            <SimplePlayerManagement />
          </TabsContent>
          <TabsContent value="sheet" className="mt-6">
            <SimpleSheetTemplateEditor />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Modal de Confirmação */}
      <DeleteCampaignModal />
    </div>
  )
}
