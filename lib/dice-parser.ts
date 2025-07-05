// Utilitário para parsing e execução de comandos de dados
// Suporta formatos como: /r 1d20+5, /r 2d6-1, /r 1d4+2d6+3

export interface DiceRoll {
  count: number
  sides: number
}

export interface DiceCommand {
  rolls: DiceRoll[]
  modifier: number
  originalCommand: string
}

export interface DiceResult {
  rolls: Array<{
    dice: string
    results: number[]
    total: number
  }>
  modifier: number
  total: number
  originalCommand: string
  formattedResult: string
}

// Regex para parsing de comandos de dados
const DICE_REGEX = /^\/r\s+(.+)$/i
const DICE_PART_REGEX = /(\d+)?d(\d+)/gi
const MODIFIER_REGEX = /([+-]\d+)/g

export function parseDiceCommand(input: string): DiceCommand | null {
  const match = input.match(DICE_REGEX)
  if (!match) return null

  const command = match[1].trim()
  const rolls: DiceRoll[] = []
  let modifier = 0

  // Extrair todas as rolagens de dados (XdY)
  let diceMatch
  while ((diceMatch = DICE_PART_REGEX.exec(command)) !== null) {
    const count = parseInt(diceMatch[1] || '1')
    const sides = parseInt(diceMatch[2])
    
    if (count > 0 && sides > 0 && count <= 100 && sides <= 1000) {
      rolls.push({ count, sides })
    }
  }

  // Extrair modificadores (+X ou -X)
  const modifiers = command.match(MODIFIER_REGEX)
  if (modifiers) {
    modifier = modifiers.reduce((sum, mod) => sum + parseInt(mod), 0)
  }

  if (rolls.length === 0) return null

  return {
    rolls,
    modifier,
    originalCommand: input
  }
}

export function rollDice(command: DiceCommand): DiceResult {
  const rollResults = command.rolls.map(roll => {
    const results: number[] = []
    for (let i = 0; i < roll.count; i++) {
      results.push(Math.floor(Math.random() * roll.sides) + 1)
    }
    
    const total = results.reduce((sum, result) => sum + result, 0)
    const dice = `${roll.count}d${roll.sides}`
    
    return {
      dice,
      results,
      total
    }
  })

  const rollsTotal = rollResults.reduce((sum, roll) => sum + roll.total, 0)
  const finalTotal = rollsTotal + command.modifier

  // Formatar resultado para exibição
  let formattedResult = rollResults.map(roll => {
    if (roll.results.length === 1) {
      return `${roll.dice}: ${roll.results[0]}`
    } else {
      return `${roll.dice}: [${roll.results.join(', ')}] = ${roll.total}`
    }
  }).join(' + ')

  if (command.modifier !== 0) {
    const modifierStr = command.modifier > 0 ? `+${command.modifier}` : `${command.modifier}`
    formattedResult += ` ${modifierStr}`
  }

  if (rollResults.length > 1 || command.modifier !== 0) {
    formattedResult += ` = ${finalTotal}`
  }

  return {
    rolls: rollResults,
    modifier: command.modifier,
    total: finalTotal,
    originalCommand: command.originalCommand,
    formattedResult
  }
}

// Função de conveniência para processar comando completo
export function processDiceCommand(input: string): DiceResult | null {
  const command = parseDiceCommand(input)
  if (!command) return null
  
  return rollDice(command)
}

// Exemplos de uso:
// /r 1d20+5 -> Rola 1d20 e adiciona 5
// /r 2d6-1 -> Rola 2d6 e subtrai 1  
// /r 1d4+2d6+3 -> Rola 1d4, 2d6 e adiciona 3
// /r 3d8 -> Rola 3d8
// /r d20 -> Rola 1d20 (count padrão é 1)

export function isDiceCommand(input: string): boolean {
  return DICE_REGEX.test(input.trim())
}

export function getDiceCommandHelp(): string {
  return `
Comandos de dados disponíveis:
• /r 1d20+5 - Rola 1d20 e adiciona 5
• /r 2d6-1 - Rola 2d6 e subtrai 1
• /r 1d4+2d6+3 - Múltiplos dados com modificador
• /r 3d8 - Rola 3d8
• /r d20 - Rola 1d20 (padrão)

Limites: máximo 100 dados, máximo 1000 lados
`.trim()
}
