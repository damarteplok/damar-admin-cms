import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 h-44 rounded border border-muted p-2" />
      </CardContent>
    </Card>
  )
}

function AdminDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Start Date</CardTitle>
          </CardHeader>
          <CardContent>25/11/2024</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>End Date</CardTitle>
          </CardHeader>
          <CardContent>25/11/2025</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Period</CardTitle>
          </CardHeader>
          <CardContent>Month</CardContent>
        </Card>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="MRR"
          value="Rp 120.000,00"
          subtitle="Rp 60.000,00 increase"
        />
        <StatCard title="Active Subscriptions" value="1" />
        <StatCard title="Total revenue" value="Rp 10.000,00" />
        <StatCard
          title="Total user subscription conversion"
          value="3.57%"
          subtitle="subscribed / total users"
        />
        <StatCard title="Total Transactions" value="19" />
        <StatCard title="Total Users" value="28" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Monthly recurring revenue (MRR) overview" />
        <ChartCard title="Total Revenue overview" />
      </div>

      {/* Additional info blocks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average User Subscription Conversion</CardTitle>
            <CardDescription>
              Average User Subscription Conversion is the % of users who
              subscribed to a plan to the total users.
            </CardDescription>
          </CardHeader>
          <CardContent>Placeholder content</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Churn rate overview</CardTitle>
            <CardDescription>
              Churn rate is the % of users who cancel their subscription each
              month.
            </CardDescription>
          </CardHeader>
          <CardContent>Placeholder content</CardContent>
        </Card>
      </div>
    </div>
  )
}
