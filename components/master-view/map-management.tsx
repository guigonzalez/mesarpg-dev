"use client"

import type React from "react"

import { useState } from "react"
import type { Campaign, MapData } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import { PlusCircle, Pencil, Trash2, CheckCircle } from "lucide-react"
import { MapEditModal } from "./map-edit-modal"
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

export function MapManagement({ campaign }: { campaign: Campaign }) {
  const { deleteMap, setActiveMap } = useMesaStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMap, setEditingMap] = useState<MapData | null>(null)

  const handleOpenModal = (e: React.MouseEvent, map: MapData | null) => {
    e.stopPropagation()
    setEditingMap(map)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {campaign.maps?.map((map) => {
          const isActive = campaign.activeMapId === map.id
          return (
            <Card
              key={map.id}
              className={cn(
                "overflow-hidden group relative cursor-pointer transition-all",
                isActive ? "border-primary shadow-md shadow-primary/20" : "hover:border-primary/50",
              )}
              onClick={() => setActiveMap(map.id)}
            >
              <div className="aspect-video relative">
                <Image src={map.backgroundUrl || "/placeholder.svg"} alt={map.name} layout="fill" objectFit="cover" />
                {isActive && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center gap-2",
                    isActive && "bg-black/60",
                  )}
                >
                  <Button
                    variant="secondary"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleOpenModal(e, map)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={handleDeleteClick}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir o mapa "{map.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O mapa será removido permanentemente da campanha.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMap(map.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardFooter className="p-3 flex justify-between items-center">
                <p className="font-medium text-sm truncate">{map.name}</p>
                <p className="text-xs text-muted-foreground">
                  {map.gridSize}x{map.gridSize}
                </p>
              </CardFooter>
            </Card>
          )
        })}
        <Button
          variant="outline"
          className="border-dashed flex flex-col items-center justify-center h-full bg-transparent min-h-[150px]"
          onClick={(e) => handleOpenModal(e, null)}
        >
          <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-muted-foreground">Adicionar Mapa</span>
        </Button>
      </div>
      <MapEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mapToEdit={editingMap} />
    </div>
  )
}
