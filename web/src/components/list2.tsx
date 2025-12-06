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

interface ListItem {
  icon: React.ReactNode
  title: string
  category: string
  description: string
  link: string
}

interface List2Props {
  heading?: string
  items?: ListItem[]
}

const List2 = ({
  heading = 'Your Workspaces',
  items = [
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
  ],
}: List2Props) => {
  return (
    <section className="py-32">
      <div className="container px-0 md:px-8">
        <h1 className="mb-10 px-4 text-3xl font-semibold md:mb-14 md:text-4xl">
          {heading}
        </h1>
        <div className="flex flex-col">
          <Separator />
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <div className="grid items-center gap-4 px-4 py-5 md:grid-cols-4">
                <div className="order-2 flex items-center gap-2 md:order-none">
                  <span className="bg-muted flex h-14 w-16 shrink-0 items-center justify-center rounded-md">
                    {item.icon}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {item.category}
                    </p>
                  </div>
                </div>
                <p className="order-1 text-2xl font-semibold md:order-none md:col-span-2">
                  {item.description}
                </p>
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

export { List2 }
