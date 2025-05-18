
import React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CategoryPanel, ProductPanel, ComplementGroupPanel, ComplementPanel } from "@/components/reorderMenu";

interface ReorderLayoutProps {
  // Data
  categories: any[];
  filteredProducts: any[];
  productGroups: any[];
  groupComplements: any[];
  
  // Active states
  activeCategory: number | null;
  activeProduct: number | null;
  activeGroup: number | null;
  
  // Names for display
  activeCategoryName: string;
  activeProductName: string;
  activeGroupName: string;
  
  // Loading state
  loadingComplements: boolean;
  
  // Handlers
  handleCategorySelect: (id: number) => void;
  handleProductSelect: (id: number) => void;
  handleGroupSelect: (id: number) => void;
  handleCategoryMove: (id: number, direction: 'up' | 'down') => void;
  handleProductMove: (id: number, direction: 'up' | 'down') => void;
  handleGroupMove: (id: number, direction: 'up' | 'down') => void;
  handleComplementMove: (id: number, direction: 'up' | 'down') => void;
}

const ReorderLayout: React.FC<ReorderLayoutProps> = ({
  categories,
  filteredProducts,
  productGroups,
  groupComplements,
  activeCategory,
  activeProduct,
  activeGroup,
  activeCategoryName,
  activeProductName,
  activeGroupName,
  loadingComplements,
  handleCategorySelect,
  handleProductSelect,
  handleGroupSelect,
  handleCategoryMove,
  handleProductMove,
  handleGroupMove,
  handleComplementMove
}) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[500px] border rounded-lg">
      {/* Categories */}
      <ResizablePanel defaultSize={25}>
        <CategoryPanel 
          categories={categories}
          activeCategory={activeCategory}
          handleCategorySelect={handleCategorySelect}
          handleCategoryMove={handleCategoryMove}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Products */}
      <ResizablePanel defaultSize={25}>
        <ProductPanel 
          products={filteredProducts}
          activeCategory={activeCategory}
          activeProduct={activeProduct}
          categoryName={activeCategoryName}
          handleProductSelect={handleProductSelect}
          handleProductMove={handleProductMove}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Complement Groups */}
      <ResizablePanel defaultSize={25}>
        <ComplementGroupPanel 
          complementGroups={productGroups}
          activeProduct={activeProduct}
          activeGroup={activeGroup}
          productName={activeProductName}
          handleGroupSelect={handleGroupSelect}
          handleGroupMove={handleGroupMove}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Complements */}
      <ResizablePanel defaultSize={25}>
        <ComplementPanel 
          complements={groupComplements}
          activeGroup={activeGroup}
          groupName={activeGroupName}
          handleComplementMove={handleComplementMove}
          loading={loadingComplements}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ReorderLayout;
