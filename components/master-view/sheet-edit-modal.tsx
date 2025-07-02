"use client"

import { useState, useEffect, useMemo } from "react"
import { useMesaStore } from "@/lib/store"
import type { SheetField, User } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { AttributeBox } from "../rpg/attribute-box"
import { ImageUpload } from "../ui/image-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "../ui/scroll-area"

// Função para agrupar campos numéricos consecutivos
const groupFields = (fields: SheetField[]) => {
  const grouped: (SheetField | SheetField[])[] = []
  let i = 0
  while (i < fields.length) {
    if (fields[i].type === "number") {
      const numberGroup: SheetField[] = []
      while (i < fields.length && fields[i].type === "number") {
        numberGroup.push(fields[i])
        i++
      }
      grouped.push(numberGroup)
    } else {
      grouped.push(fields[i])
      i++
    }
  }
  return grouped
}

interface SheetEditModalProps {
  player: User | null
  isOpen: boolean
  onClose: () => void
}

export function SheetEditModal({ player, isOpen, onClose }: SheetEditModalProps) {
  const { updatePlayerSheet } = useMesaStore()
  const [sheetData, setSheetData] = useState<SheetField[]>([])

  useEffect(() => {
    if (player?.sheetData) {
      setSheetData(player.sheetData)
    } else {
      setSheetData([])
    }
  }, [player])

  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    const updatedData = sheetData.map((field) => (field.name === fieldName ? { ...field, value } : field))
    setSheetData(updatedData)
  }

  const handleSaveSheet = () => {
    if (!player) return
    updatePlayerSheet(player.id, sheetData)
    alert("Ficha salva com sucesso!")
    onClose()
  }

  const groupedSheetData = useMemo(() => groupFields(sheetData), [sheetData])

  if (!player) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editando Ficha de {player.name}</DialogTitle>
          <DialogDescription>Altere os dados do personagem. As alterações são salvas imediatamente.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {groupedSheetData.map((groupOrField, index) => {
              if (Array.isArray(groupOrField)) {
                return (
                  <div key={`group-${index}`} className="flex flex-wrap gap-4">
                    {groupOrField.map((field) => (
                      <AttributeBox
                        key={field.name}
                        field={field}
                        onChange={(value) => handleFieldChange(field.name, value)}
                      />
                    ))}
                  </div>
                )
              } else {
                const field = groupOrField
                return (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name}>
                      {field.name}
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {field.type === "text" && (
                      <Input
                        id={field.name}
                        value={field.value as string}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      />
                    )}
                    {field.type === "textarea" && (
                      <Textarea
                        id={field.name}
                        value={field.value as string}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        rows={4}
                      />
                    )}
                    {field.type === "boolean" && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={field.name}
                          checked={field.value as boolean}
                          onCheckedChange={(checked) => handleFieldChange(field.name, !!checked)}
                        />
                        <label htmlFor={field.name} className="text-sm font-medium">
                          Ativo
                        </label>
                      </div>
                    )}
                    {field.type === "image" && (
                      <ImageUpload
                        value={field.value as string}
                        onChange={(base64) => handleFieldChange(field.name, base64)}
                      />
                    )}
                  </div>
                )
              }
            })}
          </div>
        </ScrollArea>
        <div className="pt-4 border-t">
          <Button onClick={handleSaveSheet} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar e Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
