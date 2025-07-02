export interface User {
  id: string
  name: string
  email: string
  password?: string
  sheetData?: SheetField[]
  tokenImage?: string // Imagem do token do personagem do usuário
}

export interface Token {
  id: string
  ownerId: string // Pode ser um userId ou npcId
  type: "player" | "npc" // Novo campo para diferenciar o tipo de token
  name: string
  image: string
  position: { x: number; y: number }
}

export interface ChatMessage {
  id: string
  author: string
  content: string
  type: "player" | "master" | "system" | "dice"
  timestamp: Date
}

export interface MapData {
  id: string
  name: string
  backgroundUrl: string
  gridSize: number // e.g., 20 para um grid 20x20
  scale: number
}

export interface Npc {
  id: string
  name: string
  avatarUrl: string
  sheet: SheetField[]
  tokenImage?: string
}

export interface Handout {
  id: string
  title: string
  type: "text" | "image" | "pdf"
  content: string
  sharedWithPlayers: boolean
}

export interface Marker {
  id: string
  position: { x: number; y: number }
  color: string
  label?: string
}

export interface DrawnLine {
  color: string
  points: { x: number; y: number }[]
}

export interface Campaign {
  id: string
  name: string
  description: string
  system: "D&D 5e" | "Vampiro: A Máscara" | "Livre"
  masterId: string
  playerIds: string[]
  pendingPlayerIds?: string[]
  tokens: Token[]
  chat: ChatMessage[]
  maps?: MapData[]
  activeMapId?: string // ID do mapa ativo na sessão
  npcs?: Npc[]
  handouts?: Handout[]
  markers?: Marker[]
  drawing?: DrawnLine[]
  fogOfWar?: { x: number; y: number }[]
  sheetTemplate: SheetTemplate
}

export interface SheetField {
  id: string
  name: string
  type: "text" | "number" | "boolean" | "textarea" | "image"
  value: string | number | boolean
  required?: boolean
}

export interface SheetTemplate {
  name: string
  fields: SheetField[]
}

export interface SheetCollection {
  [systemName: string]: SheetTemplate
}
