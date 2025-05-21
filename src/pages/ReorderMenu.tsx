import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReorderLayout from "@/components/reorderMenu/ReorderLayout";
import { useReorderMenu } from "@/hooks/reorderMenu/useReorderMenu";

const ReorderMenu = () => {
  const navigate = useNavigate();
  const {
    loading,
    saving,
    categories,
    filteredProducts,
    productGroups,
    groupComplements,
    activeCategory,
    activeProduct,
    activeGroup,
    loadingComplements,
    activeCategoryName,
    activeProductName,
    activeGroupName,
    handleCategoryMove,
    handleProductMove,
    handleGroupMove,
    handleComplementMove,
    handleCategorySelect,
    handleProductSelect,
    handleGroupSelect,
    handleSave
  } = useReorderMenu();

  // Handle close
  const handleClose = () => {
    navigate('/dashboard');
  };

  // Handle save and navigate
  const handleSaveAndClose = async () => {
    const success = await handleSave();
    if (success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      
      <main className="flex-1 container py-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle>Reordenar cardápio</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-6">
              Para alterar a ordem dos itens ou categorias do seu cardápio, clique na opção desejada, segure e arraste.
            </p>
            
            <ReorderLayout 
              categories={categories}
              filteredProducts={filteredProducts}
              productGroups={productGroups}
              groupComplements={groupComplements}
              activeCategory={activeCategory}
              activeProduct={activeProduct}
              activeGroup={activeGroup}
              activeCategoryName={activeCategoryName}
              activeProductName={activeProductName}
              activeGroupName={activeGroupName}
              loadingComplements={loadingComplements}
              handleCategorySelect={handleCategorySelect}
              handleProductSelect={handleProductSelect}
              handleGroupSelect={handleGroupSelect}
              handleCategoryMove={handleCategoryMove}
              handleProductMove={handleProductMove}
              handleGroupMove={handleGroupMove}
              handleComplementMove={handleComplementMove}
            />
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAndClose} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReorderMenu;
