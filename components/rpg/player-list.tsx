"use client"

import { useMesaStore } from "@/lib/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Shield, UserPlus } from "lucide-react"

export function PlayerList() {
  const campaign = useMesaStore((state) => state.activeCampaign)
  const users = useMesaStore((state) => state.users)

  if (!campaign) return null

  const master = users.find((u) => u.id === campaign.masterId)
  const players = users.filter((u) => campaign.playerIds.includes(u.id))

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-400" /> Mestre
        </h3>
        {master && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={`/placeholder.svg?width=40&height=40&query=dungeon+master`} />
                <AvatarFallback>{master.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span>{master.name}</span>
            </div>
            <Badge variant="destructive">Mestre</Badge>
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-sky-400" /> Jogadores
        </h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`/placeholder.svg?width=40&height=40&query=${player.name}`} />
                  <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span>{player.name}</span>
              </div>
              <Badge variant="secondary">Jogador</Badge>
            </div>
          ))}
        </div>
      </div>
      <Button className="w-full mt-4" onClick={() => alert("Fluxo de convite simulado!")}>
        <UserPlus className="h-4 w-4 mr-2" />
        Convidar Jogador
      </Button>
    </div>
  )
}
