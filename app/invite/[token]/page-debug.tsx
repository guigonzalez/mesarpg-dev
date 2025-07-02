"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/components/auth/AuthProvider"
import { Swords, Eye, EyeOff, UserPlus } from "lucide-react"
import { createClientComponentClient } from '@/lib/supabase-browser'

interface InvitePageProps {
  params: {
    token: string
  }
}

export default function InvitePageDebug({ params }: InvitePageProps) {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteData, setInviteData] = useState<any>(null)
  const [inviteError, setInviteError] = useState("")
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  
  const { acceptInvite, error } = useAuthContext()
  const router = useRouter()
  
  // Create Supabase client for checking invite
  const supabase = createClientComponentClient()

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
    console.log('DEBUG:', info)
  }

  // Verificar se o convite é válido ao carregar a página
  useEffect(() => {
    const checkInvite = async () => {
      addDebugInfo(`Verificando convite com token: ${params.token}`)
      
      try {
        // Primeiro, tentar buscar sem filtros para ver se o token existe
        addDebugInfo('Buscando convite sem filtros...')
        const { data: allInvites, error: allError } = await supabase
          .from('invites')
          .select('*')
          .eq('token', params.token)

        addDebugInfo(`Resultado busca sem filtros: ${allInvites?.length || 0} convites encontrados`)
        if (allError) {
          addDebugInfo(`Erro na busca sem filtros: ${allError.message}`)
        }

        if (allInvites && allInvites.length > 0) {
          const invite = allInvites[0]
          addDebugInfo(`Convite encontrado: email=${invite.email}, expires_at=${invite.expires_at}, used_at=${invite.used_at}`)
          
          // Verificar manualmente se está válido
          const now = new Date()
          const expiresAt = new Date(invite.expires_at)
          const isNotExpired = expiresAt > now
          const isNotUsed = !invite.used_at
          
          addDebugInfo(`Validação manual: não expirado=${isNotExpired}, não usado=${isNotUsed}`)
          addDebugInfo(`Data atual: ${now.toISOString()}, Expira em: ${expiresAt.toISOString()}`)
          
          if (isNotExpired && isNotUsed) {
            setInviteData(invite)
            addDebugInfo('Convite válido!')
            return
          } else {
            if (!isNotExpired) {
              setInviteError('Convite expirado')
              addDebugInfo('Convite expirado')
            } else {
              setInviteError('Convite já foi usado')
              addDebugInfo('Convite já foi usado')
            }
            return
          }
        }

        // Se chegou aqui, não encontrou o convite
        addDebugInfo('Convite não encontrado')
        setInviteError('Convite não encontrado')

      } catch (err) {
        addDebugInfo(`Erro na verificação: ${err}`)
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
    addDebugInfo('Tentando aceitar convite...')
    
    try {
      await acceptInvite(params.token, password, name)
      addDebugInfo('Convite aceito com sucesso!')
      router.push('/dashboard')
    } catch (err) {
      addDebugInfo(`Erro ao aceitar convite: ${err}`)
      console.error('Accept invite error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (inviteError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-cover bg-center">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <Card className="w-full max-w-lg z-10 bg-card/80">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Swords className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-serif">Convite Inválido</CardTitle>
            <CardDescription>{inviteError}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
              <strong>Debug Info:</strong>
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </CardContent>
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
          <div className="text-xs mt-4 bg-gray-100 p-3 rounded max-h-40 overflow-y-auto max-w-md">
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
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
