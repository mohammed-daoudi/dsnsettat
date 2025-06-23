import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  BookOpen,
  Upload,
  FileText,
  Users,
  Settings,
  Shield,
  BarChart3,
  Home,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getNavigationItems = (role: string) => {
  const baseItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Submissions", url: "/submissions", icon: FileText },
  ];

  const studentItems = [
    { title: "Submit Work", url: "/submit", icon: Upload },
    { title: "My Submissions", url: "/my-submissions", icon: BookOpen },
  ];

  const teacherItems = [
    { title: "Review Submissions", url: "/review", icon: BookOpen },
    { title: "My Students", url: "/students", icon: Users },
  ];

  const adminItems = [
    { title: "All Submissions", url: "/admin/submissions", icon: FileText },
    { title: "Users Management", url: "/admin/users", icon: Users },
    { title: "IP Rights", url: "/admin/ip-rights", icon: Shield },
    { title: "Download Logs", url: "/admin/logs", icon: BarChart3 },
    { title: "System Settings", url: "/admin/settings", icon: Settings },
  ];

  if (role === 'student') return [...baseItems, ...studentItems];
  if (role === 'teacher') return [...baseItems, ...teacherItems];
  if (role === 'admin') return [...baseItems, ...adminItems];

  return baseItems;
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();
  const currentPath = location.pathname;

  const userRole = user?.publicMetadata?.role as string || 'student';
  const navigationItems = getNavigationItems(userRole);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-muted/50";
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'teacher': return 'text-blue-600';
      case 'student': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 p-4">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">MasterDSN</h1>
              <p className="text-xs text-muted-foreground">Academic Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        {user && (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(user.fullName || user.firstName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user.fullName || user.firstName}</p>
                      <p className={`text-xs capitalize ${getRoleColor(userRole)}`}>
                        {userRole}
                      </p>
                    </div>
                  )}
                  {!isCollapsed && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.fullName || user.firstName}</p>
                  <p className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
