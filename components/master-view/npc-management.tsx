"use client"

import { useState } from "react"
import type { Campaign, Npc } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlusCircle, Trash2, Pencil } from "lucide-react"
import { NpcEditModal } from "./npc-edit-modal"
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

export function NpcManagement({ campaign }: { campaign: Campaign }) {
  const { deleteNpc } = useMesaStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null)

  const handleOpenModal = (npc: Npc | null) => {
    setEditingNpc(npc)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        Bestiário da Campanha
        <Button onClick={() => handleOpenModal(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar NPC
        </Button>
      </div>
      <div>
        <Accordion type="single" collapsible className="w-full">
          {campaign.npcs?.map((npc) => (
            <AccordionItem key={npc.id} value={npc.id}>
              <AccordionTrigger className="font-medium text-lg hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={npc.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback>{npc.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {npc.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(npc)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir o NPC "{npc.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O NPC será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteNpc(npc.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-muted rounded-lg space-y-2">
                {npc.sheet.map((field, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{field.name}:</span>
                    <span className="font-semibold">{String(field.value)}</span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <NpcEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} npcToEdit={editingNpc} />
    </div>
  )
}
