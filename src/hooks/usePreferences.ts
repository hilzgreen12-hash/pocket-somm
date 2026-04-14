import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { useAuth } from './useAuth';
import type { UserPreferences } from '../types/preferences';

export function usePreferences() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['preferences', session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('style_preferences, default_budget')
        .eq('user_id', session!.user.id)
        .single();
      if (error) return null;
      return {
        styleProfiles: data.style_preferences ?? [],
        defaultBudget: data.default_budget ?? 100,
      } as UserPreferences;
    },
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      if (!session) return;
      await supabase.from('profiles').upsert({
        user_id: session.user.id,
        style_preferences: updates.styleProfiles,
        default_budget: updates.defaultBudget,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preferences'] }),
  });

  return {
    preferences,
    updatePreferences: mutation.mutate,
  };
}
