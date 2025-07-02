import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function rollDice(expression: string): number {
  // Simulação simples: /r 1d20 + 5
  const cleaned = expression.replace(/\s+/g, "")
  const match = cleaned.match(/(\d+)d(\d+)([+-]\d+)?/)

  if (!match) return 0

  const numDice = Number.parseInt(match[1], 10)
  const numSides = Number.parseInt(match[2], 10)
  const modifier = match[3] ? Number.parseInt(match[3], 10) : 0

  let total = 0
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * numSides) + 1
  }

  return total + modifier
}
