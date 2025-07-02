"use client"

import { useState, useEffect } from "react"
import type { Handout } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "../ui/image-upload"

interface HandoutEditModalProps {
  isOpen: boolean
  onClose: () => void
  handoutToEdit: Handout | null
}

export function HandoutEditModal({ isOpen, onClose, handoutToEdit }: HandoutEditModalProps) {
  const { addHandout, updateHandout } = useMesaStore()
  const [title, setTitle] = useState("")
  const [type, setType] = useState<Handout["type"]>("text")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (isOpen && handoutToEdit) {
      setTitle(handoutToEdit.title)
      setType(handoutToEdit.type)
      setContent(handoutToEdit.content)
    } else {
      setTitle("")
      setType("text")
      setContent("")
    }
  }, [isOpen, handoutToEdit])

  const handleSave = () => {
    if (!title) return
    const handoutData = { title, type, content, sharedWithPlayers: handoutToEdit?.sharedWithPlayers || false }
    if (handoutToEdit) {
      updateHandout({ ...handoutData, id: handoutToEdit.id })
    } else {
      addHandout(handoutData)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{handoutToEdit ? "Editar Utilitário" : "Adicionar Utilitário"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="Título do Utilitário" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select onValueChange={(v: any) => setType(v)} value={type}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="image">Imagem</SelectItem>
              <SelectItem value="pdf">PDF (URL)</SelectItem>
            </SelectContent>
          </Select>
          {type === "text" && (
            <Textarea
              placeholder="Escreva seu texto aqui..."
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
          {type === "image" && (
            <div className="h-48">
              <ImageUpload value={content} onChange={setContent} />
            </div>
          )}
          {type === "pdf" && (
            <Input placeholder="URL do arquivo PDF" value={content} onChange={(e) => setContent(e.target.value)} />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
