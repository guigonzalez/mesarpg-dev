"use client"

import { useState, useEffect } from "react"
import type { MapData } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"

interface MapSettingsPopoverProps {
  map: MapData
}

export function MapSettingsPopover({ map }: MapSettingsPopoverProps) {
  const { updateMap } = useMesaStore()
  const [size, setSize] = useState(map.gridSize)
  const [backgroundUrl, setBackgroundUrl] = useState(map.backgroundUrl)

  useEffect(() => {
    setSize(map.gridSize)
    setBackgroundUrl(map.backgroundUrl)
  }, [map])

  const handleSave = () => {
    const updatedMap = { ...map, gridSize: size, backgroundUrl: backgroundUrl }
    updateMap(updatedMap)
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Ajustes do Mapa</h4>
        <p className="text-sm text-muted-foreground">Altere o cenário em tempo real.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="grid-size">Tamanho do Grid</Label>
        <Input
          id="grid-size"
          type="number"
          min="1"
          value={size}
          onChange={(e) => setSize(Number(e.target.value) || 1)}
          className="col-span-2 h-8"
        />
      </div>
      <div className="grid gap-2">
        <Label>Imagem de Fundo</Label>
        <div className="h-32">
          <ImageUpload value={backgroundUrl} onChange={setBackgroundUrl} />
        </div>
      </div>
      <Button onClick={handleSave} size="sm" className="w-full">
        Salvar Alterações
      </Button>
    </div>
  )
}
