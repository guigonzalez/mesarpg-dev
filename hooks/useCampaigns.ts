'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/database.types'
import { useAuth } from './useAuth'

type Campaign = Database['public']['Tables']['campaigns']['Row']

interface CampaignsState {
  campaigns: Campaign[]
  loading: boolean
  error: string | null
}

interface CampaignsActions {
  createCampaign: (name: string, description: string, system: string) => Promise<Campaign>
  refreshCampaigns: () => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
}

export function useCampaigns(): CampaignsState & CampaignsActions {
  const [state, setState] = useState<CampaignsState>({
    campaigns: [],
    loading: true,
    error: null
  })

  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // Buscar campanhas do usuário (versão simplificada)
  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, campaigns: [], loading: false }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      console.log('Buscando campanhas para usuário:', user.id)
      
      // Buscar apenas campanhas onde o usuário é mestre (query simples)
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('master_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar campanhas:', error)
        throw error
      }

      console.log('Campanhas encontradas:', campaigns)

      setState(prev => ({
        ...prev,
        campaigns: campaigns || [],
        loading: false
      }))

    } catch (error) {
      console.error('Erro no fetchCampaigns:', error)
      const message = error instanceof Error ? error.message : 'Erro ao carregar campanhas'
      setState(prev => ({
        ...prev,
        error: message,
        loading: false
      }))
    }
  }, [user?.id]) // Só depende do user.id, não do objeto user completo nem do supabase

  // Criar nova campanha
  const createCampaign = useCallback(async (name: string, description: string, system: string): Promise<Campaign> => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name,
          description,
          system: system as Database['public']['Enums']['campaign_system'],
          master_id: user.id,
          sheet_template: {
            name: system,
            fields: system === 'D&D 5e' ? [
              { name: 'Força', type: 'number' },
              { name: 'Destreza', type: 'number' },
              { name: 'Constituição', type: 'number' },
              { name: 'Inteligência', type: 'number' },
              { name: 'Sabedoria', type: 'number' },
              { name: 'Carisma', type: 'number' },
              { name: 'Classe', type: 'text' },
              { name: 'Nível', type: 'number' },
              { name: 'Pontos de Vida', type: 'number' }
            ] : []
          }
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar lista local
      setState(prev => ({
        ...prev,
        campaigns: [data, ...prev.campaigns],
        loading: false
      }))

      return data

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar campanha'
      setState(prev => ({
        ...prev,
        error: message,
        loading: false
      }))
      throw error
    }
  }, [user, supabase])

  // Deletar campanha
  const deleteCampaign = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('master_id', user.id) // Só o mestre pode deletar

      if (error) throw error

      // Remover da lista local
      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.filter(c => c.id !== id),
        loading: false
      }))

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar campanha'
      setState(prev => ({
        ...prev,
        error: message,
        loading: false
      }))
      throw error
    }
  }, [user, supabase])

  // Atualizar campanhas
  const refreshCampaigns = useCallback(async () => {
    await fetchCampaigns()
  }, [fetchCampaigns])

  // Carregar campanhas quando o usuário mudar
  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  return {
    ...state,
    createCampaign,
    refreshCampaigns,
    deleteCampaign
  }
}
