
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subscription } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

type SubscriptionContextType = {
  isSubscribed: boolean;
  subscription: Subscription | null;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckoutSession: (planType: 'monthly' | 'yearly') => Promise<string | null>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSubscription = async () => {
    if (!user) {
      setIsSubscribed(false);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setIsSubscribed(data.subscribed);
      setSubscription(data.subscription);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast.error('Erro ao verificar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async (planType: 'monthly' | 'yearly'): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });
      
      if (error) throw error;
      
      return data.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao criar sessão de pagamento');
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setIsSubscribed(false);
      setSubscription(null);
      setIsLoading(false);
    }
  }, [user]);

  const value = {
    isSubscribed,
    subscription,
    isLoading,
    checkSubscription,
    createCheckoutSession,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
