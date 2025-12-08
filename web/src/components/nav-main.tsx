import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url?: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()
  const pathname =
    location?.pathname ??
    (typeof window !== 'undefined' ? window.location.pathname : '')

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const normalize = (p: string) =>
            p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p
          const pathNorm = normalize(pathname)
          const itemUrlNorm = item.url ? normalize(item.url) : null

          const subActive = !!item.items?.some((s) => {
            const sNorm = normalize(s.url)
            return pathNorm === sNorm || pathNorm.startsWith(sNorm + '/')
          })
          const itemActive = itemUrlNorm === pathNorm
          const defaultOpen = true || subActive

          return (
            <Collapsible key={item.title} asChild defaultOpen={defaultOpen}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={itemActive}
                  tooltip={item.title}
                >
                  {item.url ? (
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </div>
                  )}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive = pathname.startsWith(subItem.url)
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                              >
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
