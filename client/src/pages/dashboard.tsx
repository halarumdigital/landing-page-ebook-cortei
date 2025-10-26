import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ListChecks, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: currentUser, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: leadsData } = useQuery<any>({
    queryKey: ["/api/leads"],
  });

  const { data: usersData } = useQuery<any>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (!userLoading && !currentUser?.success) {
      setLocation("/login");
    }
  }, [currentUser, userLoading, setLocation]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!currentUser?.success) {
    return null;
  }

  const totalLeads = leadsData?.total || 0;
  const totalUsers = usersData?.total || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo, {currentUser.user.name}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <ListChecks className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-leads">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads capturados via landing page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Usuários administrativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em breve disponível
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>
              Estatísticas e métricas do seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Utilize o menu lateral para navegar entre as diferentes seções do painel administrativo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
