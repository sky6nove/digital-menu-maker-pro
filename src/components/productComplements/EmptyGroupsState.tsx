
import React from "react";

export const EmptyGroupsState = () => {
  return (
    <div className="text-center py-8 border border-dashed rounded-md">
      <p className="text-muted-foreground">Nenhum grupo de complementos adicionado</p>
      <p className="text-sm text-muted-foreground mt-1">
        Selecione grupos acima para adicionar a este produto
      </p>
    </div>
  );
};
