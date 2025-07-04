"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/database.types'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, Edit, UserPlus, Users, User } from "lucide-react"

type Campaign = Database['public']['Tables']['campaigns']['Row']
type CharacterSheet = Database['public']['Tables']['character_sheets']['Row']
type User = Database['public']['Tables']['users']['Row']

interface CharacterWithPlayer extends CharacterSheet {
  player?: User
}

interface CharacterListPanelProps {
  campaign: Campaign
  currentUser: User
  isMaster: boolean
}

export function CharacterListPanel({ campaign, currentUser, isMaster }: CharacterListPanelProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [myCharacters, setMyCharacters] = useState<CharacterSheet[]>([])
  const [allCharacters, setAllCharacters] = useState<CharacterWithPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharacters()
  }, [campaign.id, currentUser.id])

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar meus personagens
      const { data: myChars, error: myCharsError } = await supabase
        .from('character_sheets')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('player_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (myCharsError) throw myCharsError
      setMyCharacters(myChars || [])

      // Buscar todos os personagens da campanha (para visualização)
      const { data: allChars, error: allCharsError } = await supabase
        .from('character_sheets')
        .select(`
          *,
          player:users!character_sheets_player_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false })

      if (allCharsError) throw allCharsError
      setAllCharacters(allChars || [])

    } catch (err) {
      console.error('Erro ao carregar personagens:', err)
      setError('Erro ao carregar personagens')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCharacter = () => {
    router.push(`/campanhas/${campaign.id}/personagem/novo`)
  }

  const handleEditCharacter = (characterId: string) => {
    router.push(`/campanhas/${campaign.id}/personagem/${characterId}`)
  }

  const handleViewCharacter = (characterId: string) => {
    // Para visualização, também vai para a página de edição mas em modo de visualização
    router.push(`/campanhas/${campaign.id}/personagem/${characterId}`)
  }

  const CharacterCard = ({ 
    character, 
    isOwner = false, 
    showPlayer = false 
  }: { 
    character: CharacterWithPlayer
    isOwner?: boolean
    showPlayer?: boolean 
  }) => (
    <Card className="mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={character.character_name} />
            <AvatarFallback>
              {character.character_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{character.character_name}</CardTitle>
            {showPlayer && character.player && (
              <CardDescription className="text-sm">
                Jogador: {character.player.name}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Criado em {new Date(character.created_at || '').toLocaleDateString('pt-BR')}
          </div>
          <div className="flex gap-2">
            {isOwner ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditCharacter(character.id)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleViewCharacter(character.id)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Carregando personagens...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-500 mb-2">{error}</p>
        <Button size="sm" onClick={fetchCharacters}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="my-characters" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="my-characters" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            Meus ({myCharacters.length})
          </TabsTrigger>
          <TabsTrigger value="all-characters" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Todos ({allCharacters.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-characters" className="flex-1 mt-2">
          <ScrollArea className="h-full px-4">
            {myCharacters.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-2">Nenhum personagem criado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie a ficha do seu personagem para esta campanha
                </p>
                <Button onClick={handleCreateCharacter} size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Personagem
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Meus Personagens</h4>
                  <Button onClick={handleCreateCharacter} size="sm" variant="outline">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Novo
                  </Button>
                </div>
                {myCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="all-characters" className="flex-1 mt-2">
          <ScrollArea className="h-full px-4">
            {allCharacters.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-2">Nenhum personagem na campanha</h3>
                <p className="text-sm text-muted-foreground">
                  Aguarde outros jogadores criarem seus personagens
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Todos os Personagens</h4>
                {allCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isOwner={character.player_id === currentUser.id}
                    showPlayer={true}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
