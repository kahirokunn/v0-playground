"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ClusterInfo, PodInfo, DeploymentInfo, ResourceUsage } from "@/lib/kubernetes-types"

interface OverviewProps {
  clusterInfo: ClusterInfo
  resourceUsage: ResourceUsage
  podsInfo: PodInfo[]
  deploymentsInfo: DeploymentInfo[]
}

export function Overview({ clusterInfo, resourceUsage, podsInfo, deploymentsInfo }: OverviewProps) {
  // ポッドステータスの集計
  const podStatusCounts = podsInfo.reduce(
    (acc, pod) => {
      acc[pod.status] = (acc[pod.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // デプロイメントの健全性チェック
  const healthyDeployments = deploymentsInfo.filter((d) => d.availableReplicas === d.desiredReplicas).length

  // リソース使用率の計算
  const cpuUsagePercentage = Math.round((resourceUsage.cpuUsage / resourceUsage.cpuLimit) * 100)
  const memoryUsagePercentage = Math.round((resourceUsage.memoryUsage / resourceUsage.memoryLimit) * 100)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">クラスターステータス</CardTitle>
          <Badge variant={clusterInfo.status === "Healthy" ? "default" : "destructive"}>{clusterInfo.status}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clusterInfo.name}</div>
          <p className="text-xs text-muted-foreground">Kubernetes v{clusterInfo.version}</p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            ノード数: {clusterInfo.nodeCount} | リージョン: {clusterInfo.region}
          </p>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ポッド</CardTitle>
          <Badge>{podsInfo.length} 合計</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{podStatusCounts["Running"] || 0} 実行中</div>
          <p className="text-xs text-muted-foreground">
            {podStatusCounts["Pending"] || 0} 保留中 | {podStatusCounts["Failed"] || 0} 失敗
          </p>
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <Progress value={((podStatusCounts["Running"] || 0) / podsInfo.length) * 100} className="h-2" />
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">デプロイメント</CardTitle>
          <Badge>{deploymentsInfo.length} 合計</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{healthyDeployments} 健全</div>
          <p className="text-xs text-muted-foreground">{deploymentsInfo.length - healthyDeployments} 問題あり</p>
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <Progress value={(healthyDeployments / deploymentsInfo.length) * 100} className="h-2" />
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">リソース使用率</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cpuUsagePercentage}% CPU</div>
          <p className="text-xs text-muted-foreground">{memoryUsagePercentage}% メモリ</p>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-1">
            <Progress value={cpuUsagePercentage} className="h-1" />
            <Progress value={memoryUsagePercentage} className="h-1" />
          </div>
        </CardFooter>
      </Card>
      <Card className="col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>リソース使用率の推移</CardTitle>
          <CardDescription>過去24時間のCPUとメモリ使用率</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              cpu: {
                label: "CPU使用率",
                color: "hsl(var(--chart-1))",
              },
              memory: {
                label: "メモリ使用率",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resourceUsage.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
                  }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="var(--color-cpu)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="var(--color-memory)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>名前空間リソース分布</CardTitle>
          <CardDescription>名前空間ごとのリソース使用率</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              cpu: {
                label: "CPU使用率",
                color: "hsl(var(--chart-1))",
              },
              memory: {
                label: "メモリ使用率",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceUsage.namespaceUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="namespace" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="cpu" fill="var(--color-cpu)" name="CPU" />
                <Bar dataKey="memory" fill="var(--color-memory)" name="メモリ" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

