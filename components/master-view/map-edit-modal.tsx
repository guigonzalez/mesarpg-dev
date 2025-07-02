"use client"

import { useState, useEffect } from "react"
import type { MapData } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ImageUpload } from "@/components/ui/image-upload"

interface MapEditModalProps {
  isOpen: boolean
  onClose: () => void
  mapToEdit: MapData | null
}

export function MapEditModal({ isOpen, onClose, mapToEdit }: MapEditModalProps) {
  const { addMap, updateMap } = useMesaStore()
  const [name, setName] = useState("")
  const [backgroundUrl, setBackgroundUrl] = useState("")
  const [gridSize, setGridSize] = useState(20)
  const [scale, setScale] = useState(50)

  useEffect(() => {
    if (isOpen && mapToEdit) {
      setName(mapToEdit.name || "")
      setBackgroundUrl(mapToEdit.backgroundUrl || "")
      setGridSize(mapToEdit.gridSize ?? 20)
      setScale(mapToEdit.scale ?? 50)
    } else {
      setName("")
      setBackgroundUrl("")
      setGridSize(20)
      setScale(50)
    }
  }, [isOpen, mapToEdit])

  const handleSave = () => {
    const mapData = { name, backgroundUrl, gridSize, scale }
    if (mapToEdit) {
      updateMap({ ...mapData, id: mapToEdit.id })
    } else {
      addMap(mapData)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mapToEdit ? "Editar Mapa" : "Adicionar Novo Mapa"}</DialogTitle>
          <DialogDescription>Defina a imagem de fundo e as propriedades do grid.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Coluna de Preview */}
          <div className="space-y-2">
            <Label>Preview do Mapa</Label>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <ImageUpload value={backgroundUrl} onChange={setBackgroundUrl} />
              {backgroundUrl && (
                <div
                  className="absolute inset-0 grid pointer-events-none"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                  }}
                >
                  {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                    <div key={i} className="border border-white/30" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coluna de Configurações */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="map-name">Nome do Mapa</Label>
              <Input
                id="map-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Taverna do Dragão Sonolento"
              />
            </div>
            <div>
              <Label htmlFor="grid-size">Tamanho do Grid (e.g., 20 para 20x20)</Label>
              <Input
                id="grid-size"
                type="number"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value) || 1)} // Evita 0
                min="1"
              />
            </div>
            <div>
              <Label>Escala Visual ({scale}px por célula)</Label>
              <Slider value={[scale]} min={10} max={150} step={5} onValueChange={(value) => setScale(value[0])} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
