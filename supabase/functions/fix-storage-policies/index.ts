
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

    console.log("Verificando e corrigindo políticas de storage...");

    // Verificar se as políticas existem
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage');

    if (policiesError) {
      console.log("Erro ao verificar políticas (esperado):", policiesError.message);
    }

    console.log("Políticas encontradas:", policies?.map(p => p.policyname) || []);

    // Verificar configuração do bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Erro ao listar buckets:", bucketsError);
      throw bucketsError;
    }

    const productImagesBucket = buckets?.find(b => b.name === 'product-images');
    console.log("Bucket product-images encontrado:", productImagesBucket);

    // Testar upload para verificar se as políticas estão funcionando
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const { data: testUpload, error: testError } = await supabase.storage
      .from('product-images')
      .upload(`test-${Date.now()}.txt`, testFile);

    let uploadTest = "success";
    if (testError) {
      console.log("Teste de upload falhou:", testError.message);
      uploadTest = testError.message;
    } else {
      console.log("Teste de upload bem-sucedido:", testUpload);
      // Limpar arquivo de teste
      await supabase.storage.from('product-images').remove([testUpload.path]);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Verificação de políticas concluída",
      details: {
        bucket_exists: !!productImagesBucket,
        bucket_public: productImagesBucket?.public || false,
        upload_test: uploadTest,
        policies_found: policies?.length || 0
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Erro na função fix-storage-policies:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Falha ao verificar políticas de storage"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
