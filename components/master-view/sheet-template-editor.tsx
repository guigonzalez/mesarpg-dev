"use client"

import { useState, useMemo } from "react"
import type { Campaign, SheetField } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { mockSheets } from "@/lib/mocks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Save, Eye, GripVertical } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Checkbox } from "@/components/ui/checkbox"

// Componente de item arrastável
function SortableFieldItem({
  field,
  onFieldChange,
  onRemove,
}: {
  field: SheetField
  onFieldChange: (prop: "name" | "type", value: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </Button>
      <Input
        placeholder="Nome do Atributo"
        value={field.name}
        onChange={(e) => onFieldChange("name", e.target.value)}
        className="flex-1"
      />
      <Select value={field.type} onValueChange={(value: any) => onFieldChange("type", value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">Texto Curto</SelectItem>
          <SelectItem value="textarea">Texto Longo</SelectItem>
          <SelectItem value="number">Número</SelectItem>
          <SelectItem value="boolean">Sim/Não</SelectItem>
          <SelectItem value="image">Imagem (Upload)</SelectItem>
        </SelectContent>
      </Select>
      <Button size="icon" variant="destructive" onClick={onRemove}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Componente de Preview (com lógica de agrupamento)
const groupFieldsForPreview = (fields: SheetField[]) => {
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

function SheetPreview({ fields }: { fields: SheetField[] }) {
  const groupedFields = useMemo(() => groupFieldsForPreview(fields), [fields])
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" /> Preview da Ficha
        </CardTitle>
        <CardDescription>É assim que os jogadores verão a ficha.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupedFields.map((groupOrField, index) => {
          if (Array.isArray(groupOrField)) {
            return (
              <div key={`preview-group-${index}`} className="flex flex-wrap gap-4">
                {groupOrField.map((field) => (
                  <div
                    key={field.id}
                    className="flex flex-col items-center justify-center w-24 h-24 p-2 border rounded-lg bg-muted/50 text-center"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{field.name || "Atributo"}</p>
                    <p className="text-3xl font-bold text-muted-foreground">10</p>
                  </div>
                ))}
              </div>
            )
          } else {
            const field = groupOrField
            return (
              <div key={field.id} className="grid gap-1.5">
                <label className="text-sm font-medium">{field.name || "Novo Campo"}</label>
                {field.type === "textarea" ? (
                  <div className="text-sm p-3 h-24 rounded-md border bg-muted/50">...</div>
                ) : field.type === "image" ? (
                  <div className="text-sm p-3 h-24 rounded-md border bg-muted/50 flex items-center justify-center text-muted-foreground">
                    Upload de Imagem
                  </div>
                ) : field.type === "boolean" ? (
                  <div className="flex items-center space-x-2 p-3 rounded-md border bg-muted/50">
                    <Checkbox id={`preview-${field.id}`} disabled />
                    <label
                      htmlFor={`preview-${field.id}`}
                      className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Opção Sim/Não
                    </label>
                  </div>
                ) : (
                  <div className="text-sm p-3 rounded-md border bg-muted/50">...</div>
                )}
              </div>
            )
          }
        })}
      </CardContent>
    </Card>
  )
}

// Editor principal
export function SheetTemplateEditor({ campaign }: { campaign: Campaign }) {
  const { updateSheetTemplate } = useMesaStore()
  const [fields, setFields] = useState<SheetField[]>(() =>
    campaign.sheetTemplate.fields.map((f, i) => ({ ...f, id: f.id || `field-${i}` })),
  )

  const fieldIds = useMemo(() => fields.map((f) => f.id), [fields])

  const handleFieldChange = (id: string, prop: "name" | "type", value: string) => {
    setFields((currentFields) => currentFields.map((f) => (f.id === id ? { ...f, [prop]: value, value: "" } : f)))
  }

  const addField = () => {
    const newId = `field-${Date.now()}`
    setFields([...fields, { id: newId, name: "Novo Atributo", type: "text", value: "" }])
  }

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const loadPreset = (system: string) => {
    if (mockSheets[system]) {
      setFields(mockSheets[system].fields.map((f, i) => ({ ...f, id: `preset-${system}-${i}` })))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSave = () => {
    // Remove o ID temporário do frontend antes de salvar
    const fieldsToSave = fields.map(({ id, ...rest }) => rest) as Omit<SheetField, "id">[]
    updateSheetTemplate(fieldsToSave.map((f) => ({ ...f, id: "" }))) // A store pode gerar IDs se necessário, ou o backend
    alert("Template da ficha salvo com sucesso!")
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <Card className="h-full border-none">
          <CardHeader>
            <CardTitle>Editor de Template</CardTitle>
            <CardDescription>
              Personalize e reordene os campos da ficha. Arraste a divisória para ver o preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
            <div>
              <label className="text-sm font-medium">Carregar um Preset</label>
              <Select onValueChange={loadPreset}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Comece com um modelo pronto..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(mockSheets).map((system) => (
                    <SelectItem key={system} value={system}>
                      {system}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Campos da Ficha</h3>
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
                  {fields.map((field) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      onFieldChange={(prop, value) => handleFieldChange(field.id, prop, value)}
                      onRemove={() => removeField(field.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <Button variant="outline" className="w-full bg-transparent" onClick={addField}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Campo
            </Button>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Template
            </Button>
          </CardFooter>
        </Card>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="p-4 h-full">
          <SheetPreview fields={fields} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
