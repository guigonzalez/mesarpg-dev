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
  type: "text" | "number" | "boolean" | "textarea" | "image" | "select"
  value: string | number | boolean
  required: boolean
  validation?: {
    min?: number
    max?: number
    options?: string[] // Para campos select
    pattern?: string // Regex para validação
  }
  metadata?: {
    isPreset: boolean // Se é campo do sistema ou customizado
    category?: string // Agrupamento (ex: "Atributos", "Habilidades")
    order: number // Ordem de exibição
  }
}

interface SheetTemplate {
  id?: string
  name: string
  version: number
  fields: SheetField[]
  metadata: {
    system: string
    createdAt: string
    updatedAt: string
    createdBy?: string
  }
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
    version: 1,
    fields: [
      { id: "dnd1", name: "Nome do Personagem", type: "text", value: "", required: true, metadata: { isPreset: true, category: "Básico", order: 1 } },
      { id: "dnd_img", name: "Avatar", type: "image", value: "", required: false, metadata: { isPreset: true, category: "Básico", order: 2 } },
      { id: "dnd2", name: "Classe & Nível", type: "text", value: "", required: true, metadata: { isPreset: true, category: "Básico", order: 3 } },
      { id: "dnd3", name: "Força", type: "number", value: 10, required: false, metadata: { isPreset: true, category: "Atributos", order: 4 } },
      { id: "dnd4", name: "Destreza", type: "number", value: 10, required: false, metadata: { isPreset: true, category: "Atributos", order: 5 } },
      { id: "dnd5", name: "Constituição", type: "number", value: 10, required: false, metadata: { isPreset: true, category: "Atributos", order: 6 } },
      { id: "dnd6", name: "Inteligência", type: "number", value: 10, required: false, metadata: { isPreset: true, category: "Atributos", order: 7 } },
      { id: "dnd7", name: "Sabedoria", type: "number", value: 10, required: false, metadata: { isPreset: true, category: "Atributos", order: 8 } },
      { id: "dnd8", name: "Carisma", type: "number", value: 10, required: false, metadata: { isPreset: true, category: "Atributos", order: 9 } },
      { id: "dnd9", name: "Inspirado", type: "boolean", value: false, required: false, metadata: { isPreset: true, category: "Estado", order: 10 } },
    ],
    metadata: {
      system: "D&D 5e",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  "Vampiro: A Máscara": {
    name: "Ficha de Vampiro: A Máscara",
    version: 1,
    fields: [
      { id: "vtm1", name: "Nome", type: "text", value: "", required: true, metadata: { isPreset: true, category: "Básico", order: 1 } },
      { id: "vtm_img", name: "Retrato", type: "image", value: "", required: false, metadata: { isPreset: true, category: "Básico", order: 2 } },
      { id: "vtm2", name: "Clã", type: "text", value: "", required: true, metadata: { isPreset: true, category: "Básico", order: 3 } },
      { id: "vtm3", name: "Geração", type: "number", value: 13, required: false, metadata: { isPreset: true, category: "Vampírico", order: 4 } },
      { id: "vtm4", name: "Força de Vontade", type: "number", value: 5, required: false, metadata: { isPreset: true, category: "Atributos", order: 5 } },
      { id: "vtm5", name: "Humanidade", type: "number", value: 7, required: false, metadata: { isPreset: true, category: "Atributos", order: 6 } },
      { id: "vtm6", name: "Frenesi", type: "boolean", value: false, required: false, metadata: { isPreset: true, category: "Estado", order: 7 } },
    ],
    metadata: {
      system: "Vampiro: A Máscara",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  Livre: {
    name: "Ficha Livre",
    version: 1,
    fields: [
      { id: "free1", name: "Nome", type: "text", value: "", required: true, metadata: { isPreset: true, category: "Básico", order: 1 } },
      { id: "free_img", name: "Imagem", type: "image", value: "", required: false, metadata: { isPreset: true, category: "Básico", order: 2 } },
      { id: "free2", name: "Conceito", type: "text", value: "", required: false, metadata: { isPreset: true, category: "Básico", order: 3 } },
    ],
    metadata: {
      system: "Livre",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
}

// Componente de item de campo com drag-and-drop
function SortableFieldItem({
  field,
  onFieldChange,
  onRequiredChange,
  onRemove,
}: {
  field: SheetField
  onFieldChange: (prop: "name" | "type", value: string) => void
  onRequiredChange: (required: boolean) => void
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

  const isPresetField = field.metadata?.isPreset ?? false

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 p-3 bg-muted rounded-lg"
    >
      <div className="flex items-center gap-2">
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
            <SelectItem value="select">Lista de Opções</SelectItem>
            <SelectItem value="image">Imagem (Upload)</SelectItem>
          </SelectContent>
        </Select>
        <Button size="icon" variant="destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4 ml-8">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`required-${field.id}`}
            checked={field.required}
            onCheckedChange={onRequiredChange}
          />
          <label
            htmlFor={`required-${field.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Campo obrigatório
          </label>
        </div>
        
        {isPresetField && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            Preset do Sistema
          </span>
        )}
        
        {field.metadata?.category && (
          <span className="text-xs text-muted-foreground">
            {field.metadata.category}
          </span>
        )}
      </div>
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
                <label className="text-sm font-medium">
                  {field.name || "Novo Campo"}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
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
                ) : field.type === "select" ? (
                  <div className="text-sm p-3 rounded-md border bg-muted/50 flex items-center justify-between text-muted-foreground">
                    <span>Selecione uma opção...</span>
                    <span>▼</span>
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

  const handleRequiredChange = (id: string, required: boolean) => {
    setFields((currentFields) => currentFields.map((f) => (f.id === id ? { ...f, required } : f)))
  }

  const addField = () => {
    const newId = `field-${Date.now()}`
    const newField: SheetField = {
      id: newId,
      name: "Novo Atributo",
      type: "text",
      value: "",
      required: false,
      metadata: {
        isPreset: false,
        category: "Customizado",
        order: fields.length + 1
      }
    }
    setFields([...fields, newField])
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
      // Validação básica
      if (fields.length === 0) {
        throw new Error('Template deve ter pelo menos um campo')
      }

      // Verificar se há pelo menos um campo obrigatório
      const hasRequiredField = fields.some(field => field.required)
      if (!hasRequiredField) {
        console.warn('Template não possui campos obrigatórios')
      }

      // Verificar nomes duplicados
      const fieldNames = fields.map(f => f.name.trim().toLowerCase())
      const duplicateNames = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index)
      if (duplicateNames.length > 0) {
        throw new Error(`Campos com nomes duplicados encontrados: ${duplicateNames.join(', ')}`)
      }

      // Preservar IDs únicos dos campos para permitir edição posterior
      const fieldsWithUniqueIds = fields.map((field, index) => ({
        ...field,
        id: field.id || `field-${Date.now()}-${index}`,
        metadata: {
          isPreset: field.metadata?.isPreset ?? false,
          category: field.metadata?.category ?? "Customizado",
          order: index + 1
        }
      }))

      const currentTime = new Date().toISOString()
      const template: SheetTemplate = {
        name: `Template ${campaign.system}`,
        version: 1,
        fields: fieldsWithUniqueIds,
        metadata: {
          system: campaign.system,
          createdAt: currentTime,
          updatedAt: currentTime
        }
      }
      
      await onSave(template)
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      throw error // Re-throw para que o componente pai possa tratar
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
                        onRequiredChange={(required) => handleRequiredChange(field.id, required)}
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
