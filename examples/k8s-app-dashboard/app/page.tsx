import { Suspense } from "react"
import type { Metadata } from "next"
import KubernetesDashboard from "@/components/kubernetes-dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export const metadata: Metadata = {
  title: "Kubernetes Dashboard",
  description: "高機能Kubernetesダッシュボード",
}

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Suspense fallback={<DashboardSkeleton />}>
          <KubernetesDashboard />
        </Suspense>
      </main>
    </div>
  )
}

