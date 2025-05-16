
import { useAuth } from "@/contexts/AuthContext";
import { useBasicGroupActions, UseBasicGroupActionsProps } from "./useBasicGroupActions";
import { useGroupConfiguration, UseGroupConfigurationProps } from "./useGroupConfiguration";
import { useComplementActions, UseComplementActionsProps } from "./useComplementActions";

export interface UseGroupActionsProps 
  extends UseBasicGroupActionsProps, 
          UseGroupConfigurationProps, 
          UseComplementActionsProps {}

export const useGroupActions = (props: UseGroupActionsProps) => {
  const { user } = useAuth();
  
  const basicActions = useBasicGroupActions(props);
  const configActions = useGroupConfiguration(props);
  const complementActions = useComplementActions(props);

  return {
    ...basicActions,
    ...configActions,
    ...complementActions
  };
};
