
import React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CategoryPanel, ProductPanel, ComplementGroupPanel, ComplementPanel } from "@/components/reorderMenu";

interface ReorderLayoutProps {
  categories: any[];
  filteredProducts: any[];
  productGroups: any[];
  groupComplements: any[];
  
  activeCategory: number | null;
  activeProduct: number | null;
  activeGroup: number | null;
  
  activeCategoryName: string;
  activeProductName: string;
  activeGroupName: string;
  
  loadingComplements: boolean;
  loadingProducts?: boolean;
  loadingGroups?: boolean;
  savingCategories?: boolean;
  savingProducts?: boolean;
  savingGroups?: boolean;
  savingComplements?: boolean;
  
  handleCategorySelect: (id: number) => void;
  handleProductSelect: (id: number) => void;
  handleGroupSelect: (id: number) => void;
  handleCategoryMove: (id: number, direction: 'up' | 'down') => Promise<boolean | void>;
  handleProductMove: (id: number, direction: 'up' | 'down') => Promise<boolean | void>;
  handleGroupMove: (id: number, direction: 'up' | 'down') => Promise<boolean | void>;
  handleComplementMove: (id: number, direction: 'up' | 'down') => Promise<boolean | void>;
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
  loadingProducts = false,
  loadingGroups = false,
  savingCategories = false,
  savingProducts = false,
  savingGroups = false,
  savingComplements = false,
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
      <ResizablePanel defaultSize={25}>
        <CategoryPanel 
          categories={categories}
          activeCategory={activeCategory}
          saving={savingCategories}
          handleCategorySelect={handleCategorySelect}
          handleCategoryMove={handleCategoryMove}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={25}>
        <ProductPanel 
          products={filteredProducts}
          activeCategory={activeCategory}
          activeProduct={activeProduct}
          categoryName={activeCategoryName}
          loading={loadingProducts}
          saving={savingProducts}
          handleProductSelect={handleProductSelect}
          handleProductMove={handleProductMove}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={25}>
        <ComplementGroupPanel 
          complementGroups={productGroups}
          activeProduct={activeProduct}
          activeGroup={activeGroup}
          productName={activeProductName}
          saving={savingGroups}
          handleGroupSelect={handleGroupSelect}
          handleGroupMove={handleGroupMove}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={25}>
        <ComplementPanel 
          complements={groupComplements}
          activeGroup={activeGroup}
          groupName={activeGroupName}
          saving={savingComplements}
          handleComplementMove={handleComplementMove}
          loading={loadingComplements}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ReorderLayout;
