"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { Pods } from "@/components/dashboard/pods"
import { Deployments } from "@/components/dashboard/deployments"
import { Services } from "@/components/dashboard/services"
import { Events } from "@/components/dashboard/events"
import { CronJobs } from "@/components/dashboard/cron-jobs"
import { ArgoApplications } from "@/components/dashboard/argo-applications"
import { PodValidation } from "@/components/dashboard/pod-validation"
import { ExternalLinks } from "@/components/dashboard/external-links"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useKubernetesData } from "@/lib/kubernetes-data"
import { Toaster } from "@/components/ui/toaster"

export default function KubernetesDashboard() {
  const [selectedNamespace, setSelectedNamespace] = useState<string>("default")
  const [selectedCluster, setSelectedCluster] = useState<string>("production")
  const {
    clusterInfo,
    podsInfo,
    deploymentsInfo,
    servicesInfo,
    eventsInfo,
    resourceUsage,
    cronJobInfo,
    argoAppInfo,
    validationResults,
    validationRules,
    externalLinks,
    isLoading,
    refresh,
    createJobFromCronJob,
    restartPod,
  } = useKubernetesData(selectedCluster, selectedNamespace)

  return (
    <DashboardShell>
      <Toaster />
      <DashboardHeader
        heading="Kubernetesダッシュボード"
        text="クラスターの状態とリソースを監視"
        selectedCluster={selectedCluster}
        setSelectedCluster={setSelectedCluster}
        selectedNamespace={selectedNamespace}
        setSelectedNamespace={setSelectedNamespace}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      <ExternalLinks externalLinks={externalLinks} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="pods">ポッド</TabsTrigger>
          <TabsTrigger value="deployments">デプロイメント</TabsTrigger>
          <TabsTrigger value="services">サービス</TabsTrigger>
          <TabsTrigger value="cronjobs">CronJob</TabsTrigger>
          <TabsTrigger value="argocd">ArgoCD</TabsTrigger>
          <TabsTrigger value="validation">検証</TabsTrigger>
          <TabsTrigger value="events">イベント</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview
            clusterInfo={clusterInfo}
            resourceUsage={resourceUsage}
            podsInfo={podsInfo}
            deploymentsInfo={deploymentsInfo}
          />
        </TabsContent>
        <TabsContent value="pods" className="space-y-4">
          <Pods podsInfo={podsInfo} />
        </TabsContent>
        <TabsContent value="deployments" className="space-y-4">
          <Deployments deploymentsInfo={deploymentsInfo} />
        </TabsContent>
        <TabsContent value="services" className="space-y-4">
          <Services servicesInfo={servicesInfo} />
        </TabsContent>
        <TabsContent value="cronjobs" className="space-y-4">
          <CronJobs cronJobInfo={cronJobInfo} createJobFromCronJob={createJobFromCronJob} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="argocd" className="space-y-4">
          <ArgoApplications argoAppInfo={argoAppInfo} />
        </TabsContent>
        <TabsContent value="validation" className="space-y-4">
          <PodValidation
            validationResults={validationResults}
            validationRules={validationRules}
            restartPod={restartPod}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="events" className="space-y-4">
          <Events eventsInfo={eventsInfo} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

