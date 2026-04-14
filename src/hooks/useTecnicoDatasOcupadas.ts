import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export function localDateToDateKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function dateKeyToLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function useTecnicoDatasOcupadas(tecnicoId?: string | null, excludeTrabalhoId?: string) {
  const [datasOcupadas, setDatasOcupadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    let ativo = true;

    async function fetchDatasOcupadas() {
      if (!tecnicoId) {
        setDatasOcupadas(new Set());
        return;
      }

      setDatasOcupadas(new Set());

      let query = supabase
        .from('trabalhos')
        .select('id, data_prevista')
        .eq('tecnico_id', tecnicoId)
        .neq('status', 'CANCELADO');

      if (excludeTrabalhoId) {
        query = query.neq('id', excludeTrabalhoId);
      }

      const { data, error } = await query;

      if (!ativo) return;

      if (error) {
        setDatasOcupadas(new Set());
        return;
      }

      setDatasOcupadas(new Set((data || []).map((trabalho) => trabalho.data_prevista)));
    }

    fetchDatasOcupadas();

    return () => {
      ativo = false;
    };
  }, [tecnicoId, excludeTrabalhoId]);

  const isDateOccupied = useCallback(
    (date: Date) => datasOcupadas.has(localDateToDateKey(date)),
    [datasOcupadas],
  );

  return { datasOcupadas, isDateOccupied };
}