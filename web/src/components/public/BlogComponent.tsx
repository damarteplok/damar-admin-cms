interface BlogPost {
  id: string
  title: string
  description: string
  tags: string[]
  author: {
    name: string
    avatar: string
  }
  date: string
  thumbnail: string
  url: string
}

interface BlogComponentProps {
  heading?: string
  subheading?: string
  posts?: BlogPost[]
}

const defaultPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The future of component-driven design',
    description:
      'Explore how component-driven design is transforming modern frontend development workflows and improving scalability.',
    tags: ['frontend', 'design', 'architecture'],
    author: {
      name: 'Sabrina Lang',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    date: '10 Jul',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    url: '#',
  },
  {
    id: '2',
    title: 'Understanding server actions in laravel 12',
    description:
      'An in-depth look at how Server Actions in Laravel 11 simplify request handling and improve developer productivity.',
    tags: ['laravel', 'php', 'backend'],
    author: {
      name: 'Jason',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    date: '14 Jul',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    url: '#',
  },
  {
    id: '3',
    title: 'React performance optimization techniques',
    description:
      'Learn advanced techniques for optimizing React applications, from code-splitting to memoization and beyond.',
    tags: ['react', 'performance', 'optimization'],
    author: {
      name: 'Emily Chen',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    date: '18 Jul',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    url: '#',
  },
]

export const BlogComponent = ({
  subheading = 'Thoughts on building, designing, and shipping. Sometimes technical, always useful.',
  posts = defaultPosts,
}: BlogComponentProps) => {
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Where <span className="text-primary">builders</span> think out loud
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            {subheading}
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-12">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group grid gap-8 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_480px]"
            >
              {/* Content */}
              <div className="flex flex-col justify-center space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-primary md:text-3xl lg:text-4xl">
                  <a href={post.url} className="hover:underline">
                    {post.title}
                  </a>
                </h2>

                {/* Description */}
                <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
                  {post.description}
                </p>

                {/* Author & Date */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="size-10 rounded-full object-cover ring-2 ring-border"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{post.author.name}</span>
                      <span className="text-muted-foreground text-xs">{post.date}</span>
                    </div>
                  </div>

                  <div className="ml-auto">
                    <a
                      href={post.url}
                      className="text-foreground hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      Read more
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="order-first md:order-last">
                <a
                  href={post.url}
                  className="block overflow-hidden rounded-2xl bg-primary/10"
                >
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="size-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
                      loading="lazy"
                    />
                  </div>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
