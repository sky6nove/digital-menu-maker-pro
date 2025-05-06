
// This edge function creates PostgreSQL functions to help with TypeScript issues
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Create RPC functions for product sizes
    const { error: sizesFnError } = await supabaseClient.rpc('create_helper_functions', {})
    
    if (sizesFnError) {
      throw sizesFnError
    }
    
    // Also make sure the storage bucket for product images exists
    const { error: storageError } = await supabaseClient.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    })
    
    // If error is not about bucket already existing, throw it
    if (storageError && !storageError.message.includes('already exists')) {
      throw storageError
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Helper functions and storage bucket created' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
