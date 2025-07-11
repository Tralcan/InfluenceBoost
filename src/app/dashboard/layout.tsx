import { Header } from '@/components/header';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  PlusCircle,
  Settings,
  LifeBuoy,
  Home,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <Logo />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: 'Panel' }}
              >
                 <Link href="/dashboard"><Home />Panel</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: 'Nueva Campaña' }}
              >
                <Link href="/dashboard/campaigns/new"><PlusCircle />Nueva Campaña</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: 'Buscar Código' }}
              >
                <Link href="/dashboard/search-code"><Search />Buscar Código</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto">
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: 'Ajustes' }}
              >
                 <Link href="#"><Settings />Ajustes</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: 'Ayuda' }}
              >
                 <Link href="#"><LifeBuoy />Ayuda</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
