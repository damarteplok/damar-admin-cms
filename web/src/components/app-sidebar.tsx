'use client'

import * as React from 'react'
import { Bell, Command, Frame, PieChart, TrendingUp, User } from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { useTranslation } from 'react-i18next'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const defaultUser = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const data = {
    user: defaultUser,
    navMain: [
      {
        title: t('nav.dashboard'),
        icon: TrendingUp,
        url: '/admin',
      },
      {
        title: t('nav.workspaces'),
        icon: Frame,
        items: [
          {
            title: t('nav.workspaces'),
            url: '/admin/workspaces',
          },
        ],
      },
      {
        title: t('nav.subscription'),
        icon: PieChart,
        items: [
          {
            title: t('nav.packages'),
            url: '/admin/products',
          },
          {
            title: t('nav.plans'),
            url: '/admin/plans',
          },
          {
            title: t('nav.discounts'),
            url: '/admin/discounts',
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: t('nav.profile'),
        url: '/admin/profile',
        icon: User,
      },
      {
        title: t('nav.notifications'),
        url: '#',
        icon: Bell,
      },
    ],
    projects: [],
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Damar CMS</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
