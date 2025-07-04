"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClientComponentClient } from '@/lib/supabase-browser'
import { useAuth } from '@/hooks/useAuth'
import { Database, SheetTemplate, CharacterSheet } from '@/lib/database.types'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CharacterCreationForm } from "@/components/rpg/character-creation-form"

type Campaign = Database['public']['Tables']['campaigns']['Row']

export default function EditCharacterPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [campaignId, setCampaignId] = useState<string>("")
  const [characterId, setCharacterId] = useState<string>("")
  const supabase = createClientComponentClient()

  // Resolver params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCampaignId(resolvedParams.id as string)
      setCharacterId(resolvedParams.characterId as string)
    }
    resolveParams()
  }, [params])

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [character, setCharacter] = useState<CharacterSheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.replace("/login")
      return
    }
    
    if (!campaignId || !characterId) {
      router.replace("/dashboard")
      return
    }

    fetchData()
  }, [user, router, campaignId, characterId, authLoading])

  const fetchData = async () => {
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
      const isMaster = campaignData.master_id === user?.id
      let hasAccess = isMaster
      
      if (!isMaster) {
        const { data: playerData, error: playerError } = await supabase
          .from('campaign_players')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('user_id', user?.id)
          .eq('status', 'active')
          .single()

        if (playerData) {
          hasAccess = true
        }
      }

      if (!hasAccess) {
        setError('Você não tem acesso a esta campanha')
        return
      }

      // Verificar se a campanha tem template configurado
      const template = campaignData.sheet_template as unknown as SheetTemplate | null
      if (!template || !template.fields?.length) {
        setError('Template de ficha não configurado. Configure o template nas configurações da campanha primeiro.')
        return
      }

      setCampaign(campaignData)

      // Buscar dados do personagem
      const { data: characterData, error: characterError } = await supabase
        .from('character_sheets')
        .select('*')
        .eq('id', characterId)
        .eq('campaign_id', campaignId)
        .single()

      if (characterError) {
        if (characterError.code === 'PGRST116') {
          setError('Personagem não encontrado')
          return
        }
        throw characterError
      }

      // Verificar se o usuário pode editar este personagem
      const canEdit = isMaster || characterData.player_id === user?.id
      if (!canEdit) {
        setError('Você não tem permissão para editar este personagem')
        return
      }

      setCharacter(characterData)

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCharacter = async (characterData: {
    character_name: string
    sheet_data: any
  }) => {
    try {
      const template = campaign?.sheet_template as unknown as SheetTemplate
      
      const { error } = await supabase
        .from('character_sheets')
        .update({
          character_name: characterData.character_name,
          sheet_data: characterData.sheet_data,
          template_version: template.version || 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', characterId)

      if (error) {
        throw error
      }

      // Atualizar dados locais
      setCharacter(prev => prev ? {
        ...prev,
        character_name: characterData.character_name,
        sheet_data: characterData.sheet_data
      } : null)
      
    } catch (err) {
      console.error('Erro ao salvar personagem:', err)
      throw new Error('Erro ao salvar personagem')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando personagem...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/campanhas/${campaignId}`)} variant="outline">
              Voltar à Campanha
            </Button>
            {error.includes('Template') && (
              <Button onClick={() => router.push(`/campanhas/${campaignId}/settings`)}>
                Configurar Template
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!campaign || !character) {
    return null
  }

  const isMaster = user?.id === campaign.master_id
  const template = campaign.sheet_template as unknown as SheetTemplate

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/campanhas/${campaignId}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                Editar: {character.character_name}
              </h1>
              <p className="text-muted-foreground">
                {campaign.name} • {template.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto p-4">
        <CharacterCreationForm
          campaign={campaign}
          template={template}
          onSave={handleSaveCharacter}
          isNewCharacter={false}
          existingData={{
            character_name: character.character_name,
            sheet_data: character.sheet_data
          }}
        />
      </div>
    </div>
  )
}
