"use client"

import { useState } from "react"
import { useMesaStore } from "@/lib/store"
import type { Handout } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { FileText, ImageIcon, Type } from "lucide-react"

const typeIcons = {
  text: <Type className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  pdf: <FileText className="h-5 w-5" />,
}

export function PlayerHandoutPanel() {
  const campaign = useMesaStore((state) => state.activeCampaign)
  const [selectedHandout, setSelectedHandout] = useState<Handout | null>(null)

  const sharedHandouts = campaign?.handouts?.filter((h) => h.sharedWithPlayers) || []

  if (sharedHandouts.length === 0) {
    return <p className="text-sm text-muted-foreground p-4 text-center">Nenhum utilitário compartilhado pelo mestre.</p>
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-2 space-y-2">
          {sharedHandouts.map((handout) => (
            <Button
              key={handout.id}
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => setSelectedHandout(handout)}
            >
              <div className="text-primary">{typeIcons[handout.type]}</div>
              <span className="font-medium truncate">{handout.title}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={!!selectedHandout} onOpenChange={() => setSelectedHandout(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedHandout?.title}</DialogTitle>
            <DialogDescription>Utilitário compartilhado pelo mestre.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {selectedHandout?.type === "text" && <p className="whitespace-pre-wrap">{selectedHandout.content}</p>}
            {selectedHandout?.type === "image" && (
              <div className="relative aspect-video">
                <Image
                  src={selectedHandout.content || "/placeholder.svg"}
                  alt={selectedHandout.title}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            )}
            {selectedHandout?.type === "pdf" && (
              <a
                href={selectedHandout.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Abrir PDF em nova aba
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
