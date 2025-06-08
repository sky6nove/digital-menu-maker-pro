
import React, { ReactNode } from "react";

interface ReorderPanelProps {
  title: string;
  children: ReactNode;
  emptyMessage?: string;
  selectedId?: number | null;
}

const ReorderPanel: React.FC<ReorderPanelProps> = ({ 
  title, 
  children, 
  emptyMessage = "Nenhum item para exibir", 
  selectedId 
}) => {
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="font-semibold border-b pb-2 mb-2">
        <span>{title}</span>
      </div>
      <div className="overflow-y-auto flex-1">
        {React.Children.count(children) > 0 ? (
          children
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReorderPanel;
