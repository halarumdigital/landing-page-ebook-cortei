import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Usuarios from "@/pages/usuarios";
import DashboardLeads from "@/pages/dashboard-leads";
import Configuracoes from "@/pages/configuracoes";
import Scripts from "@/pages/scripts";
import NotFound from "@/pages/not-found";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "./lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      setLocation("/login");
    },
  });

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  // Fetch site settings to update document title
  const { data: settingsData } = useQuery<any>({
    queryKey: ["/api/settings"],
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (settingsData?.settings?.site_title) {
      document.title = settingsData.settings.site_title;
    }
  }, [settingsData]);

  useEffect(() => {
    if (settingsData?.settings?.favicon_path) {
      // Update favicon dynamically
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settingsData.settings.favicon_path;
    }
  }, [settingsData]);

  useEffect(() => {
    // Inject third-party scripts (Meta Pixel, Google Analytics, Google Tag Manager)
    const settings = settingsData?.settings;
    if (!settings) return;

    // Generate Meta Pixel script from ID
    const generateMetaPixelScript = (pixelId: string) => {
      return `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;
    };

    // Generate Google Analytics script from ID
    const generateGoogleAnalyticsScript = (measurementId: string) => {
      return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`;
    };

    // Generate Google Tag Manager script from ID
    const generateGoogleTagManagerScript = (containerId: string) => {
      return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');</script>
<!-- End Google Tag Manager -->`;
    };

    const scriptsToInject = [
      { id: 'meta-pixel-script', content: settings.meta_pixel ? generateMetaPixelScript(settings.meta_pixel) : null },
      { id: 'google-analytics-script', content: settings.google_analytics ? generateGoogleAnalyticsScript(settings.google_analytics) : null },
      { id: 'google-tag-manager-script', content: settings.google_tag_manager ? generateGoogleTagManagerScript(settings.google_tag_manager) : null },
    ];

    scriptsToInject.forEach(({ id, content }) => {
      if (content) {
        // Remove existing script if any
        const existingScript = document.getElementById(id);
        if (existingScript) {
          existingScript.remove();
        }

        // Create container div
        const container = document.createElement('div');
        container.id = id;
        container.innerHTML = content;

        // Append to head
        document.head.appendChild(container);
      }
    });

    // Cleanup function
    return () => {
      scriptsToInject.forEach(({ id }) => {
        const scriptElement = document.getElementById(id);
        if (scriptElement) {
          scriptElement.remove();
        }
      });
    };
  }, [settingsData]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/leads">
        {() => (
          <DashboardLayout>
            <DashboardLeads />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/usuarios">
        {() => (
          <DashboardLayout>
            <Usuarios />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/configuracoes">
        {() => (
          <DashboardLayout>
            <Configuracoes />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/scripts">
        {() => (
          <DashboardLayout>
            <Scripts />
          </DashboardLayout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
