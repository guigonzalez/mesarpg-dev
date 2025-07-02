"use client"

import type React from "react"
import Image from "next/image" // Importar Image
import { useState } from "react"
import type { SheetField, SheetViewerProps, User } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckSquare, Square, Pencil } from "lucide-react"
import { Button } from "../ui/button"
import { SheetEditModal } from "./sheet-edit-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Importar Avatar

interface ReadOnlyFieldProps {
  field: SheetField
}

// Componente de campo de ficha reestilizado
function ReadOnlyField({ field }: ReadOnlyFieldProps) {
  const renderValue = () => {
    switch (field.type) {
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            {field.value ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{field.value ? "Sim" : "Não"}</span>
          </div>
        )
      case "image":
        return field.value ? (
          <div className="w-16 h-10 relative rounded-md overflow-hidden">
            <Image
              src={(field.value as string) || "/placeholder.svg"}
              alt={field.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Nenhuma imagem</span>
        )
      default:
        return (
          <p className="font-medium text-right truncate" title={String(field.value)}>
            {String(field.value) || "-"}
          </p>
        )
    }
  }

  return (
    <div className="flex justify-between items-center text-sm py-1.5">
      <p className="text-muted-foreground">{field.name}</p>
      {renderValue()}
    </div>
  )
}

function ReadOnlySheet({ sheetData }: { sheetData: SheetField[] }) {
  return (
    <div className="space-y-1 p-4 bg-muted rounded-lg">
      {sheetData.map((field, index) => (
        <ReadOnlyField key={index} field={field} />
      ))}
    </div>
  )
}

export function SheetViewer({ campaign }: SheetViewerProps) {
  const { users } = useMesaStore()
  const [editingPlayer, setEditingPlayer] = useState<User | null>(null)

  const players = users.filter((u) => campaign.playerIds.includes(u.id))

  const handleEditClick = (e: React.MouseEvent, player: User) => {
    e.stopPropagation() // Impede que o acordeão abra/feche
    setEditingPlayer(player)
  }

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        {players.map((player) => (
          <AccordionItem key={player.id} value={player.id}>
            <AccordionTrigger className="font-medium text-lg hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={player.tokenImage || "/placeholder.svg"} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {player.name}
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => handleEditClick(e, player)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {player.sheetData && player.sheetData.length > 0 ? (
                <ReadOnlySheet sheetData={player.sheetData} />
              ) : (
                <p className="text-muted-foreground text-sm p-4">Este jogador ainda não preencheu a ficha.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <SheetEditModal isOpen={!!editingPlayer} onClose={() => setEditingPlayer(null)} player={editingPlayer} />
    </>
  )
}
