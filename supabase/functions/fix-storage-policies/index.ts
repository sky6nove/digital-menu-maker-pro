
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

    console.log("🔍 Verificando configuração de storage...");

    // Verificar configuração do bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("❌ Erro ao listar buckets:", bucketsError);
      throw bucketsError;
    }

    const productImagesBucket = buckets?.find(b => b.name === 'product-images');
    console.log("📁 Bucket product-images:", productImagesBucket);

    let uploadTest = "failed";
    let testFilePath = "";
    
    try {
      // Testar upload real para verificar se as políticas estão funcionando
      const testFileName = `test-${Date.now()}.txt`;
      const testFile = new File(['test content for storage policies'], testFileName, { type: 'text/plain' });
      
      console.log("🧪 Testando upload com arquivo:", testFileName);
      
      const { data: testUpload, error: testError } = await supabase.storage
        .from('product-images')
        .upload(testFileName, testFile);

      if (testError) {
        console.log("❌ Teste de upload falhou:", testError.message);
        uploadTest = `failed: ${testError.message}`;
      } else if (testUpload) {
        console.log("✅ Teste de upload bem-sucedido:", testUpload);
        uploadTest = "success";
        testFilePath = testUpload.path;
        
        // Limpar arquivo de teste
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove([testUpload.path]);
          
        if (deleteError) {
          console.log("⚠️ Aviso: Não foi possível limpar arquivo de teste:", deleteError.message);
        } else {
          console.log("🧹 Arquivo de teste removido com sucesso");
        }
      }
    } catch (uploadError) {
      console.error("❌ Erro durante teste de upload:", uploadError);
      uploadTest = `error: ${uploadError.message}`;
    }

    // Verificar URL pública
    let publicUrlTest = "not_tested";
    if (testFilePath) {
      try {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(testFilePath);
        
        console.log("🔗 URL pública gerada:", publicUrl);
        publicUrlTest = "success";
      } catch (urlError) {
        console.error("❌ Erro ao gerar URL pública:", urlError);
        publicUrlTest = `failed: ${urlError.message}`;
      }
    }

    const result = {
      success: uploadTest === "success",
      message: uploadTest === "success" 
        ? "Políticas de storage funcionando corretamente" 
        : "Problemas detectados nas políticas de storage",
      details: {
        bucket_exists: !!productImagesBucket,
        bucket_public: productImagesBucket?.public || false,
        bucket_file_size_limit: productImagesBucket?.file_size_limit || null,
        bucket_allowed_mime_types: productImagesBucket?.allowed_mime_types || null,
        upload_test: uploadTest,
        public_url_test: publicUrlTest,
        timestamp: new Date().toISOString()
      }
    };

    console.log("📊 Resultado final:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("💥 Erro na função fix-storage-policies:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: "Falha ao verificar políticas de storage"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
