"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Save, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Database, SheetTemplate, SheetField } from '@/lib/database.types'
import { ImageUpload } from "../ui/image-upload"
import { useDebounce } from "@/hooks/use-debounce"

type Campaign = Database['public']['Tables']['campaigns']['Row']

interface CharacterFieldValue {
  id: string
  value: string | number | boolean
}

interface CharacterCreationFormProps {
  campaign: Campaign
  template: SheetTemplate
  onSave: (data: { character_name: string; sheet_data: any }) => Promise<void>
  isNewCharacter: boolean
  existingData?: {
    character_name: string
    sheet_data: any
  }
}

// Componente AttributeBox simples para campos numéricos
function AttributeBox({ 
  field, 
  onChange 
}: { 
  field: SheetField
  onChange: (value: number) => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center w-24 h-24 p-2 border rounded-lg bg-background text-center">
      <Label htmlFor={field.id} className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {field.name}
      </Label>
      <Input
        id={field.id}
        type="number"
        value={field.value as number}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="text-center text-lg font-bold border-none bg-transparent p-0 h-8 w-full"
        min={field.validation?.min}
        max={field.validation?.max}
      />
    </div>
  )
}

// Função para agrupar campos numéricos consecutivos (mesmo do CharacterSheet existente)
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

// Componente de Preview da Ficha
function CharacterPreview({ 
  characterName, 
  fields 
}: { 
  characterName: string
  fields: SheetField[] 
}) {
  const groupedFields = useMemo(() => groupFields(fields), [fields])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview da Ficha
        </CardTitle>
        <CardDescription>
          {characterName || 'Nome do Personagem'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
        {groupedFields.map((groupOrField, index) => {
          if (Array.isArray(groupOrField)) {
            // Renderiza um grupo de atributos numéricos
            return (
              <div key={`preview-group-${index}`} className="flex flex-wrap gap-4">
                {groupOrField.map((field) => (
                  <div
                    key={field.id}
                    className="flex flex-col items-center justify-center w-24 h-24 p-2 border rounded-lg bg-muted/50 text-center"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {field.name || "Atributo"}
                    </p>
                    <p className="text-3xl font-bold text-muted-foreground">
                      {field.value || 10}
                    </p>
                  </div>
                ))}
              </div>
            )
          } else {
            // Renderiza um campo individual
            const field = groupOrField
            return (
              <div key={field.id} className="grid gap-1.5">
                <label className="text-sm font-medium">
                  {field.name || "Novo Campo"}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <div className="text-sm p-3 min-h-[80px] rounded-md border bg-muted/50 whitespace-pre-wrap">
                    {field.value || "..."}
                  </div>
                ) : field.type === "image" ? (
                  <div className="text-sm p-3 h-24 rounded-md border bg-muted/50 flex items-center justify-center text-muted-foreground">
                    {field.value ? "Imagem carregada" : "Upload de Imagem"}
                  </div>
                ) : field.type === "boolean" ? (
                  <div className="flex items-center space-x-2 p-3 rounded-md border bg-muted/50">
                    <Checkbox checked={!!field.value} disabled />
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                      {field.value ? "Sim" : "Não"}
                    </label>
                  </div>
                ) : field.type === "select" ? (
                  <div className="text-sm p-3 rounded-md border bg-muted/50 flex items-center justify-between text-muted-foreground">
                    <span>{field.value || "Selecione uma opção..."}</span>
                    <span>▼</span>
                  </div>
                ) : (
                  <div className="text-sm p-3 rounded-md border bg-muted/50">
                    {field.value || "..."}
                  </div>
                )}
              </div>
            )
          }
        })}
      </CardContent>
    </Card>
  )
}

// Indicador de Auto-save
function AutoSaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <Clock className="h-4 w-4 animate-spin" />
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getText = () => {
    switch (status) {
      case 'saving':
        return 'Salvando...'
      case 'saved':
        return 'Salvo'
      case 'error':
        return 'Erro ao salvar'
      default:
        return ''
    }
  }

  if (status === 'idle') return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {getIcon()}
      <span>{getText()}</span>
    </div>
  )
}

export function CharacterCreationForm({
  campaign,
  template,
  onSave,
  isNewCharacter,
  existingData
}: CharacterCreationFormProps) {
  const [characterName, setCharacterName] = useState(existingData?.character_name || '')
  const [fields, setFields] = useState<SheetField[]>(() => {
    // Inicializar campos com dados existentes ou valores padrão do template
    return template.fields.map(templateField => {
      const existingField = existingData?.sheet_data?.fields?.find(
        (f: CharacterFieldValue) => f.id === templateField.id
      )
      return {
        ...templateField,
        value: existingField ? existingField.value : templateField.value
      }
    })
  })

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isSaving, setIsSaving] = useState(false)

  // Debounce para auto-save
  const debouncedCharacterName = useDebounce(characterName, 2000)
  const debouncedFields = useDebounce(fields, 2000)

  // Auto-save effect
  useEffect(() => {
    if (!isNewCharacter && (debouncedCharacterName || debouncedFields)) {
      handleAutoSave()
    }
  }, [debouncedCharacterName, debouncedFields, isNewCharacter])

  const handleAutoSave = async () => {
    if (!characterName.trim()) return

    try {
      setSaveStatus('saving')
      
      const characterData = {
        character_name: characterName,
        sheet_data: {
          fields: fields.map(field => ({
            id: field.id,
            value: field.value
          }))
        }
      }

      await onSave(characterData)
      setSaveStatus('saved')
      
      // Limpar status após 3 segundos
      setTimeout(() => setSaveStatus('idle'), 3000)
      
    } catch (error) {
      console.error('Erro no auto-save:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 5000)
    }
  }

  const handleFieldChange = (fieldId: string, value: string | number | boolean) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId ? { ...field, value } : field
      )
    )
  }

  const handleManualSave = async () => {
    if (!characterName.trim()) {
      alert('Nome do personagem é obrigatório')
      return
    }

    try {
      setIsSaving(true)
      
      const characterData = {
        character_name: characterName,
        sheet_data: {
          fields: fields.map(field => ({
            id: field.id,
            value: field.value
          }))
        }
      }

      await onSave(characterData)
      
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar personagem')
    } finally {
      setIsSaving(false)
    }
  }

  const groupedFields = useMemo(() => groupFields(fields), [fields])

  return (
    <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
      {/* Formulário Principal */}
      <ResizablePanel defaultSize={60}>
        <Card className="h-full border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {isNewCharacter ? 'Criar Personagem' : 'Editar Personagem'}
                </CardTitle>
                <CardDescription>
                  Preencha os campos baseados no template: {template.name}
                </CardDescription>
              </div>
              <AutoSaveIndicator status={saveStatus} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
            {/* Nome do Personagem */}
            <div className="space-y-2">
              <Label htmlFor="character-name">
                Nome do Personagem <span className="text-red-500">*</span>
              </Label>
              <Input
                id="character-name"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Digite o nome do personagem"
                className="text-lg font-semibold"
              />
            </div>

            {/* Campos do Template */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Atributos do Personagem</h3>
              
              {groupedFields.map((groupOrField, index) => {
                if (Array.isArray(groupOrField)) {
                  // Renderiza um grupo de atributos numéricos
                  return (
                    <div key={`group-${index}`} className="flex flex-wrap gap-4">
                      {groupOrField.map((field) => (
                        <AttributeBox
                          key={field.id}
                          field={field}
                          onChange={(value) => handleFieldChange(field.id, value)}
                        />
                      ))}
                    </div>
                  )
                } else {
                  // Renderiza um campo individual
                  const field = groupOrField
                  return (
                    <div key={field.id} className="grid gap-2">
                      <Label htmlFor={field.id}>
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {field.type === "text" && (
                        <Input
                          id={field.id}
                          value={field.value as string}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={`Digite ${field.name.toLowerCase()}`}
                        />
                      )}
                      
                      {field.type === "textarea" && (
                        <Textarea
                          id={field.id}
                          value={field.value as string}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={`Digite ${field.name.toLowerCase()}`}
                          rows={4}
                        />
                      )}
                      
                      {field.type === "boolean" && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id={field.id}
                            checked={field.value as boolean}
                            onCheckedChange={(checked) => handleFieldChange(field.id, !!checked)}
                          />
                          <label htmlFor={field.id} className="text-sm font-medium">
                            Ativo
                          </label>
                        </div>
                      )}
                      
                      {field.type === "select" && field.validation?.options && (
                        <Select
                          value={field.value as string}
                          onValueChange={(value) => handleFieldChange(field.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.validation.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {field.type === "image" && (
                        <ImageUpload
                          value={field.value as string}
                          onChange={(base64) => handleFieldChange(field.id, base64)}
                        />
                      )}
                    </div>
                  )
                }
              })}
            </div>
          </CardContent>
          
          {/* Botão de Salvar */}
          <div className="p-6 border-t">
            <Button 
              onClick={handleManualSave} 
              disabled={isSaving || !characterName.trim()}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : isNewCharacter ? 'Criar Personagem' : 'Salvar Alterações'}
            </Button>
          </div>
        </Card>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Preview */}
      <ResizablePanel defaultSize={40}>
        <div className="p-4 h-full">
          <CharacterPreview 
            characterName={characterName}
            fields={fields}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
