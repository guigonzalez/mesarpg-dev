"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMesaStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, PlusCircle, Swords } from "lucide-react"
import { CreateCampaignModal } from "@/components/dashboard/create-campaign-modal"

export default function DashboardPage() {
  const currentUser = useMesaStore((state) => state.currentUser)
  const campaigns = useMesaStore((state) => state.campaigns)
  const logout = useMesaStore((state) => state.logout)
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login")
    }
  }, [currentUser, router])

  if (!currentUser) {
    return null
  }

  const userCampaigns = campaigns.filter((c) => c.masterId === currentUser.id || c.playerIds.includes(currentUser.id))

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
            <Swords className="text-primary" />
            MesaRPG
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" /> {currentUser.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </header>
        <main className="p-8">
          <h2 className="text-2xl font-serif mb-6">Suas Campanhas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCampaigns.map((campaign) => {
              const isMaster = campaign.masterId === currentUser.id
              return (
                <Card
                  key={campaign.id}
                  className="transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 flex flex-col bg-card"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-serif text-2xl">{campaign.name}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <Badge variant={isMaster ? "destructive" : "secondary"}>{isMaster ? "Mestre" : "Jogador"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Badge variant="outline" className="border-primary text-primary">
                      {campaign.system}
                    </Badge>
                  </CardContent>
                  <CardFooter className="flex items-center gap-2">
                    <Link href={`/campanhas/${campaign.id}`} className="w-full">
                      <Button className="w-full">
                        <Swords className="mr-2 h-4 w-4" />
                        Entrar na Mesa
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
            <Card className="border-dashed flex items-center justify-center min-h-[280px] bg-gradient-to-br from-card to-muted/50 hover:to-muted/80 transition-all">
              <Button
                variant="ghost"
                className="flex flex-col h-full w-full items-center justify-center gap-2 text-muted-foreground"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircle className="h-8 w-8" />
                Criar Nova Campanha
              </Button>
            </Card>
          </div>
        </main>
      </div>
      <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
