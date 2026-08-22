"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, CalendarDays,
  BarChart3, Target, Shield, BookOpen, Brain, Settings,
  User, Menu, Bell, TrendingUp, LogOut, ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const mainNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Trades", href: "/trades", icon: ArrowLeftRight },
  { title: "Accounts", href: "/accounts", icon: Wallet },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Risk Management", href: "/risk-management", icon: Shield },
  { title: "Journal", href: "/journal", icon: BookOpen },
  { title: "AI Review", href: "/ai-review", icon: Brain },
];

const bottomNavItems = [
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Profile", href: "/profile", icon: User },
];

function NavItem({ href, icon: Icon, title, active, onClick }: {
  href: string; icon: React.ElementType; title: string; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {title}
    </Link>
  );
}

function SidebarContent({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <div className="flex h-full flex-col" style={{ background: "oklch(0.13 0.02 250)" }}>
      <div className="flex h-16 items-center px-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>TradeVault</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-3">
        <nav className="grid gap-0.5 px-3">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={pathname === item.href || pathname.startsWith(item.href + '/')}
              onClick={onNav}
            />
          ))}
        </nav>
      </ScrollArea>
      <div className="p-3 border-t border-border">
        <nav className="grid gap-0.5 mb-3">
          {bottomNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={pathname === item.href}
              onClick={onNav}
            />
          ))}
        </nav>
        <Separator className="mb-3" />
        <div className="flex items-center gap-2 px-3 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>TradeVault v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const currentTitle =
    [...mainNavItems, ...bottomNavItems].find(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    )?.title ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[240px] flex-col md:flex fixed inset-y-0 z-50 border-r border-border">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
          {/* Mobile menu button - outside Sheet to avoid button nesting */}
          <button
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-[240px] p-0 border-r border-border">
              <SidebarContent pathname={pathname} onNav={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-base font-semibold tracking-tight">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Account selector */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="hidden sm:flex items-center gap-2 h-8 px-3 text-xs rounded-md border border-border hover:bg-muted transition-colors cursor-pointer">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Main Account</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Accounts</DropdownMenuLabel>
                <DropdownMenuItem>FTMO 100K</DropdownMenuItem>
                <DropdownMenuItem>Personal Account</DropdownMenuItem>
                <DropdownMenuItem>Demo Account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <button className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center justify-center rounded-full h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="Avatar" />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">TV</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">Trader</p>
                  <p className="text-xs text-muted-foreground">user@tradevault.app</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
