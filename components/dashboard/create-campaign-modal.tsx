"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMesaStore } from "@/lib/store"
import type { Campaign } from "@/lib/types"

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const addCampaign = useMesaStore((state) => state.addCampaign)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [system, setSystem] = useState<Campaign["system"] | "">("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!name || !system) {
      setError("O nome da campanha e o sistema são obrigatórios.")
      return
    }

    addCampaign({ name, description, system })

    // Resetar e fechar
    setError("")
    setName("")
    setDescription("")
    setSystem("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Campanha</DialogTitle>
          <DialogDescription>Preencha os detalhes abaixo para dar vida à sua nova aventura.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="A Lenda da Espada Perdida"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Uma breve sinopse da sua campanha."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="system" className="text-right">
              Sistema
            </Label>
            <Select onValueChange={(v: Campaign["system"]) => setSystem(v)} value={system}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um sistema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="D&D 5e">D&D 5e</SelectItem>
                <SelectItem value="Vampiro: A Máscara">Vampiro: A Máscara</SelectItem>
                <SelectItem value="Livre">Sistema Livre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="col-span-4 text-center text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Criar Campanha</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
