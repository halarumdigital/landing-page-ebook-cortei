import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import barbershopImage from "@assets/generated_images/Modern_barbershop_interior_design_8183ea67.png";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch site settings for dynamic texts
  const { data: settingsData } = useQuery<any>({
    queryKey: ["/api/settings"],
    retry: false,
    staleTime: Infinity,
  });

  const settings = settingsData?.settings;

  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
    },
  });

  const submitLead = useMutation({
    mutationFn: async (data: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response;
    },
    onSuccess: () => {
      setIsSuccess(true);
      form.reset();
      
      const link = document.createElement("a");
      link.href = "/api/ebook/download";
      link.download = "7-Dicas-Infaliveis-para-Lotar-sua-Agenda.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso!",
        description: "Seu e-book está sendo baixado. Verifique sua pasta de downloads.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertLead) => {
    submitLead.mutate(data);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${barbershopImage})`,
        }}
      />
      
      <div className="absolute inset-0 bg-black/80" />

      <div className="absolute top-6 left-6 opacity-50 pointer-events-none">
        <div className="w-10 h-10 grid grid-cols-4 gap-1">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 opacity-50 pointer-events-none">
        <div className="w-10 h-10 grid grid-cols-4 gap-1">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <header className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              {settings?.logo_path && (
                <img
                  src={settings.logo_path}
                  alt="Logo"
                  className="h-8 md:h-10 lg:h-12 w-auto max-w-[200px] md:max-w-none object-contain"
                  data-testid="logo-image"
                />
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-6">
              <p className="font-semibold tracking-widest text-sm uppercase" data-testid="text-eyebrow">
                E-BOOK GRATUITO
              </p>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight" data-testid="text-headline">
                {settings?.hero_title || '7 Dicas Infalíveis para Lotar sua Agenda de Clientes'}
              </h1>

              <h2 className="text-2xl font-semibold" data-testid="text-subheadline">
                {settings?.hero_subtitle || 'Sua barbearia ou salão está realmente atraindo novos clientes?'}
              </h2>

              <p className="text-base leading-relaxed" data-testid="text-description-1">
                {settings?.hero_text_1 || 'Sua barbearia ou salão não pode mais ser reativo. Nós realizamos pesquisas constantes para descobrir o que gera os melhores resultados e o que é perda de tempo, para que você possa ser proativo. Seja para ajustar as estratégias para o próximo semestre ou já planejar o próximo ano, ter o método certo é essencial.'}
              </p>

              <p className="text-base leading-relaxed" data-testid="text-description-2">
                {settings?.hero_text_2 || 'Nossos especialistas compilaram as 7 dicas mais eficazes neste e-book gratuito, focando em criar um serviço de barbearia ou salão que impulsiona os resultados e fideliza clientes.'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10">
              {isSuccess ? (
                <div className="text-center space-y-6" data-testid="success-message">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-10 h-10 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-800">
                    E-book Baixado!
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Obrigado por se inscrever! Seu e-book "7 Dicas Infalíveis
                    para Lotar sua Agenda" está sendo baixado. Boa leitura e
                    sucesso nos seus negócios!
                  </p>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="w-full"
                    data-testid="button-download-again"
                  >
                    Baixar Novamente
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h3 className="font-black text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600 uppercase tracking-tight leading-tight" data-testid="text-form-title">
                      {settings?.site_title || 'BAIXE SEU E-BOOK GRÁTIS'}
                    </h3>
                    <div className="mt-2 h-1 w-20 bg-gradient-to-r from-primary to-yellow-600 mx-auto rounded-full"></div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Nome completo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome completo*"
                                {...field}
                                className="w-full bg-gray-100 border-transparent rounded-lg text-gray-700 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-primary"
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Email*"
                                {...field}
                                className="w-full bg-gray-100 border-transparent rounded-lg text-gray-700 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-primary"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">WhatsApp com DDD</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="WhatsApp com DDD*"
                                {...field}
                                className="w-full bg-gray-100 border-transparent rounded-lg text-gray-700 placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-primary"
                                data-testid="input-whatsapp"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full font-bold"
                        disabled={submitLead.isPending}
                        data-testid="button-submit"
                      >
                        {submitLead.isPending ? "ENVIANDO..." : "BAIXAR E-BOOK GRÁTIS"}
                      </Button>
                    </form>
                  </Form>

                  <p className="text-center text-xs text-gray-500 mt-6" data-testid="text-disclaimer">
                    Ao baixar o e-book, você concorda em receber comunicações sobre
                    novos conteúdos e dicas para o seu negócio.
                  </p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
