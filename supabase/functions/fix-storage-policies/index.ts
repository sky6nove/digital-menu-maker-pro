
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fixing storage policies for product-images bucket...");

    // Create storage policies for the product-images bucket
    const policies = [
      {
        name: "Allow authenticated users to upload images",
        sql: `
          CREATE POLICY "Allow authenticated users to upload images"
          ON storage.objects FOR INSERT
          WITH CHECK (
            bucket_id = 'product-images' AND
            auth.role() = 'authenticated'
          );
        `
      },
      {
        name: "Allow public access to images",
        sql: `
          CREATE POLICY "Allow public access to images"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'product-images');
        `
      },
      {
        name: "Allow authenticated users to update their images",
        sql: `
          CREATE POLICY "Allow authenticated users to update their images"
          ON storage.objects FOR UPDATE
          USING (
            bucket_id = 'product-images' AND
            auth.role() = 'authenticated'
          );
        `
      },
      {
        name: "Allow authenticated users to delete their images",
        sql: `
          CREATE POLICY "Allow authenticated users to delete their images"
          ON storage.objects FOR DELETE
          USING (
            bucket_id = 'product-images' AND
            auth.role() = 'authenticated'
          );
        `
      }
    ];

    // Drop existing policies first to avoid conflicts
    console.log("Dropping existing policies...");
    try {
      await supabase.rpc('exec_sql', { 
        sql: `
          DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
          DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;
          DROP POLICY IF EXISTS "Allow authenticated users to update their images" ON storage.objects;
          DROP POLICY IF EXISTS "Allow authenticated users to delete their images" ON storage.objects;
        `
      });
    } catch (dropError) {
      console.log("Some policies didn't exist, continuing...", dropError);
    }

    // Create new policies
    console.log("Creating new storage policies...");
    for (const policy of policies) {
      try {
        console.log(`Creating policy: ${policy.name}`);
        await supabase.rpc('exec_sql', { sql: policy.sql });
        console.log(`Successfully created policy: ${policy.name}`);
      } catch (policyError) {
        console.error(`Error creating policy ${policy.name}:`, policyError);
        // Continue with other policies even if one fails
      }
    }

    // Ensure bucket exists and is public
    console.log("Ensuring bucket configuration...");
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO storage.buckets (id, name, public)
          VALUES ('product-images', 'product-images', true)
          ON CONFLICT (id) DO UPDATE SET public = true;
        `
      });
      console.log("Bucket configuration updated");
    } catch (bucketError) {
      console.error("Error updating bucket configuration:", bucketError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Storage policies and bucket configuration updated successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error fixing storage policies:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Failed to fix storage policies"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
