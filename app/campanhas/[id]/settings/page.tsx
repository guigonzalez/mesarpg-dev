"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, Users, ClipboardList } from "lucide-react"
import { PlayerManagement } from "@/components/master-view/player-management"
import { SheetTemplateEditor } from "@/components/master-view/sheet-template-editor"
import { CampaignSettingsForm } from "@/components/master-view/campaign-settings-form"

export default function CampaignSettingsPage() {
  const currentUser = useMesaStore((state) => state.currentUser)
  const activeCampaign = useMesaStore((state) => state.activeCampaign)
  const { setActiveCampaign, clearActiveCampaign } = useMesaStore()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  useEffect(() => {
    if (!currentUser) router.replace("/login")
    if (!activeCampaign || activeCampaign.id !== campaignId) {
      setActiveCampaign(campaignId)
    }
    // Apenas mestres podem acessar esta página
    if (activeCampaign && currentUser && activeCampaign.masterId !== currentUser.id) {
      router.replace(`/campanhas/${campaignId}`)
    }
  }, [currentUser, router, campaignId, activeCampaign, setActiveCampaign])

  useEffect(() => {
    return () => clearActiveCampaign()
  }, [clearActiveCampaign])

  if (!currentUser || !activeCampaign || activeCampaign.masterId !== currentUser.id) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/campanhas/${campaignId}`}>
            <Button variant="outline" size="icon" aria-label="Voltar para a Campanha">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Configurações da Campanha</h1>
            <p className="text-sm text-muted-foreground">{activeCampaign.name}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              <Settings className="mr-2 h-4 w-4" /> Geral
            </TabsTrigger>
            <TabsTrigger value="players">
              <Users className="mr-2 h-4 w-4" /> Jogadores
            </TabsTrigger>
            <TabsTrigger value="sheet">
              <ClipboardList className="mr-2 h-4 w-4" /> Template da Ficha
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-6">
            <CampaignSettingsForm campaign={activeCampaign} />
          </TabsContent>
          <TabsContent value="players" className="mt-6">
            <PlayerManagement campaign={activeCampaign} />
          </TabsContent>
          <TabsContent value="sheet" className="mt-6">
            <SheetTemplateEditor campaign={activeCampaign} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
