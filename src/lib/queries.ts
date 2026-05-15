import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type TrabalhoWithRelations = Tables<'trabalhos'> & {
  clientes: Tables<'clientes'> | null;
  tecnico_profile: Tables<'profiles'> | null;
  vendedor_profile: Tables<'profiles'> | null;
};

async function attachProfiles(trabalhos: Tables<'trabalhos'>[]): Promise<TrabalhoWithRelations[]> {
  const userIds = [...new Set([
    ...trabalhos.map(t => t.tecnico_id).filter(Boolean) as string[],
    ...trabalhos.map(t => t.vendedor_id).filter(Boolean) as string[],
  ])];
  let profileMap = new Map<string, Tables<'profiles'>>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', userIds);
    profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
  }
  return trabalhos.map(t => ({
    ...(t as any),
    tecnico_profile: t.tecnico_id ? profileMap.get(t.tecnico_id) || null : null,
    vendedor_profile: t.vendedor_id ? profileMap.get(t.vendedor_id) || null : null,
  }));
}

export async function fetchTrabalhosWithRelations(filters?: { status?: string; tecnicoId?: string }): Promise<TrabalhoWithRelations[]> {
  let query = supabase.from('trabalhos').select('*, clientes(*)').order('created_at', { ascending: false });
  if (filters?.status) query = query.eq('status', filters.status as any);
  if (filters?.tecnicoId) query = query.eq('tecnico_id', filters.tecnicoId);
  const { data: trabalhos } = await query;
  if (!trabalhos || trabalhos.length === 0) return [];
  return attachProfiles(trabalhos as any);
}

export async function fetchTrabalhoById(id: string): Promise<TrabalhoWithRelations | null> {
  const { data } = await supabase.from('trabalhos').select('*, clientes(*)').eq('id', id).single();
  if (!data) return null;
  const [withProfiles] = await attachProfiles([data as any]);
  return withProfiles;
}
