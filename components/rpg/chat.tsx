"use client"

import { useState, useRef, useEffect } from "react"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Dices } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { ChatMessage } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

function DiceRollMessage({ msg }: { msg: ChatMessage }) {
  return (
    <div className="w-full text-center my-2">
      <div className="inline-flex items-center gap-4 p-3 rounded-lg bg-muted border border-primary/20">
        <Dices className="h-6 w-6 text-primary" />
        <p className="text-sm">
          <span className="font-bold text-primary">{msg.author}</span>
          <span className="text-muted-foreground"> {msg.content}</span>
        </p>
      </div>
    </div>
  )
}

export function Chat() {
  const campaign = useMesaStore((state) => state.activeCampaign)
  const user = useMesaStore((state) => state.currentUser)
  const users = useMesaStore((state) => state.users)
  const addChatMessage = useMesaStore((state) => state.addChatMessage)
  const rollDiceAndChat = useMesaStore((state) => state.rollDiceAndChat)
  const [message, setMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("div")
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }, [campaign?.chat])

  const handleSend = () => {
    if (message.trim() === "" || !user || !campaign) return
    if (message.startsWith("/r ")) {
      rollDiceAndChat(message.substring(3), user.name)
    } else {
      const userRoleInCampaign = campaign.masterId === user.id ? "master" : "player"
      addChatMessage({ author: user.name, content: message, type: userRoleInCampaign })
    }
    setMessage("")
  }

  const getAuthorAvatar = (authorName: string) => {
    const authorUser = users.find((u) => u.name === authorName)
    if (authorUser) return authorUser.tokenImage || `/placeholder.svg?query=${authorName}`
    const authorNpc = campaign?.npcs?.find((n) => n.name === authorName)
    if (authorNpc) return authorNpc.tokenImage || authorNpc.avatarUrl
    return "/placeholder.svg"
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-4 p-4">
          {campaign?.chat?.map((msg) => {
            if (msg.type === "dice") return <DiceRollMessage key={msg.id} msg={msg} />
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="text-center w-full text-muted-foreground italic text-xs py-2">
                  {msg.content}
                </div>
              )
            }

            const isAuthor = msg.author === user?.name
            const avatarSrc = getAuthorAvatar(msg.author)

            return (
              <div
                key={msg.id}
                className={cn("flex items-start gap-3 max-w-[90%]", isAuthor ? "flex-row-reverse ml-auto" : "mr-auto")}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarSrc || "/placeholder.svg"} />
                  <AvatarFallback>{msg.author.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "p-3 rounded-lg w-fit",
                    isAuthor ? "bg-primary/20 rounded-br-none" : "bg-muted rounded-bl-none",
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn("font-bold text-sm", {
                        "text-primary": msg.type === "master",
                        "text-foreground": msg.type === "player",
                      })}
                    >
                      {msg.author}
                    </span>
                    <span className="text-xs text-muted-foreground">{format(new Date(msg.timestamp), "HH:mm")}</span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      <div className="mt-auto p-4 border-t flex items-center gap-2 bg-background shrink-0">
        <Input
          placeholder="Digite sua mensagem ou /r 1d20..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="bg-muted"
        />
        <Button onClick={handleSend} size="icon" aria-label="Enviar Mensagem">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
