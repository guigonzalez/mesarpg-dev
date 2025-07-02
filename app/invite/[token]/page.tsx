"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/components/auth/AuthProvider"
import { Swords, Eye, EyeOff, UserPlus } from "lucide-react"
import { createClientComponentClient } from "@/lib/supabase"

interface InvitePageProps {
  params: {
    token: string
  }
}

export default function InvitePage({ params }: InvitePageProps) {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteData, setInviteData] = useState<any>(null)
  const [inviteError, setInviteError] = useState("")
  
  const { acceptInvite, error } = useAuthContext()
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Verificar se o convite é válido ao carregar a página
  useEffect(() => {
    const checkInvite = async () => {
      try {
        const { data, error } = await supabase
          .from('invites')
          .select('*')
          .eq('token', params.token)
          .eq('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single()

        if (error || !data) {
          setInviteError('Convite inválido ou expirado')
          return
        }

        setInviteData(data)
      } catch (err) {
        setInviteError('Erro ao verificar convite')
      }
    }

    checkInvite()
  }, [params.token, supabase])

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !password || !confirmPassword) {
      return
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      await acceptInvite(params.token, password, name)
      router.push('/dashboard')
    } catch (err) {
      console.error('Accept invite error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (inviteError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-cover bg-center">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <Card className="w-full max-w-sm z-10 bg-card/80">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Swords className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-serif">Convite Inválido</CardTitle>
            <CardDescription>{inviteError}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => router.push('/login')}
            >
              Ir para Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!inviteData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando convite...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex h-screen w-full items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/placeholder.svg?width=1920&height=1080')" }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="w-full max-w-sm z-10 bg-card/80">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Bem-vindo ao MesaRPG!</CardTitle>
          <CardDescription>
            Você foi convidado para se juntar ao MesaRPG.
            <br />
            <span className="text-sm font-medium">Email: {inviteData.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvite} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Digite a senha novamente"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !name || !password || !confirmPassword}
            >
              {isLoading ? "Criando conta..." : "Aceitar convite"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-xs text-muted-foreground">
            Ao aceitar o convite, você concorda com nossos termos de uso.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
