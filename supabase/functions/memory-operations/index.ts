
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the request data
    const { operation, key, value, keys, entries, query } = await req.json();
    
    // Handle different operations
    let result;
    
    switch (operation) {
      case 'get':
        const { data: getData, error: getError } = await supabaseClient
          .from('memory_storage')
          .select('value')
          .eq('user_id', user.id)
          .eq('key', key)
          .single();
          
        if (getError && getError.code !== 'PGRST116') throw getError;
        result = getData?.value || null;
        break;
        
      case 'set':
        // Check if key exists
        const { data: existingData } = await supabaseClient
          .from('memory_storage')
          .select('id')
          .eq('user_id', user.id)
          .eq('key', key)
          .maybeSingle();
          
        if (existingData) {
          const { error: updateError } = await supabaseClient
            .from('memory_storage')
            .update({ value, timestamp: new Date().toISOString() })
            .eq('id', existingData.id);
            
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabaseClient
            .from('memory_storage')
            .insert({
              user_id: user.id,
              key,
              value,
              timestamp: new Date().toISOString()
            });
            
          if (insertError) throw insertError;
        }
        result = { success: true };
        break;
        
      case 'delete':
        const { error: deleteError } = await supabaseClient
          .from('memory_storage')
          .delete()
          .eq('user_id', user.id)
          .eq('key', key);
          
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
        
      case 'batchGet':
        const { data: batchData, error: batchError } = await supabaseClient
          .from('memory_storage')
          .select('key, value')
          .eq('user_id', user.id)
          .in('key', keys);
          
        if (batchError) throw batchError;
        
        // Convert to object
        const batchResult = {};
        batchData.forEach(item => {
          batchResult[item.key] = item.value;
        });
        result = batchResult;
        break;
        
      case 'search':
        // Simple text search on keys
        const { data: searchData, error: searchError } = await supabaseClient
          .from('memory_storage')
          .select('key, value')
          .eq('user_id', user.id)
          .ilike('key', `%${query}%`);
          
        if (searchError) throw searchError;
        
        // Convert to object
        const searchResult = {};
        searchData.forEach(item => {
          searchResult[item.key] = item.value;
        });
        result = searchResult;
        break;
        
      case 'clear':
        const { error: clearError } = await supabaseClient
          .from('memory_storage')
          .delete()
          .eq('user_id', user.id);
          
        if (clearError) throw clearError;
        result = { success: true };
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in memory-operations function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
