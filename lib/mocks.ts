import type { User, Campaign, SheetCollection } from "./types"

// Usuários agora não têm mais um 'role' global.
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Mestre Gygax",
    email: "mestre@mesarpg.com",
    password: "123",
    tokenImage: "/placeholder.svg?width=40&height=40",
  },
  {
    id: "user2",
    name: "Aragorn",
    email: "jogador@mesarpg.com",
    password: "123",
    tokenImage: "/placeholder.svg?width=40&height=40",
    sheetData: [
      { id: "f1", name: "Nome do Personagem", type: "text", value: "Aragorn", required: true },
      { id: "f2", name: "Classe & Nível", type: "text", value: "Ranger 5", required: true },
      { id: "f3", name: "Força", type: "number", value: 16 },
      { id: "f4", name: "Destreza", type: "number", value: 18 },
      { id: "f_img", name: "Avatar", type: "image", value: "/placeholder.svg?width=100&height=100" },
    ],
  },
  {
    id: "user3",
    name: "Legolas",
    email: "legolas@mesarpg.com",
    password: "123",
    tokenImage: "/placeholder.svg?width=40&height=40",
    sheetData: [
      { id: "f5", name: "Nome do Personagem", type: "text", value: "Legolas", required: true },
      { id: "f6", name: "Classe & Nível", type: "text", value: "Ladino 5", required: true },
      { id: "f7", name: "Força", type: "number", value: 12 },
      { id: "f8", name: "Destreza", type: "number", value: 20 },
    ],
  },
  {
    id: "user4",
    name: "Gimli",
    email: "gimli@mesarpg.com",
    password: "123",
    tokenImage: "/placeholder.svg?width=40&height=40",
  },
  {
    id: "user5",
    name: "Gandalf",
    email: "gandalf@mesarpg.com",
    password: "123",
    tokenImage: "/placeholder.svg?width=40&height=40",
  },
]

// mockSheets agora é uma biblioteca de presets
export const mockSheets: SheetCollection = {
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

// Adicionando tokenImage aos NPCs
export const mockCampaigns: Campaign[] = [
  {
    id: "camp1",
    name: "A Maldição de Strahd",
    description: "Uma aventura sombria nas terras de Barovia.",
    system: "D&D 5e",
    masterId: "user1",
    playerIds: ["user2", "user3"],
    pendingPlayerIds: ["user4"],
    sheetTemplate: mockSheets["D&D 5e"],
    maps: [
      {
        id: "map1",
        name: "Castelo Ravenloft",
        backgroundUrl: "/placeholder.svg?width=1200&height=800",
        scale: 50,
        gridSize: 40,
      },
      {
        id: "map2",
        name: "Vila de Barovia",
        backgroundUrl: "/placeholder.svg?width=1024&height=768",
        scale: 75,
        gridSize: 30,
      },
    ],
    npcs: [
      {
        id: "npc1",
        name: "Strahd von Zarovich",
        avatarUrl: "/placeholder.svg?width=100&height=100",
        tokenImage: "/placeholder.svg?width=40&height=40",
        sheet: [
          { id: "s1", name: "HP", type: "number", value: 144 },
          { id: "s2", name: "AC", type: "number", value: 16 },
          { id: "s3", name: "Ataque Principal", type: "text", value: "Mordida (+9, 2d6+4 perfurante)" },
        ],
      },
      {
        id: "npc2",
        name: "Lobo Atroz",
        avatarUrl: "/placeholder.svg?width=100&height=100",
        tokenImage: "/placeholder.svg?width=40&height=40",
        sheet: [
          { id: "w1", name: "HP", type: "number", value: 37 },
          { id: "w2", name: "AC", type: "number", value: 14 },
        ],
      },
    ],
    handouts: [
      {
        id: "handout1",
        title: "Carta de Kolyan Indirovich",
        type: "text",
        content: "Saudações, nobres aventureiros. Minha amada filha, Ireena, foi afligida por um mal terrível...",
        sharedWithPlayers: true,
      },
    ],
    tokens: [],
    markers: [], // Inicializando marcadores
    chat: [],
    fogOfWar: [],
  },
  {
    id: "camp2",
    name: "Noites de Chicago",
    description: "Intrigas e conspirações na metrópole dos vampiros.",
    system: "Vampiro: A Máscara",
    masterId: "user2",
    playerIds: ["user1"],
    pendingPlayerIds: ["user5"],
    sheetTemplate: mockSheets["Vampiro: A Máscara"], // Inicia com o preset de Vampiro
    maps: [],
    npcs: [],
    handouts: [],
    tokens: [],
    chat: [],
    fogOfWar: [],
  },
]
