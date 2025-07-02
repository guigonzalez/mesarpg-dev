"use client"

import { useState, useEffect } from "react"
import type { Campaign } from "@/lib/types"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

export function CampaignSettingsForm({ campaign }: { campaign: Campaign }) {
  const { updateActiveCampaign } = useMesaStore()
  const [name, setName] = useState(campaign.name)
  const [description, setDescription] = useState(campaign.description)

  useEffect(() => {
    setName(campaign.name)
    setDescription(campaign.description)
  }, [campaign])

  const handleSave = () => {
    updateActiveCampaign({ name, description })
    alert("Configurações salvas!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Campanha</CardTitle>
        <CardDescription>Altere o nome e a descrição que aparecem no seu dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campaign-name">Nome da Campanha</Label>
          <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaign-description">Descrição</Label>
          <Textarea
            id="campaign-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </CardContent>
    </Card>
  )
}
