
import { supabase } from "@/integrations/supabase/client";

export interface ReorderItem {
  id: number;
  name: string;
  order: number;
  isActive?: boolean;
}

// Counter for unique temporary values
let tempCounter = 0;

// Helper function to perform atomic swap using temporary values
export const performAtomicSwap = async (
  table: string,
  orderField: string,
  item1Id: number,
  item2Id: number,
  item1Order: number,
  item2Order: number
) => {
  console.log(`Starting atomic swap for ${table}:`, {
    item1: { id: item1Id, order: item1Order },
    item2: { id: item2Id, order: item2Order }
  });

  // Generate a safe temporary order value
  tempCounter++;
  const tempOrder = -999999 - tempCounter;

  try {
    // Step 1: Set first item to temporary order
    const { error: error1 } = await supabase
      .from(table as any)
      .update({ [orderField]: tempOrder })
      .eq('id', item1Id);
    
    if (error1) {
      console.error(`Error setting temp order for item ${item1Id}:`, error1);
      throw error1;
    }

    // Step 2: Set second item to first item's original order
    const { error: error2 } = await supabase
      .from(table as any)
      .update({ [orderField]: item1Order })
      .eq('id', item2Id);
    
    if (error2) {
      console.error(`Error updating item ${item2Id} order:`, error2);
      throw error2;
    }

    // Step 3: Set first item to second item's original order
    const { error: error3 } = await supabase
      .from(table as any)
      .update({ [orderField]: item2Order })
      .eq('id', item1Id);
    
    if (error3) {
      console.error(`Error finalizing item ${item1Id} order:`, error3);
      throw error3;
    }

    console.log(`Atomic swap completed successfully for ${table}`);
    return true;
  } catch (error) {
    console.error(`Atomic swap failed for ${table}:`, error);
    throw error;
  }
};
