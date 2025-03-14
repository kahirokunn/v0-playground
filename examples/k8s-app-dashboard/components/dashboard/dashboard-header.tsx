"use client"

import { RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardHeaderProps {
  heading: string
  text?: string
  selectedCluster: string
  setSelectedCluster: (cluster: string) => void
  selectedNamespace: string
  setSelectedNamespace: (namespace: string) => void
  onRefresh: () => void
  isLoading: boolean
}

export function DashboardHeader({
  heading,
  text,
  selectedCluster,
  setSelectedCluster,
  selectedNamespace,
  setSelectedNamespace,
  onRefresh,
  isLoading,
}: DashboardHeaderProps) {
  const clusters = ["production", "staging", "development"]
  const namespaces = ["default", "kube-system", "monitoring", "application", "database"]

  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Select value={selectedCluster} onValueChange={setSelectedCluster}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="クラスター選択" />
          </SelectTrigger>
          <SelectContent>
            {clusters.map((cluster) => (
              <SelectItem key={cluster} value={cluster}>
                {cluster}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="名前空間選択" />
          </SelectTrigger>
          <SelectContent>
            {namespaces.map((namespace) => (
              <SelectItem key={namespace} value={namespace}>
                {namespace}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className={isLoading ? "animate-spin" : ""}
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">更新</span>
        </Button>
      </div>
    </div>
  )
}

