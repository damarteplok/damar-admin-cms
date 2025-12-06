interface StatusPageProps {
  code: string | number
  message: string
  description?: string
  action?: React.ReactNode
}

export function StatusPage({
  code,
  message,
  description,
  action,
}: StatusPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 p-6">
        <div className="flex items-center justify-center gap-4 text-4xl font-bold">
          <span className="">{code}</span>
          <span className="">|</span>
          <span>{message}</span>
        </div>
        {description && <p className=" text-lg">{description}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  )
}
