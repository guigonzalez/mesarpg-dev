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
import { Send, Dice6, Eye, EyeOff, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

type Campaign = Database['public']['Tables']['campaigns']['Row']
type User = Database['public']['Tables']['users']['Row']

interface ChatMessage {
  id: string
  campaign_id: string
  user_id: string
  message: string
  message_type: 'text' | 'roll' | 'system' | 'whisper'
  target_user_id?: string
  metadata: any
  created_at: string
  user?: {
    id: string
    name: string
    token_image?: string
  }
  target_user?: {
    id: string
    name: string
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
  const [isWhisperMode, setIsWhisperMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    fetchMessages()
    setupRealtimeSubscription()
  }, [campaign.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:users!chat_messages_user_id_fkey (
            id,
            name,
            token_image
          ),
          target_user:users!chat_messages_target_user_id_fkey (
            id,
            name
          )
        `)
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: true })
        .limit(100) // Últimas 100 mensagens

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
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
          // Buscar dados completos da nova mensagem
          const { data, error } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:users!chat_messages_user_id_fkey (
                id,
                name,
                token_image
              ),
              target_user:users!chat_messages_target_user_id_fkey (
                id,
                name
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            setMessages(prev => [...prev, data])
            
            // Tocar som de notificação se não for mensagem própria
            if (data.user_id !== currentUser.id && soundEnabled) {
              playNotificationSound()
            }
          }
        }
      )
      .subscribe()

    return () => {
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
      
      const messageData = {
        campaign_id: campaign.id,
        user_id: currentUser.id,
        message: newMessage.trim(),
        message_type: isWhisperMode ? 'whisper' : 'text',
        metadata: {}
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData)

      if (error) throw error

      setNewMessage("")
      inputRef.current?.focus()
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  const rollDice = async (sides: number = 20) => {
    const result = Math.floor(Math.random() * sides) + 1
    
    try {
      setSending(true)
      
      const messageData = {
        campaign_id: campaign.id,
        user_id: currentUser.id,
        message: `Rolou 1d${sides}`,
        message_type: 'roll',
        metadata: {
          dice: `1d${sides}`,
          result: result,
          sides: sides
        }
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData)

      if (error) throw error
      
    } catch (error) {
      console.error('Erro ao rolar dado:', error)
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
      case 'whisper':
        return <Eye className="h-3 w-3" />
      case 'system':
        return <Volume2 className="h-3 w-3" />
      default:
        return null
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'roll':
        return 'text-blue-600 dark:text-blue-400'
      case 'whisper':
        return 'text-purple-600 dark:text-purple-400'
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
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">Chat da Sessão</h3>
          <Badge variant="secondary" className="text-xs">
            {messages.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={soundEnabled ? "default" : "outline"}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-7 w-7 p-0"
          >
            {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          </Button>
          {isMaster && (
            <Button
              size="sm"
              variant={isWhisperMode ? "default" : "outline"}
              onClick={() => setIsWhisperMode(!isWhisperMode)}
              className="h-7 w-7 p-0"
            >
              {isWhisperMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* Área de Mensagens */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <Volume2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-xs">Seja o primeiro a falar!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-2">
                <Avatar className="h-6 w-6 mt-1">
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
                      <div className="flex items-center gap-2">
                        <span>{message.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.metadata?.result}
                        </Badge>
                      </div>
                    ) : message.message_type === 'whisper' ? (
                      <div className="italic">
                        <span className="text-xs opacity-75">sussurra: </span>
                        {message.message}
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

      {/* Área de Input */}
      <div className="p-3 space-y-2">
        {isWhisperMode && (
          <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Modo sussurro ativo
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isWhisperMode ? "Sussurrar mensagem..." : "Digite sua mensagem..."}
            disabled={sending}
            className="flex-1"
          />
          
          <Button
            size="sm"
            onClick={() => rollDice(20)}
            disabled={sending}
            variant="outline"
            className="px-2"
          >
            <Dice6 className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
