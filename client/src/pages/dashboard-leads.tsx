import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { FileDown, FileSpreadsheet, Filter, X } from "lucide-react";
import * as XLSX from 'xlsx';

export default function DashboardLeads() {
  const [, setLocation] = useLocation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Filtrar leads por intervalo de datas
  const filteredLeads = useMemo(() => {
    const allLeads = leadsData?.leads || [];

    if (!startDate && !endDate) {
      return allLeads;
    }

    return allLeads.filter((lead: any) => {
      const leadDate = new Date(lead.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + "T23:59:59") : null;

      if (start && end) {
        return leadDate >= start && leadDate <= end;
      } else if (start) {
        return leadDate >= start;
      } else if (end) {
        return leadDate <= end;
      }

      return true;
    });
  }, [leadsData, startDate, endDate]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  // Exportar para Excel
  const exportToExcel = () => {
    if (filteredLeads.length === 0) {
      alert("Não há leads para exportar");
      return;
    }

    const dataToExport = filteredLeads.map((lead: any) => ({
      Nome: lead.name,
      Email: lead.email,
      WhatsApp: lead.whatsapp,
      "Data de Cadastro": format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    const fileName = `leads_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Exportar para CSV
  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert("Não há leads para exportar");
      return;
    }

    const headers = ["Nome", "Email", "WhatsApp", "Data de Cadastro"];
    const rows = filteredLeads.map((lead: any) => [
      lead.name,
      lead.email,
      lead.whatsapp,
      format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `leads_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const hasFilters = startDate || endDate;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-leads-title">Leads Capturados</h1>
        <p className="text-muted-foreground mt-2">
          Visualize todos os leads capturados pela landing page
        </p>
      </div>

      {/* Filtros e Exportação */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Exportação
          </CardTitle>
          <CardDescription>
            Filtre os leads por data e exporte para Excel ou CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
              <Button variant="outline" onClick={exportToCSV} disabled={filteredLeads.length === 0}>
                <FileDown className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="default" onClick={exportToExcel} disabled={filteredLeads.length === 0}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>
            {hasFilters ? (
              <>
                Mostrando {filteredLeads.length} de {leadsData?.leads?.length || 0} lead(s)
              </>
            ) : (
              <>Total de {filteredLeads.length} lead(s) capturado(s)</>
            )}
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
              {filteredLeads.map((lead: any) => (
                <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.whatsapp}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {hasFilters ? "Nenhum lead encontrado para o período selecionado" : "Nenhum lead encontrado"}
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
