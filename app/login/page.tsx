"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/components/auth/AuthProvider"
import { Swords, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  
  const { signIn, resetPassword, error, loading } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      await signIn(email, password)
      router.push(redirectTo)
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return

    try {
      await resetPassword(resetEmail)
      alert('Email de recuperação enviado! Verifique sua caixa de entrada.')
      setShowResetPassword(false)
      setResetEmail("")
    } catch (err) {
      console.error('Reset password error:', err)
    }
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
            <Swords className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-serif">MesaRPG</CardTitle>
          <CardDescription>
            Entre com seus dados para iniciar a aventura.
            <br />
            <span className="text-xs">(Tente `jogador@mesarpg.com` também)</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!showResetPassword ? (
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || loading || !email || !password}
              >
                {isLoading || loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resetEmail">Email para recuperação</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !resetEmail}
              >
                {loading ? "Enviando..." : "Enviar Email de Recuperação"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {!showResetPassword ? (
            <Button
              variant="link"
              className="text-sm"
              onClick={() => setShowResetPassword(true)}
            >
              Esqueci minha senha
            </Button>
          ) : (
            <Button
              variant="link"
              className="text-sm"
              onClick={() => setShowResetPassword(false)}
            >
              Voltar ao login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
