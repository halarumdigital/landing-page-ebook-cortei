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

      toast({
        title: "Sucesso!",
        description: "Cadastro confirmado! Bem-vindo à lista de espera da Cortei AI.",
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
          <div className="flex items-center justify-center text-white">
            {settings?.logo_path && (
              <img
                src={settings.logo_path}
                alt="Logo"
                className="h-8 md:h-10 lg:h-12 w-auto max-w-[200px] md:max-w-none object-contain"
                data-testid="logo-image"
              />
            )}
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 lg:py-20">
          <div className="flex flex-col items-center">
            <div className="text-white space-y-6 text-center max-w-4xl mb-12">
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 fill-primary"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-white">+ de 1000 agendamentos feitos</span>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <svg
                    className="w-4 h-4 text-primary"
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
                  <span className="text-sm font-medium text-white">+ de 200 barbearias</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight uppercase" data-testid="text-headline">
                {settings?.hero_title || 'Garanta seu acesso antecipado ao Cortei AI'}
              </h1>

              <h2 className="text-2xl font-semibold" data-testid="text-subheadline">
                {settings?.hero_subtitle || 'Sua barbearia ou salão está realmente atraindo novos clientes?'}
              </h2>

              {settings?.hero_text_1 && settings.hero_text_1.trim() !== '' && (
                <p className="text-base leading-relaxed" data-testid="text-description-1">
                  {settings.hero_text_1}
                </p>
              )}

              {settings?.hero_text_2 && settings.hero_text_2.trim() !== '' && (
                <p className="text-base leading-relaxed" data-testid="text-description-2">
                  {settings.hero_text_2}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 w-full max-w-md">
              {isSuccess ? (
                <div className="text-center space-y-6" data-testid="success-message">
                  <div className="text-6xl">🎉</div>
                  <h3 className="font-bold text-2xl text-gray-800">
                    Cadastro confirmado!
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-4 text-left">
                    <p>
                      Você acabou de garantir sua vaga na lista de espera da <strong>Cortei AI</strong>!
                    </p>
                    <p>
                      O sistema que vai automatizar o agendamento e a gestão do seu salão ou barbearia direto pelo WhatsApp.
                    </p>
                    <p>
                      Os primeiros a entrar na comunidade vão receber notícias, atualizações exclusivas e acesso antecipado assim que o sistema for liberado.
                    </p>
                    <p className="flex items-start gap-2">
                      <span>👉</span>
                      <span>Toque no botão abaixo para entrar na comunidade oficial no WhatsApp e não perder nada.</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open('https://chat.whatsapp.com/Bj297KzNO3sE7FRL5VZIoC?mode=wwt', '_blank')}
                    className="w-full"
                    data-testid="button-whatsapp-community"
                  >
                    Entrar na Comunidade Cortei AI no WhatsApp
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h3 className="font-black text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600 uppercase tracking-tight leading-tight" data-testid="text-form-title">
                      {settings?.site_title || 'BAIXE SEU E-BOOK GRÁTIS'}
                    </h3>
                    <div className="mt-2 h-1 w-20 bg-gradient-to-r from-primary to-orange-600 mx-auto rounded-full"></div>
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
                        {submitLead.isPending ? "ENVIANDO..." : "ENTRAR NA LISTA DE ESPERA"}
                      </Button>
                    </form>
                  </Form>

                  <p className="text-center text-xs text-gray-500 mt-6" data-testid="text-disclaimer">
                    Seja um dos primeiros a testar o sistema que enche agendas automaticamente.<br />
                    As vagas antecipadas são limitadas.<br />
                    <strong className="text-gray-700">As primeiras contas terão 30 dias de acesso gratuito.</strong>
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
