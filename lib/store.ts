import { create } from "zustand"
import { mockUsers, mockCampaigns } from "./mocks"
import type { User, Campaign, SheetField, Token, Marker, ChatMessage, MapData, Npc, Handout } from "./types"
import { rollDice } from "./utils"

interface MesaState {
  // --- Estado Global ---
  users: User[]
  campaigns: Campaign[]
  currentUser: User | null
  activeCampaign: Campaign | null

  // --- Ações de Sessão ---
  login: (credentials: { email: string; password?: string }) => void
  logout: () => void

  // --- Ações de Ficha ---
  updateCurrentUserSheet: (newSheetData: SheetField[]) => void
  updatePlayerSheet: (playerId: string, newSheetData: SheetField[]) => void

  // --- Ações de Campanha (Dashboard) ---
  addCampaign: (
    campaignData: Omit<
      Campaign,
      "id" | "masterId" | "playerIds" | "tokens" | "chat" | "markers" | "sheetTemplate" | "drawing"
    >,
  ) => void

  // --- Ações de Campanha Ativa ---
  setActiveCampaign: (campaignId: string) => void
  clearActiveCampaign: () => void
  updateActiveCampaign: (updatedData: Partial<Campaign>) => void

  // --- Ações de Jogador (Gerenciamento) ---
  approvePlayer: (playerId: string) => void
  removePlayer: (playerId: string) => void

  // --- Ações de Mapa (CRUD) ---
  addMap: (mapData: Omit<MapData, "id">) => void
  updateMap: (mapData: MapData) => void
  deleteMap: (mapId: string) => void
  setActiveMap: (mapId: string) => void

  // --- Ações de NPC (CRUD) ---
  addNpc: (npcData: Omit<Npc, "id">) => void
  updateNpc: (npcData: Npc) => void
  deleteNpc: (npcId: string) => void

  // --- Ações de Handout (CRUD) ---
  addHandout: (handoutData: Omit<Handout, "id">) => void
  updateHandout: (handoutData: Handout) => void
  deleteHandout: (handoutId: string) => void

  // --- Ações de Template de Ficha ---
  updateSheetTemplate: (fields: SheetField[]) => void

  // --- Ações do Grid ---
  moveToken: (tokenId: string, newPosition: { x: number; y: number }) => void
  addToken: (tokenData: Omit<Token, "id">) => void
  addMarker: (markerData: Omit<Marker, "id">) => void
  removeMarker: (position: { x: number; y: number }) => void
  clearMarkers: () => void
  updateFogOfWar: (cells: { x: number; y: number }[], mode: "add" | "reveal") => void
  removeTokensInArea: (cells: { x: number; y: number }[]) => void

  // --- Ações de Chat ---
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void
  rollDiceAndChat: (expression: string, author: string) => void
}

export const useMesaStore = create<MesaState>((set, get) => ({
  // --- Estado Inicial ---
  users: mockUsers,
  campaigns: mockCampaigns,
  currentUser: null,
  activeCampaign: null,

  // --- Implementação das Ações ---
  login: (credentials) => {
    const user = get().users.find((u) => u.email === credentials.email && u.password === credentials.password)
    if (user) {
      set({ currentUser: user })
    } else {
      throw new Error("Credenciais inválidas!")
    }
  },

  logout: () => set({ currentUser: null, activeCampaign: null }),

  updateCurrentUserSheet: (newSheetData) => {
    set((state) => {
      if (!state.currentUser || !state.activeCampaign) return {}

      // Encontra a nova imagem na ficha
      const imageField = newSheetData.find((f) => f.type === "image")
      const newTokenImage = (imageField?.value as string) || state.currentUser.tokenImage

      // Atualiza o usuário
      const updatedUser = {
        ...state.currentUser,
        sheetData: newSheetData,
        tokenImage: newTokenImage,
      }

      // Atualiza o token correspondente no mapa
      const updatedTokens = state.activeCampaign.tokens.map((token) =>
        token.ownerId === updatedUser.id ? { ...token, image: newTokenImage } : token,
      )

      const updatedCampaign = { ...state.activeCampaign, tokens: updatedTokens }

      return {
        currentUser: updatedUser,
        users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        activeCampaign: updatedCampaign,
        campaigns: state.campaigns.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c)),
      }
    })
  },

  updatePlayerSheet: (playerId, newSheetData) => {
    set((state) => {
      if (!state.activeCampaign) return {}

      const imageField = newSheetData.find((f) => f.type === "image")
      const playerToUpdate = state.users.find((u) => u.id === playerId)
      const newTokenImage = (imageField?.value as string) || playerToUpdate?.tokenImage

      const updatedUsers = state.users.map((user) =>
        user.id === playerId ? { ...user, sheetData: newSheetData, tokenImage: newTokenImage } : user,
      )

      const updatedTokens = state.activeCampaign.tokens.map((token) =>
        token.ownerId === playerId ? { ...token, image: newTokenImage } : token,
      )

      const updatedCampaign = { ...state.activeCampaign, tokens: updatedTokens }

      return {
        users: updatedUsers,
        activeCampaign: updatedCampaign,
        campaigns: state.campaigns.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c)),
      }
    })
  },

  addCampaign: (campaignData) => {
    set((state) => {
      if (!state.currentUser) return {}
      const newCampaign: Campaign = {
        ...campaignData,
        id: `camp-${Date.now()}`,
        masterId: state.currentUser.id,
        playerIds: [],
        tokens: [],
        chat: [],
        maps: [],
        npcs: [],
        handouts: [],
        markers: [],
        drawing: [],
        sheetTemplate: { name: "Ficha Livre", fields: [] },
      }
      return { campaigns: [...state.campaigns, newCampaign] }
    })
  },

  setActiveCampaign: (campaignId) => {
    const campaign = get().campaigns.find((c) => c.id === campaignId)
    if (campaign) {
      set({ activeCampaign: campaign })
    }
  },

  clearActiveCampaign: () => set({ activeCampaign: null }),

  updateActiveCampaign: (updatedData) => {
    set((state) => {
      if (!state.activeCampaign) return {}
      const updatedCampaign = { ...state.activeCampaign, ...updatedData }
      return {
        activeCampaign: updatedCampaign,
        campaigns: state.campaigns.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c)),
      }
    })
  },

  // --- Jogadores ---
  approvePlayer: (playerId) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const pendingPlayerIds = activeCampaign.pendingPlayerIds?.filter((id) => id !== playerId)
    const playerIds = [...activeCampaign.playerIds, playerId]
    updateActiveCampaign({ pendingPlayerIds, playerIds })
  },

  removePlayer: (playerId) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const playerIds = activeCampaign.playerIds.filter((id) => id !== playerId)
    const pendingPlayerIds = activeCampaign.pendingPlayerIds?.filter((id) => id !== playerId)
    updateActiveCampaign({ playerIds, pendingPlayerIds })
  },

  // --- Mapas ---
  addMap: (mapData) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const newMap = { ...mapData, id: `map-${Date.now()}` }
    const maps = [...(activeCampaign.maps || []), newMap]
    updateActiveCampaign({ maps })
  },

  updateMap: (mapData) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const maps = (activeCampaign.maps || []).map((m) => (m.id === mapData.id ? mapData : m))
    updateActiveCampaign({ maps })
  },

  deleteMap: (mapId) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const maps = (activeCampaign.maps || []).filter((m) => m.id !== mapId)
    updateActiveCampaign({ maps })
  },

  setActiveMap: (mapId) => {
    get().updateActiveCampaign({ activeMapId: mapId })
  },

  // --- NPCs ---
  addNpc: (npcData) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const newNpc = { ...npcData, id: `npc-${Date.now()}` }
    const npcs = [...(activeCampaign.npcs || []), newNpc]
    updateActiveCampaign({ npcs })
  },

  updateNpc: (npcData) => {
    set((state) => {
      if (!state.activeCampaign) return {}

      const npcs = (state.activeCampaign.npcs || []).map((n) => (n.id === npcData.id ? npcData : n))

      const updatedTokens = state.activeCampaign.tokens.map((token) =>
        token.ownerId === npcData.id ? { ...token, image: npcData.tokenImage || npcData.avatarUrl } : token,
      )

      const updatedCampaign = { ...state.activeCampaign, npcs, tokens: updatedTokens }

      return {
        activeCampaign: updatedCampaign,
        campaigns: state.campaigns.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c)),
      }
    })
  },

  deleteNpc: (npcId) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const npcs = (activeCampaign.npcs || []).filter((n) => n.id !== npcId)
    updateActiveCampaign({ npcs })
  },

  // --- Handouts ---
  addHandout: (handoutData) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const newHandout = { ...handoutData, id: `handout-${Date.now()}` }
    const handouts = [...(activeCampaign.handouts || []), newHandout]
    updateActiveCampaign({ handouts })
  },

  updateHandout: (handoutData) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const handouts = (activeCampaign.handouts || []).map((h) => (h.id === handoutData.id ? handoutData : h))
    updateActiveCampaign({ handouts })
  },

  deleteHandout: (handoutId) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const handouts = (activeCampaign.handouts || []).filter((h) => h.id !== handoutId)
    updateActiveCampaign({ handouts })
  },

  // --- Template de Ficha ---
  updateSheetTemplate: (fields) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const sheetTemplate = { ...activeCampaign.sheetTemplate, fields }
    updateActiveCampaign({ sheetTemplate })
  },

  // --- Grid ---
  moveToken: (tokenId, newPosition) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const updatedTokens = activeCampaign.tokens.map((token) =>
      token.id === tokenId ? { ...token, position: newPosition } : token,
    )
    updateActiveCampaign({ tokens: updatedTokens })
  },

  addToken: (tokenData) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const newToken: Token = { ...tokenData, id: `token-${Date.now()}` }
    updateActiveCampaign({ tokens: [...activeCampaign.tokens, newToken] })
  },

  addMarker: (markerData) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const newMarker: Marker = { ...markerData, id: `marker-${Date.now()}` }
    const markers = activeCampaign.markers || []
    updateActiveCampaign({ markers: [...markers, newMarker] })
  },

  removeMarker: (position) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign || !activeCampaign.markers) return
    const updatedMarkers = activeCampaign.markers.filter(
      (m) => m.position.x !== position.x || m.position.y !== position.y,
    )
    updateActiveCampaign({ markers: updatedMarkers })
  },

  clearMarkers: () => {
    get().updateActiveCampaign({ markers: [] })
  },

  updateFogOfWar: (cells, mode) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return

    const fogSet = new Set((activeCampaign.fogOfWar || []).map((c) => `${c.x},${c.y}`))

    if (mode === "add") {
      cells.forEach((cell) => fogSet.add(`${cell.x},${cell.y}`))
    } else {
      cells.forEach((cell) => fogSet.delete(`${cell.x},${cell.y}`))
    }

    const newFogOfWar = Array.from(fogSet).map((s) => {
      const [x, y] = s.split(",").map(Number)
      return { x, y }
    })

    updateActiveCampaign({ fogOfWar: newFogOfWar })
  },

  removeTokensInArea: (cells) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return

    const cellSet = new Set(cells.map((c) => `${c.x},${c.y}`))
    const remainingTokens = activeCampaign.tokens.filter(
      (token) => !cellSet.has(`${token.position.x},${token.position.y}`),
    )

    updateActiveCampaign({ tokens: remainingTokens })
  },

  // --- Chat ---
  addChatMessage: (message) => {
    const { activeCampaign, updateActiveCampaign } = get()
    if (!activeCampaign) return
    const newMessage: ChatMessage = {
      ...message,
      id: `msg${Date.now()}`,
      timestamp: new Date(),
    }
    const chat = activeCampaign.chat || []
    updateActiveCampaign({ chat: [...chat, newMessage] })
  },

  rollDiceAndChat: (expression, author) => {
    const result = rollDice(expression)
    get().addChatMessage({
      author,
      content: `rolou ${expression} e obteve: ${result}`,
      type: "dice",
    })
  },
}))
