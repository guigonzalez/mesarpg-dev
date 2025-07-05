"use client"

import { useState, useEffect, useRef } from "react"
import { createClientComponentClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/database.types'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, HelpCircle, Dice6, ChevronUp, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { processDiceCommand, isDiceCommand, getDiceCommandHelp } from "@/lib/dice-parser"

type Campaign = Database['public']['Tables']['campaigns']['Row']
type User = Database['public']['Tables']['users']['Row']

interface ChatMessage {
  id: string
  campaign_id: string
  user_id: string
  message: string
  message_type: 'text' | 'roll' | 'system'
  metadata: any
  created_at: string
  user?: {
    id: string
    name: string
    token_image?: string
  }
}

interface ChatPanelProps {
  campaign: Campaign
  currentUser: User
  isMaster: boolean
}

export function ChatPanel({ campaign, currentUser, isMaster }: ChatPanelProps) {
  const supabase = createClientComponentClient()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastMessageId, setLastMessageId] = useState<string | null>(null)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [offset, setOffset] = useState(0)

  const MESSAGES_PER_PAGE = 20

  useEffect(() => {
    fetchMessages()
    const cleanupRealtime = setupRealtimeSubscription()
    const cleanupAutoRefresh = setupAutoRefresh()
    
    return () => {
      cleanupRealtime()
      cleanupAutoRefresh()
    }
  }, [campaign.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async (loadOlder = false) => {
    try {
      if (!loadOlder) {
        setLoading(true)
      } else {
        setLoadingOlder(true)
      }
      
      const currentOffset = loadOlder ? offset + MESSAGES_PER_PAGE : 0
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:users!chat_messages_user_id_fkey (
            id,
            name,
            token_image
          )
        `)
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + MESSAGES_PER_PAGE - 1)

      if (error) throw error

      const reversedData = (data || []).reverse()
      
      if (loadOlder) {
        setMessages(prev => [...reversedData, ...prev])
        setOffset(currentOffset)
      } else {
        setMessages(reversedData)
        setOffset(0)
      }
      
      // Verificar se há mais mensagens
      setHasMoreMessages((data || []).length === MESSAGES_PER_PAGE)
      
      // Definir última mensagem para auto-refresh
      if (reversedData.length > 0 && !loadOlder) {
        setLastMessageId(reversedData[reversedData.length - 1].id)
      }
      
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      setLoading(false)
      setLoadingOlder(false)
    }
  }

  const loadOlderMessages = () => {
    fetchMessages(true)
  }

  const setupAutoRefresh = () => {
    console.log('🔄 Configurando auto-refresh para chat...')
    
    // Verificar novas mensagens a cada 3 segundos
    const interval = setInterval(async () => {
      try {
        if (!lastMessageId) return
        
        // Buscar apenas mensagens mais recentes que a última conhecida
        const { data: newMessages, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            user:users!chat_messages_user_id_fkey (
              id,
              name,
              token_image
            )
          `)
          .eq('campaign_id', campaign.id)
          .gt('created_at', 
            messages.find(m => m.id === lastMessageId)?.created_at || new Date().toISOString()
          )
          .order('created_at', { ascending: true })
          .limit(10)

        if (error) {
          console.error('❌ Erro no auto-refresh:', error)
          return
        }

        if (newMessages && newMessages.length > 0) {
          console.log(`📨 ${newMessages.length} nova(s) mensagem(ns) encontrada(s) via auto-refresh`)
          
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id))
            
            if (uniqueNewMessages.length > 0) {
              console.log(`➕ Adicionando ${uniqueNewMessages.length} mensagem(ns) via auto-refresh`)
              
              // Tocar som para mensagens de outros usuários
              const othersMessages = uniqueNewMessages.filter(m => m.user_id !== currentUser.id)
              if (othersMessages.length > 0) {
                console.log('🔊 Tocando som de notificação (auto-refresh)')
                playNotificationSound()
              }
              
              return [...prev, ...uniqueNewMessages]
            }
            
            return prev
          })
          
          // Atualizar ID da última mensagem
          setLastMessageId(newMessages[newMessages.length - 1].id)
        }
      } catch (err) {
        console.error('❌ Erro no auto-refresh:', err)
      }
    }, 3000) // Verificar a cada 3 segundos

    return () => {
      console.log('🔌 Removendo auto-refresh')
      clearInterval(interval)
    }
  }

  const setupRealtimeSubscription = () => {
    console.log('🔄 Configurando subscription realtime para campanha:', campaign.id)
    
    const channel = supabase
      .channel(`chat_${campaign.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `campaign_id=eq.${campaign.id}`
        },
        async (payload) => {
          console.log('📨 Nova mensagem recebida via realtime:', payload)
          
          try {
            // Buscar dados completos da nova mensagem
            const { data, error } = await supabase
              .from('chat_messages')
              .select(`
                *,
                user:users!chat_messages_user_id_fkey (
                  id,
                  name,
                  token_image
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (error) {
              console.error('❌ Erro ao buscar dados da mensagem:', error)
              return
            }

            if (data) {
              console.log('✅ Dados da mensagem carregados:', data.message)
              
              setMessages(prev => {
                // Verificar se a mensagem já existe para evitar duplicatas
                const exists = prev.some(msg => msg.id === data.id)
                if (exists) {
                  console.log('⚠️  Mensagem já existe, ignorando duplicata')
                  return prev
                }
                
                console.log('➕ Adicionando nova mensagem ao chat')
                return [...prev, data]
              })
              
              // Tocar som de notificação se não for mensagem própria
              if (data.user_id !== currentUser.id) {
                console.log('🔊 Tocando som de notificação')
                playNotificationSound()
              }
              
              // Atualizar última mensagem
              setLastMessageId(data.id)
            }
          } catch (err) {
            console.error('❌ Erro ao processar mensagem realtime:', err)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da subscription:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime conectado com sucesso!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na conexão realtime')
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Timeout na conexão realtime')
        } else if (status === 'CLOSED') {
          console.log('🔌 Conexão realtime fechada')
        }
      })

    return () => {
      console.log('🔌 Removendo subscription realtime')
      supabase.removeChannel(channel)
    }
  }

  const playNotificationSound = () => {
    // Som simples de notificação
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    audio.volume = 0.3
    audio.play().catch(() => {}) // Ignorar erros de autoplay
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      
      // Verificar se é um comando de dados
      if (isDiceCommand(newMessage.trim())) {
        const diceResult = processDiceCommand(newMessage.trim())
        if (diceResult) {
          const messageData = {
            campaign_id: campaign.id,
            user_id: currentUser.id,
            message: diceResult.formattedResult,
            message_type: 'roll',
            metadata: {
              originalCommand: diceResult.originalCommand,
              rolls: diceResult.rolls,
              modifier: diceResult.modifier,
              total: diceResult.total
            }
          }

          const { error } = await supabase
            .from('chat_messages')
            .insert(messageData)

          if (error) throw error
        } else {
          // Comando inválido, mostrar ajuda
          alert(getDiceCommandHelp())
          return
        }
      } else {
        // Mensagem normal
        const messageData = {
          campaign_id: campaign.id,
          user_id: currentUser.id,
          message: newMessage.trim(),
          message_type: 'text',
          metadata: {}
        }

        const { error } = await supabase
          .from('chat_messages')
          .insert(messageData)

        if (error) throw error
      }

      setNewMessage("")
      inputRef.current?.focus()
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'roll':
        return <Dice6 className="h-3 w-3" />
      case 'system':
        return <MessageSquare className="h-3 w-3" />
      default:
        return null
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'roll':
        return 'text-blue-600 dark:text-blue-400'
      case 'system':
        return 'text-orange-600 dark:text-orange-400'
      default:
        return 'text-foreground'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">Chat da Sessão</h3>
          <Badge variant="secondary" className="text-xs">
            {messages.length}
          </Badge>
        </div>
      </div>

      {/* Botão Carregar Mensagens Antigas */}
      {hasMoreMessages && (
        <div className="p-2 border-b">
          <Button
            size="sm"
            variant="outline"
            onClick={loadOlderMessages}
            disabled={loadingOlder}
            className="w-full"
          >
            {loadingOlder ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-2" />
            ) : (
              <ChevronUp className="h-3 w-3 mr-2" />
            )}
            Carregar mensagens anteriores
          </Button>
        </div>
      )}

      {/* Área de Mensagens */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-xs">Seja o primeiro a falar!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-2">
                <Avatar className="h-6 w-6 mt-1 shrink-0">
                  <AvatarImage src={message.user?.token_image} />
                  <AvatarFallback className="text-xs">
                    {message.user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-xs">
                      {message.user?.name}
                    </span>
                    {getMessageTypeIcon(message.message_type)}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  
                  <div className={cn("text-sm", getMessageTypeColor(message.message_type))}>
                    {message.message_type === 'roll' ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span>{message.metadata?.originalCommand || message.message}</span>
                        </div>
                        <div className="text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded border">
                          <div className="font-mono">{message.message}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            Total: {message.metadata?.total || message.metadata?.result}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      message.message
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Área de Input - Fixo na parte inferior */}
      <div className="p-3 shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem ou /r 1d20+5..."
            disabled={sending}
            className="flex-1"
          />
          
          <Button
            size="sm"
            onClick={() => alert(getDiceCommandHelp())}
            disabled={sending}
            variant="outline"
            className="px-2 shrink-0"
            title="Ajuda com comandos de dados"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
