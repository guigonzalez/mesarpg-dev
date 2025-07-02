'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClientComponentClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  acceptInvite: (token: string, password: string, name: string) => Promise<void>
  sendInvite: (email: string) => Promise<void>
  canCreateCampaign: () => boolean
  updateUserRole: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  const supabase = createClientComponentClient()

  // Função para buscar o perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      return null
    }
  }, [supabase])

  // Função para atualizar o estado do usuário
  const updateAuthState = useCallback(async (user: User | null) => {
    if (user) {
      const profile = await fetchUserProfile(user.id)
      setState(prev => ({
        ...prev,
        user,
        profile,
        loading: false,
        error: null
      }))
    } else {
      setState(prev => ({
        ...prev,
        user: null,
        profile: null,
        loading: false,
        error: null
      }))
    }
  }, [fetchUserProfile])

  // Inicializar autenticação
  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session?.user ?? null)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        updateAuthState(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, updateAuthState])

  // Função de login
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }))
        throw error
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no login'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: message 
      }))
      throw error
    }
  }, [supabase.auth])

  // Função de logout
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }))
        throw error
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no logout'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: message 
      }))
      throw error
    }
  }, [supabase.auth])

  // Função de reset de senha
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`
      })

      if (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }))
        throw error
      }

      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar email de recuperação'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: message 
      }))
      throw error
    }
  }, [supabase.auth])

  // Função para aceitar convite
  const acceptInvite = useCallback(async (token: string, password: string, name: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Verificar se o convite é válido
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token)
        .eq('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (inviteError || !invite) {
        throw new Error('Convite inválido ou expirado')
      }

      // Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário')
      }

      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: invite.email,
          name,
          invited_by: invite.invited_by
        })

      if (profileError) {
        throw profileError
      }

      // Marcar convite como usado
      const { error: updateError } = await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id)

      if (updateError) {
        console.error('Error updating invite:', updateError)
      }

      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao aceitar convite'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: message 
      }))
      throw error
    }
  }, [supabase])

  // Função para enviar convite
  const sendInvite = useCallback(async (email: string) => {
    if (!state.user) {
      throw new Error('Usuário não autenticado')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Verificar se o email já está cadastrado
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        throw new Error('Este email já possui uma conta')
      }

      // Verificar se já existe um convite pendente
      const { data: existingInvite } = await supabase
        .from('invites')
        .select('id')
        .eq('email', email)
        .eq('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (existingInvite) {
        throw new Error('Já existe um convite pendente para este email')
      }

      // Gerar token único
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias

      // Criar convite
      const { error: inviteError } = await supabase
        .from('invites')
        .insert({
          email,
          token,
          invited_by: state.user.id,
          expires_at: expiresAt.toISOString()
        })

      if (inviteError) {
        throw inviteError
      }

      // TODO: Enviar email de convite (implementar depois)
      console.log(`Convite criado para ${email} com token: ${token}`)
      console.log(`Link: ${window.location.origin}/invite/${token}`)

      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar convite'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: message 
      }))
      throw error
    }
  }, [state.user, supabase])

  // Verificar se pode criar campanha
  const canCreateCampaign = useCallback(() => {
    if (!state.profile) return false
    return (state.profile.campaigns_as_master || 0) < 2
  }, [state.profile])

  // Atualizar role do usuário
  const updateUserRole = useCallback(async () => {
    if (!state.user || !state.profile) return

    try {
      // Contar campanhas como mestre
      const { count: masterCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('master_id', state.user.id)

      // Contar campanhas como jogador
      const { count: playerCount } = await supabase
        .from('campaign_players')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', state.user.id)
        .eq('status', 'active')

      // Determinar role
      const newRole = (masterCount || 0) > 0 ? 'master' : 'player'

      // Atualizar perfil
      const { error } = await supabase
        .from('users')
        .update({
          role: newRole,
          campaigns_as_master: masterCount || 0,
          campaigns_as_player: playerCount || 0
        })
        .eq('id', state.user.id)

      if (error) {
        throw error
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          role: newRole as 'master' | 'player',
          campaigns_as_master: masterCount || 0,
          campaigns_as_player: playerCount || 0
        } : null
      }))
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }, [state.user, state.profile, supabase])

  // Atualizar perfil
  const refreshProfile = useCallback(async () => {
    if (!state.user) return

    const profile = await fetchUserProfile(state.user.id)
    setState(prev => ({ ...prev, profile }))
  }, [state.user, fetchUserProfile])

  return {
    ...state,
    signIn,
    signOut,
    resetPassword,
    acceptInvite,
    sendInvite,
    canCreateCampaign,
    updateUserRole,
    refreshProfile
  }
}
