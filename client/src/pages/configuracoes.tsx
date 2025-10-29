import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export default function Configuracoes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string>("");
  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("");
  const [heroText1, setHeroText1] = useState<string>("");
  const [heroText2, setHeroText2] = useState<string>("");

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
    if (settingsData?.settings?.logo_path) {
      setLogoPreview(settingsData.settings.logo_path);
    }
    if (settingsData?.settings?.favicon_path) {
      setFaviconPreview(settingsData.settings.favicon_path);
    }
    if (settingsData?.settings?.site_title) {
      setSiteTitle(settingsData.settings.site_title);
    }
    if (settingsData?.settings?.hero_title) {
      setHeroTitle(settingsData.settings.hero_title);
    }
    if (settingsData?.settings?.hero_subtitle) {
      setHeroSubtitle(settingsData.settings.hero_subtitle);
    }
    if (settingsData?.settings?.hero_text_1) {
      setHeroText1(settingsData.settings.hero_text_1);
    }
    if (settingsData?.settings?.hero_text_2) {
      setHeroText2(settingsData.settings.hero_text_2);
    }
  }, [settingsData]);

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload da logo');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: "Logo atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setLogoFile(null);
      setLogoPreview(data.logoPath);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadFaviconMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('favicon', file);

      const response = await fetch('/api/settings/favicon', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload do favicon');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: "Favicon atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setFaviconFile(null);
      setFaviconPreview(data.faviconPath);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch('/api/settings/title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteTitle: title }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar título');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Título do site atualizado com sucesso",
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

  const updateLandingTextsMutation = useMutation({
    mutationFn: async (texts: { hero_title: string; hero_subtitle: string; hero_text_1: string; hero_text_2: string }) => {
      const response = await fetch('/api/settings/landing-texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(texts),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar textos');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Textos da landing page atualizados com sucesso",
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEbookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEbookFile(file);
    }
  };

  const uploadEbookMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('ebook', file);

      const response = await fetch('/api/settings/ebook', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload do e-book');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "E-book atualizado com sucesso",
      });
      setEbookFile(null);
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

  const handleLogoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (logoFile) {
      uploadLogoMutation.mutate(logoFile);
    }
  };

  const handleFaviconSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (faviconFile) {
      uploadFaviconMutation.mutate(faviconFile);
    }
  };

  const handleEbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ebookFile) {
      uploadEbookMutation.mutate(ebookFile);
    }
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (siteTitle && siteTitle.trim()) {
      updateTitleMutation.mutate(siteTitle.trim());
    }
  };

  const handleLandingTextsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroTitle && heroSubtitle) {
      updateLandingTextsMutation.mutate({
        hero_title: heroTitle.trim(),
        hero_subtitle: heroSubtitle.trim(),
        hero_text_1: heroText1.trim(),
        hero_text_2: heroText2.trim(),
      });
    }
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
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações do site
        </p>
      </div>

      {/* Site Title */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Título do Site</CardTitle>
          <CardDescription>
            Define o nome que aparece na aba do navegador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTitleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteTitle">Título</Label>
              <Input
                id="siteTitle"
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="Ex: Corteiia - Gestão de Salões"
                disabled={updateTitleMutation.isPending}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">
                Máximo de 255 caracteres
              </p>
            </div>

            <Button
              type="submit"
              disabled={!siteTitle || !siteTitle.trim() || updateTitleMutation.isPending}
            >
              {updateTitleMutation.isPending ? "Salvando..." : "Salvar Título"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Landing Page Texts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Textos da Landing Page</CardTitle>
          <CardDescription>
            Define os textos que aparecem na página inicial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLandingTextsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Título Principal</Label>
              <Input
                id="heroTitle"
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Ex: 7 Dicas Infalíveis para Lotar sua Agenda de Clientes"
                disabled={updateLandingTextsMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtítulo</Label>
              <Input
                id="heroSubtitle"
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Ex: Sua barbearia ou salão está realmente atraindo novos clientes?"
                disabled={updateLandingTextsMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroText1">Texto Principal (Parágrafo 1)</Label>
              <Textarea
                id="heroText1"
                value={heroText1}
                onChange={(e) => setHeroText1(e.target.value)}
                placeholder="Primeiro parágrafo do texto principal..."
                disabled={updateLandingTextsMutation.isPending}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroText2">Texto Principal (Parágrafo 2)</Label>
              <Textarea
                id="heroText2"
                value={heroText2}
                onChange={(e) => setHeroText2(e.target.value)}
                placeholder="Segundo parágrafo do texto principal..."
                disabled={updateLandingTextsMutation.isPending}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={!heroTitle || !heroSubtitle || updateLandingTextsMutation.isPending}
            >
              {updateLandingTextsMutation.isPending ? "Salvando..." : "Salvar Textos"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Logo do Site</CardTitle>
            <CardDescription>
              Envie a logo que será exibida no site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Selecione uma imagem</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={uploadLogoMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPEG, PNG, GIF, SVG (máx. 5MB)
                </p>
              </div>

              {logoPreview && (
                <div className="space-y-2">
                  <Label>Pré-visualização</Label>
                  <div className="border rounded-lg p-4 bg-muted/50 flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={!logoFile || uploadLogoMutation.isPending}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadLogoMutation.isPending ? "Enviando..." : "Enviar Logo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* E-book Upload */}
        <Card>
          <CardHeader>
            <CardTitle>E-book (PDF)</CardTitle>
            <CardDescription>
              Faça upload do arquivo PDF que será entregue após o preenchimento do formulário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEbookSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ebook">Arquivo PDF</Label>
                <Input
                  id="ebook"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleEbookChange}
                  disabled={uploadEbookMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Apenas arquivos PDF (máx. 10MB)
                </p>
              </div>

              {ebookFile && (
                <div className="space-y-2">
                  <Label>Arquivo selecionado</Label>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm font-medium">{ebookFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(ebookFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {settingsData?.settings?.ebook_path && (
                <div className="space-y-2">
                  <Label>E-book atual</Label>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <a
                      href={settingsData.settings.ebook_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visualizar e-book atual
                    </a>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={!ebookFile || uploadEbookMutation.isPending}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadEbookMutation.isPending ? "Enviando..." : "Enviar E-book"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Favicon Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Favicon do Site</CardTitle>
            <CardDescription>
              Envie o favicon que será exibido na aba do navegador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFaviconSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favicon">Selecione uma imagem</Label>
                <Input
                  id="favicon"
                  type="file"
                  accept="image/*,.ico"
                  onChange={handleFaviconChange}
                  disabled={uploadFaviconMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: ICO, PNG (16x16 ou 32x32 pixels, máx. 5MB)
                </p>
              </div>

              {faviconPreview && (
                <div className="space-y-2">
                  <Label>Pré-visualização</Label>
                  <div className="border rounded-lg p-4 bg-muted/50 flex items-center justify-center">
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={!faviconFile || uploadFaviconMutation.isPending}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadFaviconMutation.isPending ? "Enviando..." : "Enviar Favicon"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
