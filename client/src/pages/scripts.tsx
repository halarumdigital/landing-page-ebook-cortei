import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Code } from "lucide-react";

export default function Scripts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [metaPixel, setMetaPixel] = useState("");
  const [googleAnalytics, setGoogleAnalytics] = useState("");
  const [googleTagManager, setGoogleTagManager] = useState("");

  const { data: currentUser, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (!userLoading && !currentUser?.success) {
      setLocation("/login");
    }
  }, [currentUser, userLoading, setLocation]);

  useEffect(() => {
    if (settingsData?.settings?.meta_pixel) {
      setMetaPixel(settingsData.settings.meta_pixel);
    }
    if (settingsData?.settings?.google_analytics) {
      setGoogleAnalytics(settingsData.settings.google_analytics);
    }
    if (settingsData?.settings?.google_tag_manager) {
      setGoogleTagManager(settingsData.settings.google_tag_manager);
    }
  }, [settingsData]);

  const updateScriptsMutation = useMutation({
    mutationFn: async (scripts: { meta_pixel?: string; google_analytics?: string; google_tag_manager?: string }) => {
      const response = await fetch('/api/settings/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scripts),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar scripts');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Scripts atualizados com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateScriptsMutation.mutate({
      meta_pixel: metaPixel,
      google_analytics: googleAnalytics,
      google_tag_manager: googleTagManager,
    });
  };

  if (userLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!currentUser?.success) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Code className="w-8 h-8" />
          Scripts de Terceiros
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure scripts de rastreamento e análise
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta Pixel */}
        <Card>
          <CardHeader>
            <CardTitle>Meta Pixel (Facebook Pixel)</CardTitle>
            <CardDescription>
              Digite apenas o ID do seu Meta Pixel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="meta-pixel">ID do Meta Pixel</Label>
              <Input
                id="meta-pixel"
                value={metaPixel}
                onChange={(e) => setMetaPixel(e.target.value)}
                placeholder="123456789012345"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: 123456789012345 (apenas números)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Google Analytics</CardTitle>
            <CardDescription>
              Digite apenas o ID de medição do Google Analytics (GA4)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="google-analytics">ID de Medição (Measurement ID)</Label>
              <Input
                id="google-analytics"
                value={googleAnalytics}
                onChange={(e) => setGoogleAnalytics(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: G-XXXXXXXXXX (começa com G- para GA4)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google Tag Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Google Tag Manager</CardTitle>
            <CardDescription>
              Digite apenas o ID do container do Google Tag Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="google-tag-manager">ID do Container</Label>
              <Input
                id="google-tag-manager"
                value={googleTagManager}
                onChange={(e) => setGoogleTagManager(e.target.value)}
                placeholder="GTM-XXXXXXX"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: GTM-XXXXXXX (começa com GTM-)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={updateScriptsMutation.isPending}>
            {updateScriptsMutation.isPending ? "Salvando..." : "Salvar Scripts"}
          </Button>
        </div>
      </form>
    </div>
  );
}
