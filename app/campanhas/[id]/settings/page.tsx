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
import { SheetTemplateEditor } from "@/components/master-view/sheet-template-editor"

type Campaign = Database['public']['Tables']['campaigns']['Row']

interface SheetField {
  name: string
  type: 'text' | 'number' | 'textarea'
}

interface SheetTemplate {
  name: string
  fields: SheetField[]
}

export default function CampaignSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const supabase = createClientComponentClient()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.replace("/login")
      return
    }
    
    if (!campaignId) {
      router.replace("/dashboard")
      return
    }

    fetchCampaignData()
  }, [user, router, campaignId, authLoading])

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

      // Verificar se o usuário é o mestre da campanha
      const isMaster = campaignData.master_id === user?.id

      if (!isMaster) {
        router.replace(`/campanhas/${campaignId}`)
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

  const PlayerManagement = () => {
    const [players, setPlayers] = useState<any[]>([])
    const [pendingInvites, setPendingInvites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [error, setError] = useState('')

    // Buscar jogadores e convites pendentes
    useEffect(() => {
      fetchPlayersAndInvites()
    }, [])

    const fetchPlayersAndInvites = async () => {
      try {
        setLoading(true)

        // Buscar jogadores atuais
        const { data: playersData, error: playersError } = await supabase
          .from('campaign_players')
          .select(`
            *,
            users (
              id,
              name,
              email
            )
          `)
          .eq('campaign_id', campaign.id)
          .eq('status', 'active')

        if (playersError) {
          throw playersError
        }

        // Buscar emails dos jogadores atuais para filtrar convites já aceitos
        const playerEmails = playersData?.map(p => p.users?.email).filter(Boolean) || []

        // Buscar convites pendentes (não expirados e email não está na campanha)
        const { data: allInvitesData, error: invitesError } = await supabase
          .from('invites')
          .select('*')
          .eq('campaign_id', campaign.id)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })

        if (invitesError) {
          throw invitesError
        }

        // Filtrar convites cujo email não está na lista de jogadores
        const invitesData = allInvitesData?.filter(invite => 
          !playerEmails.includes(invite.email)
        ) || []

        setPlayers(playersData || [])
        setPendingInvites(invitesData || [])

      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    const handleInvitePlayer = async () => {
      if (!inviteEmail.trim()) {
        setError('Email é obrigatório')
        return
      }

      setInviting(true)
      setError('')

      try {
        console.log('🎮 PlayerManagement - Enviando convite para:', inviteEmail)

        // Gerar token único
        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias

        const { error } = await supabase
          .from('invites')
          .insert({
            email: inviteEmail.trim(),
            token,
            expires_at: expiresAt.toISOString(),
            invited_by: user?.id,
            campaign_id: campaign.id
          })

        if (error) {
          console.error('🎮 PlayerManagement - Erro ao criar convite:', error)
          throw error
        }

        console.log('🎮 PlayerManagement - Convite criado com sucesso')
        setInviteEmail('')
        await fetchPlayersAndInvites() // Atualizar lista

      } catch (err) {
        console.error('🎮 PlayerManagement - Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro ao enviar convite')
      } finally {
        setInviting(false)
      }
    }

    const handleRemovePlayer = async (playerId: string) => {
      try {
        console.log('🎮 PlayerManagement - Removendo jogador:', playerId)

        const { error } = await supabase
          .from('campaign_players')
          .delete()
          .eq('id', playerId)
          .eq('campaign_id', campaign.id)

        if (error) {
          console.error('🎮 PlayerManagement - Erro ao remover jogador:', error)
          throw error
        }

        console.log('🎮 PlayerManagement - Jogador removido com sucesso')
        await fetchPlayersAndInvites() // Atualizar lista

      } catch (err) {
        console.error('🎮 PlayerManagement - Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro ao remover jogador')
      }
    }

    const handleCancelInvite = async (inviteId: string) => {
      try {
        console.log('🎮 PlayerManagement - Cancelando convite:', inviteId)
        setError('') // Limpar erros anteriores

        // Verificar se o convite existe antes de deletar
        const { data: existingInvite, error: checkError } = await supabase
          .from('invites')
          .select('id, email')
          .eq('id', inviteId)
          .single()

        if (checkError) {
          console.error('🎮 PlayerManagement - Erro ao verificar convite:', checkError)
          throw new Error('Convite não encontrado')
        }

        console.log('🎮 PlayerManagement - Convite encontrado:', existingInvite.email)

        // Deletar o convite
        const { error: deleteError } = await supabase
          .from('invites')
          .delete()
          .eq('id', inviteId)

        if (deleteError) {
          console.error('🎮 PlayerManagement - Erro ao deletar convite:', deleteError)
          throw deleteError
        }

        console.log('🎮 PlayerManagement - Convite deletado com sucesso do banco de dados')
        
        // Aguardar um pouco para garantir que o banco foi atualizado
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Atualizar lista
        await fetchPlayersAndInvites()
        
        console.log('🎮 PlayerManagement - Lista atualizada após cancelamento')

      } catch (err) {
        console.error('🎮 PlayerManagement - Erro no cancelamento:', err)
        setError(err instanceof Error ? err.message : 'Erro ao cancelar convite')
      }
    }

    if (loading) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Gerenciamento de Jogadores</h3>
            <p className="text-sm text-muted-foreground">Convide e gerencie jogadores da campanha</p>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Gerenciamento de Jogadores</h3>
          <p className="text-sm text-muted-foreground">Convide e gerencie jogadores da campanha</p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Convidar Novo Jogador */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-4">Convidar Novo Jogador</h4>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email do jogador"
              className="flex-1 p-2 border rounded-md"
              disabled={inviting}
            />
            <Button 
              onClick={handleInvitePlayer}
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-2"
            >
              {inviting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {inviting ? 'Enviando...' : 'Convidar'}
            </Button>
          </div>
        </div>

        {/* Jogadores Atuais */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-4">Jogadores Atuais ({players.length})</h4>
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum jogador na campanha ainda</p>
          ) : (
            <div className="space-y-2">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{player.users?.name || 'Nome não disponível'}</p>
                    <p className="text-sm text-muted-foreground">{player.users?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Entrou em: {new Date(player.joined_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Convites Pendentes */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-4">Convites Pendentes ({pendingInvites.length})</h4>
          {pendingInvites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum convite pendente</p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Enviado em: {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                  
                  {/* Link do Convite */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Link do Convite:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/invite/${invite.token}`}
                        readOnly
                        className="flex-1 p-2 text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/invite/${invite.token}`)
                          // Você pode adicionar um toast aqui
                          console.log('Link copiado para a área de transferência!')
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Envie este link para o jogador por email, WhatsApp ou outro meio de sua preferência.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Função para salvar o template
  const handleSaveTemplate = async (template: any) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ sheet_template: template })
        .eq('id', campaign.id)
        .eq('master_id', user?.id)

      if (error) throw error

      // Atualizar o estado local da campanha
      setCampaign(prev => prev ? { ...prev, sheet_template: template } : null)
      
      console.log('✅ Template salvo com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar template:', err)
      throw err
    }
  }

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
            <PlayerManagement />
          </TabsContent>
          <TabsContent value="sheet" className="mt-6">
            <SheetTemplateEditor 
              campaign={campaign}
              onSave={handleSaveTemplate}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Modal de Confirmação */}
      <DeleteCampaignModal />
    </div>
  )
}
