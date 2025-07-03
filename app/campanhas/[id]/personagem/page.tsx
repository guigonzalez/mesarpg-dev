"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClientComponentClient } from '@/lib/supabase-browser'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/lib/database.types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Edit } from "lucide-react"
import Link from "next/link"

type Campaign = Database['public']['Tables']['campaigns']['Row']
type CharacterSheet = Database['public']['Tables']['character_sheets']['Row']

export default function CharacterListPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [campaignId, setCampaignId] = useState<string>("")
  const supabase = createClientComponentClient()

  // Resolver params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setCampaignId(resolvedParams.id as string)
    }
    resolveParams()
  }, [params])

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [characters, setCharacters] = useState<CharacterSheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    fetchData()
  }, [user, router, campaignId, authLoading])

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

      setCampaign(campaignData)

      // Buscar personagens
      let charactersQuery = supabase
        .from('character_sheets')
        .select('*')
        .eq('campaign_id', campaignId)

      // Se não é mestre, mostrar apenas seus próprios personagens
      if (!isMaster) {
        charactersQuery = charactersQuery.eq('player_id', user?.id)
      }

      const { data: charactersData, error: charactersError } = await charactersQuery

      if (charactersError) {
        throw charactersError
      }

      setCharacters(charactersData || [])

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando personagens...</p>
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
    <div className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/campanhas/${campaignId}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Personagens</h1>
              <p className="text-muted-foreground">{campaign.name}</p>
            </div>
          </div>
          
          <Link href={`/campanhas/${campaignId}/personagem/novo`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isMaster ? 'Criar Personagem' : 'Criar Meu Personagem'}
            </Button>
          </Link>
        </div>

        {/* Lista de Personagens */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Nenhum personagem criado</h3>
                  <p className="text-muted-foreground mb-4">
                    {isMaster 
                      ? 'Crie personagens para NPCs ou gerencie fichas dos jogadores'
                      : 'Crie a ficha do seu personagem para esta campanha'
                    }
                  </p>
                  <Link href={`/campanhas/${campaignId}/personagem/novo`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Personagem
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            characters.map((character) => (
              <Card key={character.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{character.character_name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      character.status === 'approved' ? 'bg-green-100 text-green-800' :
                      character.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      character.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {character.status === 'approved' ? 'Aprovado' :
                       character.status === 'submitted' ? 'Enviado' :
                       character.status === 'rejected' ? 'Rejeitado' :
                       'Rascunho'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Criado em {new Date(character.created_at || '').toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Template v{character.template_version}
                    </div>
                    <Link href={`/campanhas/${campaignId}/personagem/${character.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
