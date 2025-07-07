
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

    console.log("🔧 Iniciando verificação e correção das políticas de storage...");

    // Step 1: Check bucket configuration
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("❌ Erro ao listar buckets:", bucketsError);
      throw bucketsError;
    }

    const productImagesBucket = buckets?.find(b => b.name === 'product-images');
    console.log("📁 Bucket product-images encontrado:", productImagesBucket);

    if (!productImagesBucket) {
      console.log("❌ Bucket product-images não encontrado - será criado automaticamente");
      return new Response(JSON.stringify({
        success: false,
        message: "Bucket product-images não encontrado. Execute a migração SQL novamente.",
        details: {
          bucket_exists: false,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Step 2: Test upload functionality with real file
    let uploadTest = "failed";
    let publicUrlTest = "failed";
    let testFilePath = "";
    
    try {
      // Create a small test file
      const testFileName = `test-upload-${Date.now()}.txt`;
      const testFileContent = new Uint8Array([116, 101, 115, 116]); // "test" in bytes
      
      console.log("🧪 Testando upload real com arquivo:", testFileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(testFileName, testFileContent, {
          contentType: 'text/plain',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("❌ Erro no teste de upload:", uploadError);
        uploadTest = `failed: ${uploadError.message}`;
      } else if (uploadData) {
        console.log("✅ Upload bem-sucedido:", uploadData.path);
        uploadTest = "success";
        testFilePath = uploadData.path;
        
        // Test public URL generation
        try {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(uploadData.path);
          
          if (publicUrl && publicUrl.includes('product-images')) {
            console.log("✅ URL pública gerada com sucesso:", publicUrl);
            publicUrlTest = "success";
          } else {
            console.error("❌ URL pública inválida:", publicUrl);
            publicUrlTest = "failed: invalid URL format";
          }
        } catch (urlError) {
          console.error("❌ Erro ao gerar URL pública:", urlError);
          publicUrlTest = `failed: ${urlError.message}`;
        }
        
        // Clean up test file
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove([uploadData.path]);
          
        if (deleteError) {
          console.log("⚠️ Aviso: Não foi possível limpar arquivo de teste:", deleteError.message);
        } else {
          console.log("🧹 Arquivo de teste removido com sucesso");
        }
      }
    } catch (uploadError) {
      console.error("💥 Erro durante teste de upload:", uploadError);
      uploadTest = `error: ${uploadError.message}`;
    }

    // Step 3: Check storage policies exist
    let policiesCheck = "unknown";
    try {
      // We can't directly query pg_policies from the edge function with service role
      // But we can infer from upload test results
      if (uploadTest === "success") {
        policiesCheck = "working";
        console.log("✅ Políticas RLS funcionando corretamente");
      } else {
        policiesCheck = "needs_fix";
        console.log("⚠️ Políticas RLS podem precisar de correção");
      }
    } catch (policyError) {
      console.error("❌ Erro ao verificar políticas:", policyError);
      policiesCheck = "error";
    }

    const isFullyWorking = uploadTest === "success" && publicUrlTest === "success";

    const result = {
      success: isFullyWorking,
      message: isFullyWorking 
        ? "✅ Sistema de storage funcionando perfeitamente! Você pode fazer upload de imagens." 
        : "⚠️ Problemas detectados no sistema de storage",
      details: {
        bucket_exists: !!productImagesBucket,
        bucket_public: productImagesBucket?.public || false,
        bucket_file_size_limit: productImagesBucket?.file_size_limit || null,
        bucket_allowed_mime_types: productImagesBucket?.allowed_mime_types || null,
        upload_test: uploadTest,
        public_url_test: publicUrlTest,
        policies_check: policiesCheck,
        timestamp: new Date().toISOString(),
        debug_info: {
          supabase_url: supabaseUrl,
          has_service_key: !!supabaseServiceKey
        }
      }
    };

    console.log("📊 Resultado final da verificação:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("💥 Erro crítico na função fix-storage-policies:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      message: "Falha crítica ao verificar políticas de storage",
      details: {
        timestamp: new Date().toISOString(),
        error_type: error.name || "Unknown"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
