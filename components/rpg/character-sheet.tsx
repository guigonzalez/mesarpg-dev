"use client"

import { useState, useEffect, useMemo } from "react"
import { useMesaStore } from "@/lib/store"
import type { SheetField } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { AttributeBox } from "./attribute-box"
import { ImageUpload } from "../ui/image-upload"

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

export function CharacterSheet() {
  const campaign = useMesaStore((state) => state.activeCampaign)
  const user = useMesaStore((state) => state.currentUser)
  const updateUserSheet = useMesaStore((state) => state.updateCurrentUserSheet)
  const [sheetData, setSheetData] = useState<SheetField[]>([])

  useEffect(() => {
    if (campaign?.sheetTemplate && user) {
      const mergedData = campaign.sheetTemplate.fields.map((templateField) => {
        const userField = user.sheetData?.find((f) => f.name === templateField.name)
        return { ...templateField, value: userField ? userField.value : templateField.value }
      })
      setSheetData(mergedData)
    }
  }, [campaign, user])

  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    const updatedData = sheetData.map((field) => (field.name === fieldName ? { ...field, value } : field))
    setSheetData(updatedData)
  }

  const handleSaveSheet = () => {
    updateUserSheet(sheetData)
    alert("Ficha salva com sucesso!")
  }

  const groupedSheetData = useMemo(() => groupFields(sheetData), [sheetData])

  if (!campaign || !user) return <p>Selecione uma campanha para ver a ficha.</p>
  if (user.id === campaign.masterId) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>Você é o Mestre desta campanha.</p>
        <p className="text-sm">Visualize as fichas dos jogadores na tela de Preparação.</p>
      </div>
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>{campaign.sheetTemplate.name}</CardTitle>
        <CardDescription>Preencha os dados do seu personagem para esta campanha.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupedSheetData.map((groupOrField, index) => {
          if (Array.isArray(groupOrField)) {
            // Renderiza um grupo de atributos numéricos
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
            // Renderiza um campo individual
            const field = groupOrField
            return (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>
                  {field.name}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {/* Renderização dos outros tipos de campo */}
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
        <Button onClick={handleSaveSheet} className="w-full mt-6">
          <Save className="mr-2 h-4 w-4" />
          Salvar Ficha
        </Button>
      </CardContent>
    </Card>
  )
}
