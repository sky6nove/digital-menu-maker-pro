
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Move } from "lucide-react";
import { Table, TableBody } from "@/components/ui/table";

interface ReorderPanelProps {
  title: string;
  children: ReactNode;
  emptyMessage?: string;
  selectedId?: number | null;
}

const ReorderPanel: React.FC<ReorderPanelProps> = ({ 
  title, 
  children, 
  emptyMessage = "No items to display", 
  selectedId 
}) => {
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="font-semibold border-b pb-2 mb-2 flex justify-between items-center">
        <span>{title}</span>
        <Button variant="ghost" size="sm" className="px-2">
          <Move className="h-4 w-4 rotate-90" />
        </Button>
      </div>
      <div className="overflow-y-auto flex-1">
        {React.Children.count(children) > 0 ? (
          <Table>
            <TableBody>
              {children}
            </TableBody>
          </Table>
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
