
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
          .from('conversation_memories')
          .select('content')
          .eq('user_id', user.id)
          .ilike('content', `%"key":"${key}"%`)
          .maybeSingle();
          
        if (getError) throw getError;
        
        if (getData) {
          try {
            const parsed = JSON.parse(getData.content);
            result = parsed.value;
          } catch (e) {
            result = null;
          }
        } else {
          result = null;
        }
        break;
        
      case 'set':
        // Content to store
        const content = JSON.stringify({
          key,
          value,
          timestamp: new Date().toISOString()
        });
        
        // Check if key exists
        const { data: existingData, error: existingError } = await supabaseClient
          .from('conversation_memories')
          .select('id')
          .eq('user_id', user.id)
          .ilike('content', `%"key":"${key}"%`)
          .maybeSingle();
          
        if (existingError) throw existingError;
          
        if (existingData) {
          const { error: updateError } = await supabaseClient
            .from('conversation_memories')
            .update({ content })
            .eq('id', existingData.id);
            
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabaseClient
            .from('conversation_memories')
            .insert({
              user_id: user.id,
              content
            });
            
          if (insertError) throw insertError;
        }
        result = { success: true };
        break;
        
      case 'delete':
        const { error: deleteError } = await supabaseClient
          .from('conversation_memories')
          .delete()
          .eq('user_id', user.id)
          .ilike('content', `%"key":"${key}"%`);
          
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
        
      case 'batchGet':
        // For each key, create a condition for the ilike query
        const conditions = keys.map((k: string) => `content.ilike.%"key":"${k}"%`);
        
        const { data: batchData, error: batchError } = await supabaseClient
          .from('conversation_memories')
          .select('content')
          .eq('user_id', user.id)
          .or(conditions.join(','));
          
        if (batchError) throw batchError;
        
        // Process results
        const batchResult: Record<string, any> = {};
        if (batchData) {
          batchData.forEach(item => {
            try {
              const parsed = JSON.parse(item.content);
              if (parsed.key && keys.includes(parsed.key)) {
                batchResult[parsed.key] = parsed.value;
              }
            } catch (e) {
              console.error('Error parsing memory item:', e);
            }
          });
        }
        
        result = batchResult;
        break;
        
      case 'search':
        // Simple text search on content
        const { data: searchData, error: searchError } = await supabaseClient
          .from('conversation_memories')
          .select('content')
          .eq('user_id', user.id)
          .ilike('content', `%${query}%`);
          
        if (searchError) throw searchError;
        
        // Process results
        const searchResult: Record<string, any> = {};
        if (searchData) {
          searchData.forEach(item => {
            try {
              const parsed = JSON.parse(item.content);
              if (parsed.key) {
                searchResult[parsed.key] = parsed.value;
              }
            } catch (e) {
              console.error('Error parsing memory item:', e);
            }
          });
        }
        
        result = searchResult;
        break;
        
      case 'clear':
        const { error: clearError } = await supabaseClient
          .from('conversation_memories')
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
