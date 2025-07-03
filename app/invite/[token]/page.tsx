"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { Swords, Eye, EyeOff, UserPlus, LogIn, CheckCircle } from "lucide-react"
import { createClientComponentClient } from '@/lib/supabase-browser'

interface InvitePageProps {
  params: Promise<{
    token: string
  }>
}

type InviteState = 'loading' | 'invalid' | 'signup' | 'login' | 'auto-join' | 'success' | 'already-member'

export default function InvitePage({ params }: InvitePageProps) {
  const [token, setToken] = useState<string>("")
  const [state, setState] = useState<InviteState>('loading')
  const [inviteData, setInviteData] = useState<any>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const { user, signIn } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Resolver params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setToken(resolvedParams.token)
    }
    resolveParams()
  }, [params])

  // Verificar convite e determinar estado
  useEffect(() => {
    if (!token) return

    const checkInviteAndUserState = async () => {
      console.log('🎮 InvitePage - Verificando convite e estado do usuário')
      
      try {
        // 1. Verificar se o convite é válido
        const { data: invites, error: inviteError } = await supabase
          .from('invites')
          .select('*')
          .eq('token', token)

        if (inviteError || !invites || invites.length === 0) {
          console.log('🎮 InvitePage - Convite não encontrado')
          setState('invalid')
          setError('Convite não encontrado')
          return
        }

        const invite = invites[0]
        console.log('🎮 InvitePage - Convite encontrado:', invite.email)

        // Verificar se o convite está válido
        const now = new Date()
        const expiresAt = new Date(invite.expires_at)
        
        if (expiresAt <= now) {
          console.log('🎮 InvitePage - Convite expirado')
          setState('invalid')
          setError('Convite expirado')
          return
        }

        if (invite.used_at) {
          console.log('🎮 InvitePage - Convite já foi usado')
          setState('invalid')
          setError('Convite já foi usado')
          return
        }

        setInviteData(invite)
        setEmail(invite.email)

        // 2. Verificar se o usuário já está na campanha
        if (invite.campaign_id) {
          const { data: existingPlayer } = await supabase
            .from('campaign_players')
            .select('id')
            .eq('campaign_id', invite.campaign_id)
            .eq('user_id', user?.id || '')
            .eq('status', 'active')
            .single()

          if (existingPlayer) {
            console.log('🎮 InvitePage - Usuário já está na campanha')
            setState('already-member')
            return
          }
        }

        // 3. Determinar estado baseado no usuário
        if (user) {
          // Usuário logado - auto-join
          console.log('🎮 InvitePage - Usuário logado, auto-join')
          setState('auto-join')
        } else {
          // Usuário não logado - verificar se tem conta
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', invite.email)
            .single()

          if (existingUser) {
            console.log('🎮 InvitePage - Usuário tem conta, mostrar login')
            setState('login')
          } else {
            console.log('🎮 InvitePage - Usuário não tem conta, mostrar signup')
            setState('signup')
          }
        }

      } catch (err) {
        console.error('🎮 InvitePage - Erro:', err)
        setState('invalid')
        setError('Erro ao verificar convite')
      }
    }

    checkInviteAndUserState()
  }, [token, user, supabase])

  // Auto-join para usuário logado
  const handleAutoJoin = async () => {
    if (!user || !inviteData) return

    setIsLoading(true)
    console.log('🎮 InvitePage - Executando auto-join')

    try {
      // Adicionar à campanha
      if (inviteData.campaign_id) {
        const { error: campaignPlayerError } = await supabase
          .from('campaign_players')
          .insert({
            campaign_id: inviteData.campaign_id,
            user_id: user.id,
            joined_at: new Date().toISOString(),
            status: 'active'
          })

        if (campaignPlayerError) {
          throw campaignPlayerError
        }
      }

      // Marcar convite como usado
      const { error: updateError } = await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', inviteData.id)

      if (updateError) {
        console.error('Erro ao marcar convite como usado:', updateError)
      }

      console.log('🎮 InvitePage - Auto-join concluído com sucesso')
      setState('success')
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err) {
      console.error('🎮 InvitePage - Erro no auto-join:', err)
      setError(err instanceof Error ? err.message : 'Erro ao entrar na campanha')
    } finally {
      setIsLoading(false)
    }
  }

  // Login para usuário existente
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    setIsLoading(true)
    console.log('🎮 InvitePage - Executando login')

    try {
      await signIn(email, password)
      console.log('🎮 InvitePage - Login realizado, aguardando auto-join')
      // O useEffect vai detectar o usuário logado e fazer auto-join
    } catch (err) {
      console.error('🎮 InvitePage - Erro no login:', err)
      setError(err instanceof Error ? err.message : 'Erro no login')
      setIsLoading(false)
    }
  }

  // Signup para novo usuário
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !password || !confirmPassword) return

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)
    console.log('🎮 InvitePage - Executando signup')

    try {
      // Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password,
        options: {
          data: { name }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          name,
          invited_by: inviteData.invited_by
        })

      if (profileError) throw profileError

      // Adicionar à campanha se especificada
      if (inviteData.campaign_id) {
        const { error: campaignPlayerError } = await supabase
          .from('campaign_players')
          .insert({
            campaign_id: inviteData.campaign_id,
            user_id: authData.user.id,
            joined_at: new Date().toISOString(),
            status: 'active'
          })

        if (campaignPlayerError) throw campaignPlayerError
      }

      // Marcar convite como usado
      const { error: updateError } = await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', inviteData.id)

      if (updateError) {
        console.error('Erro ao marcar convite como usado:', updateError)
      }

      console.log('🎮 InvitePage - Signup concluído com sucesso')
      setState('success')
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err) {
      console.error('🎮 InvitePage - Erro no signup:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  // Renderização baseada no estado
  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <Card className="w-full max-w-sm z-10 bg-card/80">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Verificando convite...</p>
              </div>
            </CardContent>
          </Card>
        )

      case 'invalid':
        return (
          <Card className="w-full max-w-sm z-10 bg-card/80">
            <CardHeader className="text-center">
              <Swords className="h-10 w-10 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl font-serif">Convite Inválido</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push('/login')}>
                Ir para Login
              </Button>
            </CardFooter>
          </Card>
        )

      case 'already-member':
        return (
          <Card className="w-full max-w-sm z-10 bg-card/80">
            <CardHeader className="text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-serif">Já é membro!</CardTitle>
              <CardDescription>
                Você já faz parte desta campanha.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push('/dashboard')}>
                Ir para Dashboard
              </Button>
            </CardFooter>
          </Card>
        )

      case 'auto-join':
        return (
          <Card className="w-full max-w-sm z-10 bg-card/80">
            <CardHeader className="text-center">
              <UserPlus className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl font-serif">Entrar na Campanha</CardTitle>
              <CardDescription>
                Você foi convidado para se juntar a uma campanha.
                <br />
                <span className="text-sm font-medium">Email: {inviteData?.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && <p className="text-sm text-destructive mb-4">{error}</p>}
              <Button 
                className="w-full" 
                onClick={handleAutoJoin}
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar na Campanha"}
              </Button>
            </CardContent>
          </Card>
        )

      case 'login':
        return (
          <Card className="w-full max-w-sm z-10 bg-card/80">
            <CardHeader className="text-center">
              <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl font-serif">Fazer Login</CardTitle>
              <CardDescription>
                Você já tem uma conta. Faça login para aceitar o convite.
                <br />
                <span className="text-sm font-medium">Email: {email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading || !password}>
                  {isLoading ? "Fazendo login..." : "Fazer Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )

      case 'signup':
        return (
          <Card className="w-full max-w-sm z-10 bg-card/80">
            <CardHeader className="text-center">
              <UserPlus className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl font-serif">Criar Conta</CardTitle>
              <CardDescription>
                Você foi convidado para se juntar ao MesaRPG.
                <br />
                <span className="text-sm font-medium">Email: {email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="grid gap-4">
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !name || !password || !confirmPassword}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )

      case 'success':
        return (
          <Card className="w-full max-w-sm z-10 bg-card/80">
            <CardHeader className="text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-serif">Sucesso!</CardTitle>
              <CardDescription>
                Você foi adicionado à campanha com sucesso.
                <br />
                Redirecionando para o dashboard...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      {renderContent()}
    </div>
  )
}
