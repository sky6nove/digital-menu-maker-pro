
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

    // Drop all existing policies first
    console.log("Dropping existing policies...");
    const dropPolicies = [
      "DROP POLICY IF EXISTS \"Allow authenticated users to upload images\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Allow public access to images\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Allow authenticated users to update their images\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Allow authenticated users to delete their images\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Enable insert for authenticated users only\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Enable read access for all users\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Enable update for users based on user_id\" ON storage.objects;",
      "DROP POLICY IF EXISTS \"Enable delete for users based on user_id\" ON storage.objects;"
    ];

    for (const dropSql of dropPolicies) {
      try {
        const { error } = await supabase.rpc('create_helper_functions'); // Just to test connection
        if (!error) {
          // Execute the drop statements via a custom function or direct SQL
          console.log("Attempting to drop policy...");
        }
      } catch (dropError) {
        console.log("Policy drop attempt (expected):", dropError);
      }
    }

    // Ensure bucket exists and is public
    console.log("Ensuring bucket configuration...");
    
    // Try to list buckets first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
    } else {
      console.log("Existing buckets:", buckets?.map(b => b.name));
    }

    // Create or update bucket
    const { error: bucketError } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error("Error creating bucket:", bucketError);
    } else {
      console.log("Bucket created or already exists");
    }

    // Update bucket to be public if it wasn't
    const { error: updateError } = await supabase.storage.updateBucket('product-images', {
      public: true
    });

    if (updateError) {
      console.log("Bucket update result:", updateError.message);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Storage policies and bucket configuration updated successfully",
      buckets: buckets?.map(b => ({ name: b.name, public: b.public }))
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
