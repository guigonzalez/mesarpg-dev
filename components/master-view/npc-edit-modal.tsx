"use client"

import { useState, useEffect } from "react"
import type { Npc, SheetField } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "../ui/image-upload"
import { PlusCircle, Trash2 } from "lucide-react"

interface NpcEditModalProps {
  isOpen: boolean
  onClose: () => void
  npcToEdit: Npc | null
}

export function NpcEditModal({ isOpen, onClose, npcToEdit }: NpcEditModalProps) {
  const { addNpc, updateNpc } = useMesaStore()
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [tokenImage, setTokenImage] = useState("")
  const [sheet, setSheet] = useState<SheetField[]>([])

  useEffect(() => {
    if (isOpen && npcToEdit) {
      setName(npcToEdit.name)
      setAvatarUrl(npcToEdit.avatarUrl)
      setTokenImage(npcToEdit.tokenImage || "")
      setSheet(npcToEdit.sheet)
    } else {
      setName("")
      setAvatarUrl("")
      setTokenImage("")
      setSheet([{ id: `field-${Date.now()}`, name: "HP", type: "number", value: 10 }])
    }
  }, [isOpen, npcToEdit])

  const handleSheetChange = (index: number, prop: keyof SheetField, value: any) => {
    const newSheet = [...sheet]
    newSheet[index] = { ...newSheet[index], [prop]: value }
    setSheet(newSheet)
  }

  const addField = () => setSheet([...sheet, { id: `field-${Date.now()}`, name: "", type: "text", value: "" }])
  const removeField = (index: number) => setSheet(sheet.filter((_, i) => i !== index))

  const handleSave = () => {
    const npcData = { name, avatarUrl, tokenImage, sheet }
    if (npcToEdit) {
      updateNpc({ ...npcData, id: npcToEdit.id })
    } else {
      addNpc(npcData)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{npcToEdit ? "Editar NPC" : "Adicionar Novo NPC"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="npc-name" className="text-right">
              Nome
            </Label>
            <Input id="npc-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Avatar</Label>
            <div className="col-span-3">
              <ImageUpload value={avatarUrl} onChange={setAvatarUrl} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Token</Label>
            <div className="col-span-3">
              <ImageUpload value={tokenImage} onChange={setTokenImage} />
            </div>
          </div>
          <h4 className="font-semibold text-center mt-4">Ficha Simplificada</h4>
          {sheet.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                placeholder="Atributo"
                value={field.name}
                onChange={(e) => handleSheetChange(index, "name", e.target.value)}
                className="w-1/3"
              />
              <Select value={field.type} onValueChange={(v: any) => handleSheetChange(index, "type", v)}>
                <SelectTrigger className="w-1/4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="boolean">Booleano</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Valor"
                value={field.value as any}
                onChange={(e) => handleSheetChange(index, "value", e.target.value)}
                className="flex-1"
              />
              <Button size="icon" variant="destructive" onClick={() => removeField(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-full bg-transparent" onClick={addField}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Atributo
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar NPC</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
