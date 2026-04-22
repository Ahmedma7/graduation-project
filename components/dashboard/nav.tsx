'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  Users, 
  Cpu, 
  Brain,
  LogOut,
  User
} from 'lucide-react'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DashboardNavProps {
  profile: Profile
}

export function DashboardNav({ profile }: DashboardNavProps) {
  const pathname = usePathname()
  
  const adminLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/predictions', label: 'AI Predictions', icon: Brain },
    { href: '/dashboard/requests', label: 'Requests', icon: ClipboardList },
    { href: '/dashboard/tasks', label: 'Tasks', icon: Cpu },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Package },
    { href: '/dashboard/users', label: 'Users', icon: Users },
  ]
  
  const technicianLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/my-tasks', label: 'My Tasks', icon: ClipboardList },
  ]
  
  const userLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/my-devices', label: 'My Devices', icon: Cpu },
    { href: '/dashboard/my-requests', label: 'My Requests', icon: ClipboardList },
  ]
  
  const links = profile.role === 'admin' 
    ? adminLinks 
    : profile.role === 'technician' 
      ? technicianLinks 
      : userLinks

  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || profile.email[0].toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-lg border-b border-slate-200/50 shadow-sm dark:bg-slate-900/90 dark:border-slate-700/50 dark:shadow-black/30">
      <div className="container flex h-20 items-center justify-between gap-6">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 group">
            <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-xl bg-white shadow-md transition-shadow group-hover:shadow-lg dark:bg-slate-950 dark:shadow-cyan-900/30">
              <Image
                src="/brand/eis-logo.jpg"
                alt="EIS logo"
                width={160}
                height={160}
                className="rounded-lg"
                style={{
                  display: 'block',
                  height: '60px',
                  width: 'auto',
                  objectFit: 'contain',
                }}
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 leading-tight dark:text-white">Maintenance EIS</span>
              <span className="text-sm text-slate-500 leading-tight dark:text-slate-400">System</span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 flex-1 ml-6">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} className="relative group">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    'gap-2.5 transition-all duration-200 font-medium',
                    isActive 
                      ? 'bg-blue-100/80 text-blue-700 hover:bg-blue-100 dark:bg-cyan-500/15 dark:text-cyan-300 dark:hover:bg-cyan-500/20' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Button>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-in fade-in dark:from-cyan-400 dark:to-cyan-300" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 transition-all duration-200 shadow-sm border border-slate-200/50 dark:border-slate-700/60 dark:hover:bg-slate-700/60">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200/50 dark:ring-cyan-400/30">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white font-bold text-sm dark:from-cyan-500 dark:to-teal-400">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 dark:border-[#334155] dark:bg-[#111827] dark:text-[#f9fafb]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal px-2 py-3">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-bold text-slate-900 dark:text-[#f9fafb]">{profile.full_name || 'User'}</p>
                <p className="text-xs text-slate-600 dark:text-[#cbd5e1]">
                  {profile.email}
                </p>
                {profile.role !== 'user' && profile.role !== 'premium' ? (
                  <div className="inline-flex items-center gap-1.5 w-fit">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {profile.role}
                    </p>
                  </div>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 dark:bg-[#334155]" />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center cursor-pointer gap-2 px-2 py-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors dark:text-[#cbd5e1] dark:hover:bg-[#1e293b] dark:hover:text-[#f9fafb]">
                <User className="h-4 w-4 text-slate-600 dark:text-[#94a3b8]" />
                <span className="dark:text-inherit">Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 dark:bg-[#334155]" />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-red-600 focus:text-red-600 cursor-pointer px-2 py-2 rounded-md hover:bg-red-50 transition-colors gap-2 dark:text-red-300 dark:focus:text-red-200 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
