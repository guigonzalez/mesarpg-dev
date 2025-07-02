"use client"

import { useState } from "react"
import type { Campaign, Handout } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PlusCircle, FileText, ImageIcon, Type, Pencil, Trash2 } from "lucide-react"
import { HandoutEditModal } from "./handout-edit-modal"
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
import { cn } from "@/lib/utils"

const typeIcons = {
  text: <Type className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  pdf: <FileText className="h-5 w-5" />,
}

export function HandoutManagement({ campaign }: { campaign: Campaign }) {
  const { deleteHandout, updateHandout } = useMesaStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHandout, setEditingHandout] = useState<Handout | null>(null)

  const handleOpenModal = (handout: Handout | null) => {
    setEditingHandout(handout)
    setIsModalOpen(true)
  }

  const handleShareToggle = (handout: Handout, shared: boolean) => {
    updateHandout({ ...handout, sharedWithPlayers: shared })
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Utilitários da Campanha</h2>
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {campaign.handouts?.map((handout) => (
            <div
              key={handout.id}
              className={cn(
                "p-3 rounded-lg", // Container principal agora é um bloco
                handout.sharedWithPlayers ? "bg-primary/10" : "bg-muted",
              )}
            >
              {/* Linha de Cima: Ícone e Título */}
              <div className="flex items-center gap-3">
                <div className="text-primary flex-shrink-0">{typeIcons[handout.type]}</div>
                <span className="font-medium truncate" title={handout.title}>
                  {handout.title}
                </span>
              </div>

              {/* Linha de Baixo: Controles alinhados à direita */}
              <div className="flex justify-end items-center gap-2 mt-2">
                <Label htmlFor={`share-${handout.id}`} className="text-sm text-muted-foreground cursor-pointer">
                  Compartilhar
                </Label>
                <Switch
                  id={`share-${handout.id}`}
                  checked={handout.sharedWithPlayers}
                  onCheckedChange={(checked) => handleShareToggle(handout, checked)}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(handout)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir "{handout.title}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O utilitário será removido permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteHandout(handout.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HandoutEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handoutToEdit={editingHandout} />
    </>
  )
}
