"use client"
import type { PlayerManagementProps } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, UserPlus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"

export function PlayerManagement({ campaign }: PlayerManagementProps) {
  const { users, approvePlayer, removePlayer } = useMesaStore()

  const pendingPlayers = users.filter((u) => campaign.pendingPlayerIds?.includes(u.id))
  const approvedPlayers = users.filter((u) => campaign.playerIds.includes(u.id))

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
          <UserPlus className="text-primary" />
          Jogadores Pendentes ({pendingPlayers.length})
        </h3>
        <div className="space-y-2">
          {pendingPlayers.length > 0 ? (
            pendingPlayers.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/placeholder.svg?width=40&height=40&query=${player.name}`} />
                    <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{player.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => approvePlayer(player.id)}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rejeitar Jogador?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação removerá a solicitação de {player.name} para entrar na campanha.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removePlayer(player.id)}>Rejeitar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm px-2">Nenhum jogador aguardando aprovação.</p>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-2 text-muted-foreground">Jogadores Aprovados ({approvedPlayers.length})</h3>
        <div className="space-y-2">
          {approvedPlayers.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg?width=40&height=40&query=${player.name}`} />
                  <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{player.name}</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    Remover
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover {player.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação removerá permanentemente o jogador da campanha. Ele precisará solicitar entrada
                      novamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removePlayer(player.id)}>Remover</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
