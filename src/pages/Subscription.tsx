
import { useState, useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, CalendarClock, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Subscription = () => {
  const { isSubscribed, subscription, isLoading, createCheckoutSession, checkSubscription } = useSubscription();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const handleSubscribe = async () => {
    try {
      setIsCreatingCheckout(true);
      const checkoutUrl = await createCheckoutSession(selectedPlan);
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Não foi possível criar a sessão de pagamento");
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast.error("Erro ao criar sessão de pagamento");
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      
      <div className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Assinatura</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : isSubscribed ? (
          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Assinatura Ativa
                </CardTitle>
                <CardDescription className="text-green-600">
                  Você tem acesso a todos os recursos do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-green-700" />
                    Plano: {subscription?.plan_type === 'monthly' ? 'Mensal (R$ 20,00/mês)' : 'Anual (R$ 200,00/ano)'}
                  </p>
                  <p className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-700" />
                    Status: {subscription?.status === 'active' ? 'Ativo' : subscription?.status === 'trialing' ? 'Em período de teste' : subscription?.status}
                  </p>
                  {subscription?.current_period_end && (
                    <p className="font-medium flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-green-700" />
                      Próxima renovação: {format(new Date(subscription.current_period_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={checkSubscription}>
                  Atualizar status
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Escolha seu plano</CardTitle>
                <CardDescription>
                  Escolha o plano que melhor se adapta às suas necessidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as "monthly" | "yearly")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Mensal</TabsTrigger>
                    <TabsTrigger value="yearly">Anual (2 meses grátis)</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="monthly" className="space-y-4 pt-4">
                    <div className="rounded-lg border p-6">
                      <h3 className="text-2xl font-bold">Plano Mensal</h3>
                      <p className="text-4xl font-bold mt-2">R$ 20,00<span className="text-sm font-normal text-gray-500">/mês</span></p>
                      
                      <ul className="mt-6 space-y-3">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          Todas as funcionalidades do sistema
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          Suporte por email
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          Acesso a atualizações
                        </li>
                      </ul>
                      
                      <Button className="w-full mt-6" onClick={handleSubscribe} disabled={isCreatingCheckout}>
                        {isCreatingCheckout ? "Processando..." : "Assinar plano mensal"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="yearly" className="space-y-4 pt-4">
                    <div className="rounded-lg border p-6 border-primary bg-primary/5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold">Plano Anual</h3>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">ECONOMIZE 16%</span>
                      </div>
                      <p className="text-4xl font-bold">R$ 200,00<span className="text-sm font-normal text-gray-500">/ano</span></p>
                      
                      <ul className="mt-6 space-y-3">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          Todas as funcionalidades do sistema
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          Suporte por email
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          Acesso a atualizações
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <strong>2 meses grátis</strong> em comparação ao plano mensal
                        </li>
                      </ul>
                      
                      <Button className="w-full mt-6" onClick={handleSubscribe} disabled={isCreatingCheckout}>
                        {isCreatingCheckout ? "Processando..." : "Assinar plano anual"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
