// supabase/functions/_shared/auth.ts
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Reusable function to get the authenticated user
export const authenticateUser = async (supabase: SupabaseClient) => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Auth error in getUser:', error.message);
        return { user: null, error: 'Failed to authenticate user' };
    }
    if (!user) {
        return { user: null, error: 'Unauthorized: No user found' };
    }
    return { user, error: null };
};

// Helper to create Supabase client with auth context (can be used by functions)
export const createSupabaseClientWithAuth = (req: Request): SupabaseClient => {
    const authHeader = req.headers.get('Authorization');
    const headers = authHeader ? { Authorization: authHeader } : {}; // Only add header if present
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers } } // Pass potentially empty headers object
    );
};