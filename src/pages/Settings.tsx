
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AuthNavbar from "@/components/AuthNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const { user } = useAuth();
  const [menuName, setMenuName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("menu_name")
        .eq("id", user?.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setMenuName(data.menu_name || "CARDÁPIO Burguers");
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ menu_name: menuName })
        .eq("id", user?.id);
      
      if (error) throw error;
      
      toast.success("Configurações salvas com sucesso");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      
      <div className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Aparência do Cardápio</CardTitle>
            <CardDescription>
              Personalize a aparência do seu cardápio digital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menuName">Nome do Cardápio</Label>
              <Input
                id="menuName"
                placeholder="Nome do seu cardápio"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <Button 
              onClick={saveSettings} 
              disabled={saving || loading}
              className="w-full"
            >
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
