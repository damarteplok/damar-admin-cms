import {
  ArrowRight,
  Briefcase,
  Building2,
  FolderKanban,
  Layers,
  Users,
  Zap,
} from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface WorkspaceItem {
  icon: React.ReactNode
  title: string
  category: string
  description: string
  link: string
}

interface WorkspaceComponentProps {
  heading?: string
  items?: WorkspaceItem[]
}

const defaultItems: WorkspaceItem[] = [
  {
    icon: <Building2 />,
    title: 'Acme Corporation',
    category: 'Enterprise',
    description: 'Main company workspace with 24 active projects.',
    link: '#',
  },
  {
    icon: <FolderKanban />,
    title: 'Marketing Team',
    category: 'Team',
    description: 'Collaborative space for marketing campaigns and content.',
    link: '#',
  },
  {
    icon: <Zap />,
    title: 'Startup Projects',
    category: 'Innovation',
    description: 'Fast-paced workspace for new product development.',
    link: '#',
  },
  {
    icon: <Users />,
    title: 'Design Studio',
    category: 'Creative',
    description: 'Shared workspace for design team collaboration.',
    link: '#',
  },
  {
    icon: <Briefcase />,
    title: 'Client Projects',
    category: 'Professional',
    description: 'Dedicated workspace for client deliverables.',
    link: '#',
  },
  {
    icon: <Layers />,
    title: 'Development Hub',
    category: 'Engineering',
    description: 'Technical workspace for software development.',
    link: '#',
  },
]

export const WorkspaceComponent = ({
  heading = 'Your Workspaces',
  items = defaultItems,
}: WorkspaceComponentProps) => {
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container px-0 md:px-8">
        {/* Header - Matching blog.tsx and features.tsx */}
        <h1 className="mb-10 px-4 text-3xl font-bold tracking-tight md:mb-14 md:text-4xl lg:text-5xl">
          {heading}
        </h1>

        {/* Workspace List */}
        <div className="flex flex-col">
          <Separator />
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <div className="grid items-center gap-4 px-4 py-5 md:grid-cols-4">
                {/* Icon + Title + Category */}
                <div className="order-2 flex items-center gap-2 md:order-none">
                  <span className="bg-primary/10 text-primary flex h-14 w-16 shrink-0 items-center justify-center rounded-md">
                    {item.icon}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {item.category}
                    </p>
                  </div>
                </div>

                {/* Description - Fixed font size */}
                <p className="text-muted-foreground order-1 text-base md:order-none md:col-span-2 md:text-lg">
                  {item.description}
                </p>

                {/* Button */}
                <Button variant="outline" asChild>
                  <a
                    className="order-3 ml-auto w-fit gap-2 md:order-none"
                    href={item.link}
                  >
                    <span>Open workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <Separator />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
