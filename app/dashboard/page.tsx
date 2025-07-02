"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/components/auth/AuthProvider"
import { User, LogOut, Swords, Loader2 } from "lucide-react"

export default function DashboardPageDebug() {
  const { user, loading, signOut } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
          <Swords className="text-primary" />
          MesaRPG
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>
      <main className="p-8">
        <h2 className="text-2xl font-serif mb-6">Dashboard Debug</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuário Logado</CardTitle>
              <CardDescription>Informações do usuário atual</CardDescription>
            </CardHeader>
            <CardContent>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Criado em:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema Funcionando</CardTitle>
              <CardDescription>Autenticação com Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-600">✅ Login realizado com sucesso</p>
              <p className="text-green-600">✅ Sessão ativa</p>
              <p className="text-green-600">✅ Dashboard carregado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
              <CardDescription>O que implementar</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• Carregar campanhas do banco</li>
                <li>• Implementar criação de campanhas</li>
                <li>• Sistema de convites</li>
                <li>• Interface completa</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
