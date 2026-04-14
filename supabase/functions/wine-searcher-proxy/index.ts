const WINE_SEARCHER_API_KEY = Deno.env.get('WINE_SEARCHER_API_KEY')!;
const CACHE_TTL_DAYS = 7;

// Supabase client for caching
import { createClient } from 'npm:@supabase/supabase-js';
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { wineName, vintage } = await req.json();

    if (!wineName) {
      return new Response(JSON.stringify({ error: 'wineName required' }), { status: 400 });
    }

    const wineKey = `${wineName}_${vintage ?? 'NV'}`;

    // Check cache first
    const { data: cached } = await supabase
      .from('pricing_cache')
      .select('*')
      .eq('wine_key', wineKey)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      const ageDays = age / (1000 * 60 * 60 * 24);
      if (ageDays < CACHE_TTL_DAYS) {
        return new Response(
          JSON.stringify({
            averageMarketPrice: cached.market_price_avg,
            minPrice: cached.market_price_min,
            maxPrice: cached.market_price_max,
            criticScore: cached.critic_score,
            currency: cached.currency,
            source: 'wine-searcher',
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Call Wine-Searcher API
    const vintageParam = vintage ?? 'NV';
    const url = `https://www.wine-searcher.com/api/wine-check?api_key=${WINE_SEARCHER_API_KEY}&winename=${encodeURIComponent(wineName)}&vintage=${vintageParam}&format=json`;

    const wsResponse = await fetch(url);
    if (!wsResponse.ok) {
      throw new Error(`Wine-Searcher returned ${wsResponse.status}`);
    }

    const wsData = await wsResponse.json();

    // Normalise response (structure may vary — adjust once you have API access)
    const pricing = {
      averageMarketPrice: wsData.price_avg ?? null,
      minPrice: wsData.price_min ?? null,
      maxPrice: wsData.price_max ?? null,
      criticScore: wsData.critic_score ?? null,
      currency: wsData.currency ?? 'GBP',
      source: 'wine-searcher' as const,
    };

    // Write to cache
    await supabase.from('pricing_cache').upsert({
      wine_key: wineKey,
      market_price_avg: pricing.averageMarketPrice,
      market_price_min: pricing.minPrice,
      market_price_max: pricing.maxPrice,
      critic_score: pricing.criticScore,
      currency: pricing.currency,
      fetched_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify(pricing), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Wine-Searcher proxy error:', err);
    return new Response(
      JSON.stringify({ source: 'unavailable', averageMarketPrice: null, minPrice: null, maxPrice: null, criticScore: null, currency: 'GBP' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
