'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  PlusCircle,
  Settings,
  LifeBuoy,
  Home,
  Search,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { supabase } from '@/lib/supabase/client';
import { AuthButton } from '@/components/auth-button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
             <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <PanelLeft />
                  <span className="sr-only">Alternar Barra Lateral</span>
                </Button>
              </SheetTrigger>
              <Link href="/dashboard">
                <Logo />
              </Link>
              <div className="ml-auto">
                <AuthButton user={user} />
              </div>
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
        <SheetContent
          side="left"
          className="w-[240px] bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Menú</SheetTitle>
          </SheetHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard" onClick={handleLinkClick}>
                    <Home />
                    Panel
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/campaigns/new" onClick={handleLinkClick}>
                    <PlusCircle />
                    Nueva Campaña
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/search-code" onClick={handleLinkClick}>
                    <Search />
                    Buscar Código
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#" onClick={handleLinkClick}>
                    <Settings />
                    Ajustes
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#" onClick={handleLinkClick}>
                    <LifeBuoy />
                    Ayuda
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
