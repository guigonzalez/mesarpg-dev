"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMesaStore } from "@/lib/store"
import { Swords } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("mestre@mesarpg.com")
  const [password, setPassword] = useState("123")
  const [error, setError] = useState("")
  const login = useMesaStore((state) => state.login)
  const router = useRouter()

  const handleLogin = () => {
    try {
      setError("")
      login({ email, password })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
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
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
