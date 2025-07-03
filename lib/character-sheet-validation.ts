import { SheetTemplate, SheetField, CharacterSheetData, CharacterSheetValidationResult } from './database.types'

/**
 * Valida uma ficha de personagem contra o template da campanha
 */
export function validateCharacterSheet(
  sheetData: CharacterSheetData,
  template: SheetTemplate
): CharacterSheetValidationResult {
  const missingRequiredFields: string[] = []
  const invalidFields: { fieldId: string; reason: string }[] = []

  // Verificar se a versão do template é compatível
  if (sheetData.templateVersion !== template.version) {
    console.warn(`Template version mismatch: sheet has v${sheetData.templateVersion}, template is v${template.version}`)
  }

  // Criar mapa de valores preenchidos para acesso rápido
  const fieldValues = new Map(
    sheetData.fields.map(field => [field.id, field.value])
  )

  // Validar cada campo do template
  for (const templateField of template.fields) {
    const fieldValue = fieldValues.get(templateField.id)
    
    // Verificar campos obrigatórios
    if (templateField.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      missingRequiredFields.push(templateField.name)
      continue
    }

    // Se o campo não é obrigatório e está vazio, pular validação
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      continue
    }

    // Validar tipo do campo
    const typeValidation = validateFieldType(templateField, fieldValue)
    if (!typeValidation.isValid) {
      invalidFields.push({
        fieldId: templateField.id,
        reason: `${templateField.name}: ${typeValidation.reason}`
      })
    }

    // Validar regras específicas do campo
    const rulesValidation = validateFieldRules(templateField, fieldValue)
    if (!rulesValidation.isValid) {
      invalidFields.push({
        fieldId: templateField.id,
        reason: `${templateField.name}: ${rulesValidation.reason}`
      })
    }
  }

  return {
    isValid: missingRequiredFields.length === 0 && invalidFields.length === 0,
    missingRequiredFields,
    invalidFields
  }
}

/**
 * Valida se o valor está no tipo correto para o campo
 */
function validateFieldType(
  field: SheetField,
  value: string | number | boolean
): { isValid: boolean; reason?: string } {
  switch (field.type) {
    case 'text':
    case 'textarea':
      if (typeof value !== 'string') {
        return { isValid: false, reason: 'deve ser um texto' }
      }
      break

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return { isValid: false, reason: 'deve ser um número válido' }
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { isValid: false, reason: 'deve ser verdadeiro ou falso' }
      }
      break

    case 'select':
      if (typeof value !== 'string') {
        return { isValid: false, reason: 'deve ser uma opção válida' }
      }
      // Validar se a opção está na lista (se definida)
      if (field.validation?.options && !field.validation.options.includes(value)) {
        return { isValid: false, reason: `deve ser uma das opções: ${field.validation.options.join(', ')}` }
      }
      break

    case 'image':
      if (typeof value !== 'string') {
        return { isValid: false, reason: 'deve ser uma URL de imagem válida' }
      }
      // Validação básica de URL (pode ser expandida)
      if (value && !isValidImageUrl(value)) {
        return { isValid: false, reason: 'deve ser uma URL de imagem válida' }
      }
      break
  }

  return { isValid: true }
}

/**
 * Valida regras específicas do campo (min, max, pattern, etc.)
 */
function validateFieldRules(
  field: SheetField,
  value: string | number | boolean
): { isValid: boolean; reason?: string } {
  if (!field.validation) {
    return { isValid: true }
  }

  const { min, max, pattern } = field.validation

  // Validação de valor mínimo (para números)
  if (min !== undefined && typeof value === 'number' && value < min) {
    return { isValid: false, reason: `deve ser pelo menos ${min}` }
  }

  // Validação de valor máximo (para números)
  if (max !== undefined && typeof value === 'number' && value > max) {
    return { isValid: false, reason: `deve ser no máximo ${max}` }
  }

  // Validação de comprimento mínimo (para strings)
  if (min !== undefined && typeof value === 'string' && value.length < min) {
    return { isValid: false, reason: `deve ter pelo menos ${min} caracteres` }
  }

  // Validação de comprimento máximo (para strings)
  if (max !== undefined && typeof value === 'string' && value.length > max) {
    return { isValid: false, reason: `deve ter no máximo ${max} caracteres` }
  }

  // Validação de padrão regex (para strings)
  if (pattern && typeof value === 'string') {
    const regex = new RegExp(pattern)
    if (!regex.test(value)) {
      return { isValid: false, reason: 'formato inválido' }
    }
  }

  return { isValid: true }
}

/**
 * Validação básica de URL de imagem
 */
function isValidImageUrl(url: string): boolean {
  try {
    new URL(url)
    // Verificar se termina com extensão de imagem comum
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const lowercaseUrl = url.toLowerCase()
    return imageExtensions.some(ext => lowercaseUrl.includes(ext)) || 
           lowercaseUrl.includes('image') || 
           lowercaseUrl.includes('img')
  } catch {
    return false
  }
}

/**
 * Cria uma ficha vazia baseada no template
 */
export function createEmptyCharacterSheet(template: SheetTemplate): CharacterSheetData {
  return {
    templateVersion: template.version,
    fields: template.fields.map(field => ({
      id: field.id,
      value: field.value // Usar valor padrão do template
    }))
  }
}

/**
 * Migra uma ficha antiga para uma nova versão do template
 */
export function migrateCharacterSheet(
  oldSheetData: CharacterSheetData,
  newTemplate: SheetTemplate
): CharacterSheetData {
  const oldFieldValues = new Map(
    oldSheetData.fields.map(field => [field.id, field.value])
  )

  const migratedFields = newTemplate.fields.map(templateField => {
    const existingValue = oldFieldValues.get(templateField.id)
    
    return {
      id: templateField.id,
      value: existingValue !== undefined ? existingValue : templateField.value
    }
  })

  return {
    templateVersion: newTemplate.version,
    fields: migratedFields
  }
}

/**
 * Calcula a porcentagem de completude da ficha
 */
export function calculateSheetCompleteness(
  sheetData: CharacterSheetData,
  template: SheetTemplate
): { percentage: number; filledFields: number; totalFields: number; requiredFieldsFilled: number; totalRequiredFields: number } {
  const fieldValues = new Map(
    sheetData.fields.map(field => [field.id, field.value])
  )

  let filledFields = 0
  let requiredFieldsFilled = 0
  let totalRequiredFields = 0

  for (const templateField of template.fields) {
    const fieldValue = fieldValues.get(templateField.id)
    const isFilled = fieldValue !== undefined && fieldValue !== null && fieldValue !== ''

    if (isFilled) {
      filledFields++
    }

    if (templateField.required) {
      totalRequiredFields++
      if (isFilled) {
        requiredFieldsFilled++
      }
    }
  }

  const percentage = template.fields.length > 0 ? (filledFields / template.fields.length) * 100 : 0

  return {
    percentage: Math.round(percentage),
    filledFields,
    totalFields: template.fields.length,
    requiredFieldsFilled,
    totalRequiredFields
  }
}
