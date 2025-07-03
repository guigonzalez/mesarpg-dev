"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Save, Eye, GripVertical } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Checkbox } from "@/components/ui/checkbox"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Tipos baseados no MVP original
interface SheetField {
  id: string
  name: string
  type: "text" | "number" | "boolean" | "textarea" | "image"
  value: string | number | boolean
  required?: boolean
}

interface SheetTemplate {
  name: string
  fields: SheetField[]
}

interface Campaign {
  id: string
  name: string
  system: "D&D 5e" | "Vampiro: A Máscara" | "Livre"
  sheet_template?: any
}

// Templates pré-configurados baseados no MVP
const mockSheets: { [key: string]: SheetTemplate } = {
  "D&D 5e": {
    name: "Ficha de Dungeons & Dragons 5e",
    fields: [
      { id: "dnd1", name: "Nome do Personagem", type: "text", value: "", required: true },
      { id: "dnd_img", name: "Avatar", type: "image", value: "" },
      { id: "dnd2", name: "Classe & Nível", type: "text", value: "", required: true },
      { id: "dnd3", name: "Força", type: "number", value: 10 },
      { id: "dnd4", name: "Destreza", type: "number", value: 10 },
      { id: "dnd5", name: "Constituição", type: "number", value: 10 },
      { id: "dnd6", name: "Inteligência", type: "number", value: 10 },
      { id: "dnd7", name: "Sabedoria", type: "number", value: 10 },
      { id: "dnd8", name: "Carisma", type: "number", value: 10 },
      { id: "dnd9", name: "Inspirado", type: "boolean", value: false },
    ],
  },
  "Vampiro: A Máscara": {
    name: "Ficha de Vampiro: A Máscara",
    fields: [
      { id: "vtm1", name: "Nome", type: "text", value: "", required: true },
      { id: "vtm_img", name: "Retrato", type: "image", value: "" },
      { id: "vtm2", name: "Clã", type: "text", value: "", required: true },
      { id: "vtm3", name: "Geração", type: "number", value: 13 },
      { id: "vtm4", name: "Força de Vontade", type: "number", value: 5 },
      { id: "vtm5", name: "Humanidade", type: "number", value: 7 },
      { id: "vtm6", name: "Frenesi", type: "boolean", value: false },
    ],
  },
  Livre: {
    name: "Ficha Livre",
    fields: [
      { id: "free1", name: "Nome", type: "text", value: "", required: true },
      { id: "free_img", name: "Imagem", type: "image", value: "" },
      { id: "free2", name: "Conceito", type: "text", value: "" },
    ],
  },
}

// Componente de item de campo com drag-and-drop
function SortableFieldItem({
  field,
  onFieldChange,
  onRemove,
}: {
  field: SheetField
  onFieldChange: (prop: "name" | "type", value: string) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-muted rounded-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted-foreground/10 rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
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

// Componente de Preview (com lógica de agrupamento do MVP)
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
export function SheetTemplateEditor({ 
  campaign, 
  onSave 
}: { 
  campaign: Campaign
  onSave: (template: SheetTemplate) => Promise<void>
}) {
  const [fields, setFields] = useState<SheetField[]>(() => {
    try {
      const sheetTemplate = campaign.sheet_template as any
      if (sheetTemplate && typeof sheetTemplate === 'object' && Array.isArray(sheetTemplate.fields)) {
        return sheetTemplate.fields.map((f: any, i: number) => ({ ...f, id: f.id || `field-${i}` }))
      }
    } catch (e) {
      console.error('Erro ao parsear sheet_template:', e)
    }
    return []
  })

  const [isSaving, setIsSaving] = useState(false)

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

    if (active.id !== over?.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Remove o ID temporário do frontend antes de salvar
      const fieldsToSave = fields.map(({ id, ...rest }) => rest) as Omit<SheetField, "id">[]
      const template: SheetTemplate = {
        name: `Template ${campaign.system}`,
        fields: fieldsToSave.map((f) => ({ ...f, id: "" }))
      }
      
      await onSave(template)
    } catch (error) {
      console.error('Erro ao salvar template:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <Card className="h-full border-none">
          <CardHeader>
            <CardTitle>Editor de Template</CardTitle>
            <CardDescription>
              Personalize e reordene os campos da ficha. Arraste os campos para reordenar.
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
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        onFieldChange={(prop, value) => handleFieldChange(field.id, prop, value)}
                        onRemove={() => removeField(field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            <Button variant="outline" className="w-full bg-transparent" onClick={addField}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Campo
            </Button>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Template'}
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
