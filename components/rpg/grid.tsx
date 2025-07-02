"use client"

import type React from "react"
import { useState, useRef, useMemo, useEffect } from "react"
import { useMesaStore } from "@/lib/store"
import { Token } from "./token"
import { cn } from "@/lib/utils"
import { MapPin, Eye, EyeOff, Trash2 } from "lucide-react"
import type { DrawnLine } from "@/lib/types"
import { Button } from "../ui/button"

export type GridTool = "move" | "measure" | "mark" | "draw"

interface GridProps {
  activeTool: GridTool
  markerColor: string
  drawColor: string
  lines: DrawnLine[]
  setLines: (lines: DrawnLine[]) => void
}

// --- Componente da Barra de Ferramentas de Seleção ---
const SelectionToolbar = ({
  onHide,
  onReveal,
  onRemoveTokens,
  onClearSelection,
}: {
  onHide: () => void
  onReveal: () => void
  onRemoveTokens: () => void
  onClearSelection: () => void
}) => (
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 bg-background p-2 rounded-lg shadow-lg border flex gap-2">
    <Button size="sm" variant="outline" onClick={onHide}>
      <EyeOff className="h-4 w-4 mr-2" /> Ocultar Área
    </Button>
    <Button size="sm" variant="outline" onClick={onReveal}>
      <Eye className="h-4 w-4 mr-2" /> Revelar Área
    </Button>
    <Button size="sm" variant="destructive" onClick={onRemoveTokens}>
      <Trash2 className="h-4 w-4 mr-2" /> Remover Tokens
    </Button>
    <Button size="sm" variant="ghost" onClick={onClearSelection}>
      Limpar Seleção
    </Button>
  </div>
)

export function Grid({ activeTool, markerColor, drawColor, lines, setLines }: GridProps) {
  const campaign = useMesaStore((state) => state.activeCampaign)
  const currentUser = useMesaStore((state) => state.currentUser)
  const { moveToken, addToken, addMarker, removeMarker, updateFogOfWar, removeTokensInArea } = useMesaStore()
  const gridVisualRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null)
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // State for the new click-click selection
  const [isSelectingArea, setIsSelectingArea] = useState(false)
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null)
  const [selectionPreviewEnd, setSelectionPreviewEnd] = useState<{ x: number; y: number } | null>(null)

  const isMaster = currentUser?.id === campaign?.masterId

  const currentMap = useMemo(() => {
    if (!campaign || !campaign.activeMapId) return null
    return campaign.maps?.find((m) => m.id === campaign.activeMapId)
  }, [campaign])

  const gridSize = currentMap?.gridSize ?? 10
  const cellWidthPercent = 100 / gridSize

  // Effect to cancel selection with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Effect to draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    context.clearRect(0, 0, canvas.width, canvas.height)
    lines.forEach((line) => {
      context.strokeStyle = line.color
      context.lineWidth = 3
      context.lineCap = "round"
      context.lineJoin = "round"
      context.beginPath()
      line.points.forEach((p, i) => {
        if (i === 0) context.moveTo(p.x, p.y)
        else context.lineTo(p.x, p.y)
      })
      context.stroke()
    })
  }, [lines])

  const getSelectedCells = useMemo(() => {
    const start = selectionStart
    const end = isSelectingArea ? selectionPreviewEnd : selectionEnd

    if (!start || !end) return []
    const cells = []
    const startX = Math.min(start.x, end.x)
    const endX = Math.max(start.x, end.x)
    const startY = Math.min(start.y, end.y)
    const endY = Math.max(start.y, end.y)
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        cells.push({ x, y })
      }
    }
    return cells
  }, [selectionStart, selectionEnd, selectionPreviewEnd, isSelectingArea])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, x: number, y: number) => {
    e.preventDefault()
    const tokenId = e.dataTransfer.getData("tokenId")
    const npcId = e.dataTransfer.getData("npcId")
    const userId = e.dataTransfer.getData("userId")
    if (tokenId) {
      const token = campaign?.tokens.find((t) => t.id === tokenId)
      if (token && (isMaster || token.ownerId === currentUser?.id)) moveToken(tokenId, { x, y })
    } else if (npcId && campaign?.npcs && isMaster) {
      const npc = campaign.npcs.find((n) => n.id === npcId)
      if (npc)
        addToken({
          ownerId: npc.id,
          type: "npc",
          name: npc.name,
          image: npc.tokenImage || npc.avatarUrl,
          position: { x, y },
        })
    } else if (userId && currentUser?.id === userId) {
      addToken({
        ownerId: currentUser.id,
        type: "player",
        name: currentUser.name,
        image: currentUser.tokenImage || "",
        position: { x, y },
      })
    }
  }

  const getCoordsFromEvent = (e: React.MouseEvent): { x: number; y: number } | null => {
    if (!gridVisualRef.current) return null
    const rect = gridVisualRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return { x, y }
  }

  const getCellFromEvent = (e: React.MouseEvent): { x: number; y: number } | null => {
    if (!gridVisualRef.current) return null
    const rect = gridVisualRef.current.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * gridSize)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * gridSize)
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return null
    return { x, y }
  }

  const handleCellClick = (x: number, y: number) => {
    if (activeTool === "mark" && isMaster) {
      addMarker({ position: { x, y }, color: markerColor })
      return
    }

    if (activeTool === "move" && isMaster) {
      if (!isSelectingArea) {
        // First click: start selection
        setIsSelectingArea(true)
        setSelectionStart({ x, y })
        setSelectionEnd(null)
        setSelectionPreviewEnd({ x, y })
      } else {
        // Second click: end selection
        setIsSelectingArea(false)
        setSelectionEnd({ x, y })
        setSelectionPreviewEnd(null)
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only handle left-clicks

    const pixelCoords = getCoordsFromEvent(e)
    if (!pixelCoords) return

    if (activeTool === "measure") {
      setMeasureStart(pixelCoords)
    } else if (activeTool === "draw" && isMaster) {
      setIsDrawing(true)
      setLines([...lines, { color: drawColor, points: [pixelCoords] }])
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const pixelCoords = getCoordsFromEvent(e)
    if (!pixelCoords) return

    if (activeTool === "measure" && measureStart) {
      setMeasureEnd(pixelCoords)
    } else if (activeTool === "draw" && isDrawing && isMaster) {
      const newLines = [...lines]
      newLines[newLines.length - 1].points.push(pixelCoords)
      setLines(newLines)
    } else if (isSelectingArea) {
      const cellCoords = getCellFromEvent(e)
      if (cellCoords) {
        setSelectionPreviewEnd(cellCoords)
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button !== 0) return

    if (activeTool === "measure") {
      setMeasureStart(null)
      setMeasureEnd(null)
    } else if (activeTool === "draw") {
      setIsDrawing(false)
    }
  }

  const clearSelection = () => {
    setIsSelectingArea(false)
    setSelectionStart(null)
    setSelectionEnd(null)
    setSelectionPreviewEnd(null)
  }

  const handleToolbarAction = (action: () => void) => {
    action()
    clearSelection()
  }

  const calculateDistance = () => {
    if (!measureStart || !measureEnd || !gridVisualRef.current) return 0
    const gridWidthPx = gridVisualRef.current.getBoundingClientRect().width
    const cellSizePx = gridWidthPx / gridSize
    if (cellSizePx === 0) return 0
    const dx = (measureEnd.x - measureStart.x) / cellSizePx
    const dy = (measureEnd.y - measureStart.y) / cellSizePx
    return Math.round(Math.sqrt(dx * dx + dy * dy) * 1.5)
  }

  if (!currentMap) {
    return (
      <div className="flex-grow flex items-center justify-center text-muted-foreground">
        <p>Nenhum mapa selecionado pelo mestre.</p>
      </div>
    )
  }

  const finalSelectedCells = selectionStart && selectionEnd ? getSelectedCells : []
  const previewSelectedCells = isSelectingArea ? getSelectedCells : []
  const selectedCellSet = new Set(
    (isSelectingArea ? previewSelectedCells : finalSelectedCells).map((c) => `${c.x},${c.y}`),
  )
  const fogCellSet = new Set((campaign.fogOfWar || []).map((c) => `${c.x},${c.y}`))

  return (
    <div className="relative flex-grow flex items-center justify-center p-4">
      <div
        ref={gridVisualRef}
        className="aspect-square w-full max-w-[85vh] mx-auto border-2 border-border shadow-lg bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${currentMap.backgroundUrl || "/placeholder.svg"})`,
          cursor:
            activeTool === "measure" || activeTool === "draw"
              ? "crosshair"
              : activeTool === "move" && isMaster
                ? "cell"
                : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Camada 1: Grid Visual e Drop Zones */}
        <div
          className="absolute inset-0 grid z-10"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const y = Math.floor(index / gridSize)
            const x = index % gridSize
            const isSelected = selectedCellSet.has(`${x},${y}`)
            const isFogged = fogCellSet.has(`${x},${y}`)
            return (
              <div
                key={`${x}-${y}`}
                className={cn("w-full h-full relative", {
                  "border border-border/20": !isFogged,
                })}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, x, y)}
                onClick={() => handleCellClick(x, y)}
              >
                {/* Camada de Névoa e Seleção dentro da célula */}
                {isFogged && (
                  <div
                    className={cn("absolute inset-0 w-full h-full", {
                      "bg-black": !isMaster,
                      "bg-black/60": isMaster,
                    })}
                  />
                )}
                {isSelected && <div className="absolute inset-0 w-full h-full bg-primary/30" />}
              </div>
            )
          })}
        </div>

        {/* Camada 2: Tokens */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {campaign?.tokens.map((token) => {
            const isFogged = fogCellSet.has(`${token.position.x},${token.position.y}`)
            if (isFogged && !isMaster) return null
            return (
              <div
                key={token.id}
                className={cn("absolute flex items-center justify-center transition-opacity", {
                  "opacity-50": isFogged && isMaster,
                })}
                style={{
                  top: `${(token.position.y + 0.5) * cellWidthPercent}%`,
                  left: `${(token.position.x + 0.5) * cellWidthPercent}%`,
                  width: "30px",
                  height: "30px",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Token token={token} />
              </div>
            )
          })}
        </div>

        {/* Camada 3: Marcadores */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {campaign?.markers?.map((marker) => {
            const isFogged = fogCellSet.has(`${marker.position.x},${marker.position.y}`)
            if (isFogged && !isMaster) return null
            return (
              <div
                key={marker.id}
                className={cn("absolute flex items-center justify-center transition-opacity", {
                  "opacity-50": isFogged && isMaster,
                })}
                style={{
                  top: `${(marker.position.y + 0.5) * cellWidthPercent}%`,
                  left: `${(marker.position.x + 0.5) * cellWidthPercent}%`,
                  width: "20px",
                  height: "20px",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <MapPin className="w-full h-full" style={{ color: marker.color }} fill={marker.color} />
              </div>
            )
          })}
        </div>

        {/* Camada 4: Desenho Livre */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-40" />

        {/* Camada 5: Ferramenta de Medição */}
        {measureStart && measureEnd && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
            <line
              x1={measureStart.x}
              y1={measureStart.y}
              x2={measureEnd.x}
              y2={measureEnd.y}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="4"
            />
            <rect x={measureEnd.x + 5} y={measureEnd.y - 15} width="50" height="25" fill="hsl(var(--background))" />
            <text x={measureEnd.x + 10} y={measureEnd.y} fill="hsl(var(--foreground))" fontSize="14">
              {calculateDistance()}m
            </text>
          </svg>
        )}

        {/* Camada 6: Barra de Ferramentas de Seleção */}
        {isMaster && finalSelectedCells.length > 0 && (
          <SelectionToolbar
            onHide={() => handleToolbarAction(() => updateFogOfWar(finalSelectedCells, "add"))}
            onReveal={() => handleToolbarAction(() => updateFogOfWar(finalSelectedCells, "reveal"))}
            onRemoveTokens={() => handleToolbarAction(() => removeTokensInArea(finalSelectedCells))}
            onClearSelection={clearSelection}
          />
        )}
      </div>
    </div>
  )
}
