import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function DashboardLeads() {
  const [, setLocation] = useLocation();

  const { data: currentUser, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery<any>({
    queryKey: ["/api/leads"],
  });

  useEffect(() => {
    if (!userLoading && !currentUser?.success) {
      setLocation("/login");
    }
  }, [currentUser, userLoading, setLocation]);

  if (userLoading || leadsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!currentUser?.success) {
    return null;
  }

  const leads = leadsData?.leads || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-leads-title">Leads Capturados</h1>
        <p className="text-muted-foreground mt-2">
          Visualize todos os leads capturados pela landing page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>
            Total de {leads.length} lead(s) capturado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Data de Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead: any) => (
                <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.whatsapp}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
