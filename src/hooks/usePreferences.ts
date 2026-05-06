import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { useAuth } from './useAuth';
import type { UserPreferences } from '../types/preferences';

export function usePreferences() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading: prefsLoading, isError: prefsError } = useQuery({
    queryKey: ['preferences', session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('style_preferences, default_budget, default_wine_types, favourite_regions, favourite_grapes, disliked_regions, disliked_grapes, dietary_needs, allergy_risks, specific_concerns, regional_preferences, nutritional_preferences')
        .eq('user_id', session!.user.id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null; // no profile row yet — new user
        throw new Error(error.message); // real error — surface to caller
      }
      return {
        wineTypes: data.default_wine_types ?? [],
        styleProfiles: data.style_preferences ?? [],
        defaultBudget: data.default_budget ?? null,
        favouriteRegions: data.favourite_regions ?? [],
        favouriteGrapes: data.favourite_grapes ?? [],
        dislikedRegions: data.disliked_regions ?? [],
        dislikedGrapes: data.disliked_grapes ?? [],
        dietaryNeeds: data.dietary_needs ?? [],
        allergyRisks: data.allergy_risks ?? [],
        specificConcerns: data.specific_concerns ?? '',
        regionalPreferences: data.regional_preferences ?? [],
        nutritionalPreferences: data.nutritional_preferences ?? [],
      } as UserPreferences;
    },
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      if (!session) return;
      const { error } = await supabase.from('profiles').upsert({
        user_id: session.user.id,
        ...(updates.wineTypes !== undefined && { default_wine_types: updates.wineTypes }),
        ...(updates.styleProfiles !== undefined && { style_preferences: updates.styleProfiles }),
        ...(updates.defaultBudget !== undefined && { default_budget: updates.defaultBudget }),
        ...(updates.favouriteRegions !== undefined && { favourite_regions: updates.favouriteRegions }),
        ...(updates.favouriteGrapes !== undefined && { favourite_grapes: updates.favouriteGrapes }),
        ...(updates.dislikedRegions !== undefined && { disliked_regions: updates.dislikedRegions }),
        ...(updates.dislikedGrapes !== undefined && { disliked_grapes: updates.dislikedGrapes }),
        ...(updates.dietaryNeeds !== undefined && { dietary_needs: updates.dietaryNeeds }),
        ...(updates.allergyRisks !== undefined && { allergy_risks: updates.allergyRisks }),
        ...(updates.specificConcerns !== undefined && { specific_concerns: updates.specificConcerns }),
        ...(updates.regionalPreferences !== undefined && { regional_preferences: updates.regionalPreferences }),
        ...(updates.nutritionalPreferences !== undefined && { nutritional_preferences: updates.nutritionalPreferences }),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preferences'] }),
    onError: (err) => console.error('[Preferences] Save error:', err),
  });

  return {
    preferences,
    updatePreferences: mutation.mutate,
    updatePreferencesAsync: mutation.mutateAsync,
    isSaving: mutation.isPending,
    prefsLoading,
    prefsError,
  };
}
