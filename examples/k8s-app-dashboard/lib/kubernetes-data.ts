"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  ClusterInfo,
  PodInfo,
  DeploymentInfo,
  ServiceInfo,
  EventInfo,
  ResourceUsage,
  CronJobInfo,
  ArgoAppInfo,
  ValidationRule,
  ValidationResult,
  ExternalLink,
} from "./kubernetes-types"

// 許可されたイメージレジストリのホワイトリスト
const ALLOWED_REGISTRIES = ["registry.example.com", "docker.io/library", "k8s.gcr.io", "gcr.io", "quay.io", "ghcr.io"]

// 検証ルール
const VALIDATION_RULES: ValidationRule[] = [
  {
    id: "registry-whitelist",
    name: "許可されたレジストリの使用",
    description: "イメージはホワイトリストに登録されたレジストリからのみ取得する必要があります",
    severity: "high",
    category: "security",
  },
  {
    id: "non-root-user",
    name: "非rootユーザーでの実行",
    description: "コンテナは非rootユーザーとして実行する必要があります",
    severity: "high",
    category: "security",
  },
  {
    id: "readonly-filesystem",
    name: "読み取り専用ルートファイルシステム",
    description: "コンテナのルートファイルシステムは読み取り専用にする必要があります",
    severity: "medium",
    category: "security",
  },
  {
    id: "resource-limits",
    name: "リソース制限の設定",
    description: "コンテナにはCPUとメモリの制限を設定する必要があります",
    severity: "medium",
    category: "cost",
  },
  {
    id: "resource-requests",
    name: "リソース要求の設定",
    description: "コンテナにはCPUとメモリの要求を設定する必要があります",
    severity: "medium",
    category: "reliability",
  },
]

// 外部リンク
const EXTERNAL_LINKS: ExternalLink[] = [
  {
    name: "Grafana",
    url: "https://grafana.example.com/d/k8s-cluster-overview",
    description: "Kubernetesクラスターの監視ダッシュボード",
    category: "monitoring",
    icon: "LineChart",
  },
  {
    name: "GitHub",
    url: "https://github.com/example/kubernetes-apps",
    description: "Kubernetesアプリケーションのソースコード",
    category: "repository",
    icon: "Github",
  },
  {
    name: "ArgoCD",
    url: "https://argocd.example.com",
    description: "GitOpsデプロイメント管理",
    category: "monitoring",
    icon: "GitBranch",
  },
  {
    name: "ドキュメント",
    url: "https://docs.example.com/kubernetes",
    description: "Kubernetes運用ドキュメント",
    category: "documentation",
    icon: "BookOpen",
  },
]

// モックデータ生成関数
const generateMockData = (cluster: string, namespace: string) => {
  // クラスター情報
  const clusterInfo: ClusterInfo = {
    name: cluster,
    status: Math.random() > 0.9 ? "Warning" : "Healthy",
    version: "1.28.3",
    nodeCount: cluster === "production" ? 5 : cluster === "staging" ? 3 : 1,
    region: cluster === "production" ? "tokyo" : cluster === "staging" ? "osaka" : "local",
  }

  // ポッド情報
  const podStatuses = ["Running", "Pending", "Failed"]
  const podsInfo: PodInfo[] = Array.from({ length: 20 }, (_, i) => {
    const registry =
      Math.random() > 0.85
        ? "unauthorized-registry.example.com"
        : ALLOWED_REGISTRIES[Math.floor(Math.random() * ALLOWED_REGISTRIES.length)]

    const image = `${registry}/${namespace}/app-${i + 1}:v${Math.floor(Math.random() * 10) + 1}`

    return {
      name: `${namespace}-pod-${i + 1}`,
      namespace: namespace,
      status: i < 17 ? "Running" : podStatuses[Math.floor(Math.random() * podStatuses.length)],
      restarts: Math.floor(Math.random() * 5),
      age: `${Math.floor(Math.random() * 30) + 1}d`,
      cpu: `${Math.floor(Math.random() * 500)}m`,
      memory: `${Math.floor(Math.random() * 512)}Mi`,
      image: image,
      securityContext: {
        runAsNonRoot: Math.random() > 0.2,
        readOnlyRootFilesystem: Math.random() > 0.4,
        privileged: Math.random() < 0.1,
      },
      resources: {
        limits:
          Math.random() > 0.3
            ? {
                cpu: `${Math.floor(Math.random() * 1000) + 500}m`,
                memory: `${Math.floor(Math.random() * 1024) + 256}Mi`,
              }
            : undefined,
        requests:
          Math.random() > 0.2
            ? {
                cpu: `${Math.floor(Math.random() * 500) + 100}m`,
                memory: `${Math.floor(Math.random() * 512) + 128}Mi`,
              }
            : undefined,
      },
    }
  })

  // デプロイメント情報
  const deploymentsInfo: DeploymentInfo[] = Array.from({ length: 8 }, (_, i) => {
    const desiredReplicas = Math.floor(Math.random() * 5) + 1
    return {
      name: `${namespace}-deploy-${i + 1}`,
      namespace: namespace,
      desiredReplicas: desiredReplicas,
      availableReplicas: Math.random() > 0.8 ? desiredReplicas - 1 : desiredReplicas,
      age: `${Math.floor(Math.random() * 60) + 1}d`,
      image: `registry.example.com/${namespace}/app-${i + 1}:v${Math.floor(Math.random() * 10) + 1}`,
    }
  })

  // サービス情報
  const serviceTypes = ["ClusterIP", "NodePort", "LoadBalancer"]
  const servicesInfo: ServiceInfo[] = Array.from({ length: 6 }, (_, i) => {
    const type = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
    return {
      name: `${namespace}-svc-${i + 1}`,
      namespace: namespace,
      type: type,
      clusterIP: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      externalIP:
        type === "LoadBalancer" ? `203.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : "",
      ports: Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => `${Math.floor(Math.random() * 60000) + 1000}:${Math.floor(Math.random() * 60000) + 1000}/TCP`,
      ),
      age: `${Math.floor(Math.random() * 90) + 1}d`,
    }
  })

  // イベント情報
  const eventTypes = ["Normal", "Warning"]
  const eventReasons = ["Created", "Started", "Pulled", "Killing", "BackOff", "Failed", "Unhealthy", "NodeNotReady"]
  const objectKinds = ["Pod", "Deployment", "Node", "Service", "ReplicaSet"]
  const eventsInfo: EventInfo[] = Array.from({ length: 30 }, (_, i) => {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const reason = eventReasons[Math.floor(Math.random() * eventReasons.length)]
    const kind = objectKinds[Math.floor(Math.random() * objectKinds.length)]
    const name = `${namespace}-${kind.toLowerCase()}-${Math.floor(Math.random() * 10) + 1}`

    const count = Math.floor(Math.random() * 10) + 1
    const firstSeenHours = Math.floor(Math.random() * 24)
    const lastSeenHours = Math.floor(Math.random() * firstSeenHours)

    return {
      type: type,
      reason: reason,
      object: {
        kind: kind,
        name: name,
      },
      message: `${reason}: ${kind} ${name} ${type === "Normal" ? "is healthy" : "has issues"}`,
      count: count,
      firstSeen: `${firstSeenHours}h ago`,
      lastSeen: `${lastSeenHours}h ago`,
    }
  }).sort((a, b) => {
    // Warningを上位に表示
    if (a.type === "Warning" && b.type !== "Warning") return -1
    if (a.type !== "Warning" && b.type === "Warning") return 1
    return 0
  })

  // リソース使用率
  const cpuLimit = cluster === "production" ? 16000 : cluster === "staging" ? 8000 : 4000
  const memoryLimit = cluster === "production" ? 32768 : cluster === "staging" ? 16384 : 8192
  const cpuUsage = Math.floor(Math.random() * (cpuLimit * 0.8)) + cpuLimit * 0.1
  const memoryUsage = Math.floor(Math.random() * (memoryLimit * 0.8)) + memoryLimit * 0.1

  // 過去24時間のリソース使用率履歴
  const now = new Date()
  const history = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString()
    return {
      timestamp,
      cpu: Math.floor(Math.random() * 80) + 10,
      memory: Math.floor(Math.random() * 80) + 10,
    }
  })

  // 名前空間ごとのリソース使用率
  const namespaces = ["default", "kube-system", "monitoring", "application", "database"]
  const namespaceUsage = namespaces.map((ns) => ({
    namespace: ns,
    cpu: Math.floor(Math.random() * 80) + 10,
    memory: Math.floor(Math.random() * 80) + 10,
  }))

  const resourceUsage: ResourceUsage = {
    cpuUsage,
    cpuLimit,
    memoryUsage,
    memoryLimit,
    history,
    namespaceUsage,
  }

  // CronJob情報
  const cronJobInfo: CronJobInfo[] = Array.from({ length: 6 }, (_, i) => {
    const schedules = ["*/5 * * * *", "0 */1 * * *", "0 0 * * *", "0 0 * * 0", "0 0 1 * *"]
    return {
      name: `${namespace}-cronjob-${i + 1}`,
      namespace: namespace,
      schedule: schedules[Math.floor(Math.random() * schedules.length)],
      suspend: Math.random() > 0.9,
      active: Math.floor(Math.random() * 2),
      lastSchedule: Math.random() > 0.2 ? `${Math.floor(Math.random() * 24)}h ago` : "-",
      age: `${Math.floor(Math.random() * 90) + 1}d`,
      lastSuccessfulTime: Math.random() > 0.3 ? `${Math.floor(Math.random() * 24)}h ago` : undefined,
    }
  })

  // ArgoCD アプリケーション情報
  const argoAppStatuses = ["Synced", "OutOfSync", "Progressing", "Degraded"]
  const argoHealthStatuses = ["Healthy", "Progressing", "Degraded", "Suspended"]
  const argoSyncStatuses = ["Synced", "OutOfSync"]

  const argoAppInfo: ArgoAppInfo[] = Array.from({ length: 8 }, (_, i) => {
    const status = argoAppStatuses[Math.floor(Math.random() * argoAppStatuses.length)]
    const health = argoHealthStatuses[Math.floor(Math.random() * argoHealthStatuses.length)]
    const syncStatus = argoSyncStatuses[Math.floor(Math.random() * argoSyncStatuses.length)]

    return {
      name: `${namespace}-app-${i + 1}`,
      namespace: namespace,
      project: ["default", "infrastructure", "applications"][Math.floor(Math.random() * 3)],
      status: status,
      health: health,
      syncStatus: syncStatus,
      repository: "https://github.com/example/kubernetes-apps",
      path: `apps/${namespace}/${namespace}-app-${i + 1}`,
      targetRevision: "main",
      conditions:
        status !== "Synced" || health !== "Healthy"
          ? ["ResourcesOutOfSync", "ComparisonError", "SyncError"].slice(0, Math.floor(Math.random() * 3) + 1)
          : undefined,
    }
  })

  // Pod検証結果
  const validationResults: ValidationResult[] = podsInfo.map((pod) => {
    const isRegistryAllowed = ALLOWED_REGISTRIES.some((registry) => pod.image.startsWith(registry))

    return {
      podName: pod.name,
      namespace: pod.namespace,
      validations: [
        {
          ruleId: "registry-whitelist",
          status: isRegistryAllowed ? "pass" : "fail",
          message: isRegistryAllowed
            ? "許可されたレジストリからイメージを使用しています"
            : "未許可のレジストリからイメージを使用しています",
          details: pod.image,
        },
        {
          ruleId: "non-root-user",
          status: pod.securityContext?.runAsNonRoot ? "pass" : "fail",
          message: pod.securityContext?.runAsNonRoot
            ? "非rootユーザーとして実行されています"
            : "rootユーザーとして実行されています",
        },
        {
          ruleId: "readonly-filesystem",
          status: pod.securityContext?.readOnlyRootFilesystem ? "pass" : "warning",
          message: pod.securityContext?.readOnlyRootFilesystem
            ? "読み取り専用ファイルシステムを使用しています"
            : "読み取り専用ファイルシステムを使用していません",
        },
        {
          ruleId: "resource-limits",
          status: pod.resources?.limits ? "pass" : "warning",
          message: pod.resources?.limits ? "リソース制限が設定されています" : "リソース制限が設定されていません",
          details: pod.resources?.limits
            ? `CPU: ${pod.resources.limits.cpu}, Memory: ${pod.resources.limits.memory}`
            : undefined,
        },
        {
          ruleId: "resource-requests",
          status: pod.resources?.requests ? "pass" : "warning",
          message: pod.resources?.requests ? "リソース要求が設定されています" : "リソース要求が設定されていません",
          details: pod.resources?.requests
            ? `CPU: ${pod.resources.requests.cpu}, Memory: ${pod.resources.requests.memory}`
            : undefined,
        },
      ],
    }
  })

  return {
    clusterInfo,
    podsInfo,
    deploymentsInfo,
    servicesInfo,
    eventsInfo,
    resourceUsage,
    cronJobInfo,
    argoAppInfo,
    validationResults,
    validationRules: VALIDATION_RULES,
    externalLinks: EXTERNAL_LINKS,
  }
}

export function useKubernetesData(cluster: string, namespace: string) {
  const [data, setData] = useState(() => generateMockData(cluster, namespace))
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(() => {
    setIsLoading(true)

    // 実際のAPIリクエストの代わりにモックデータを生成
    setTimeout(() => {
      setData(generateMockData(cluster, namespace))
      setIsLoading(false)
    }, 1000)
  }, [cluster, namespace])

  // CronJobからJobを作成する関数
  const createJobFromCronJob = useCallback((cronJobName: string) => {
    setIsLoading(true)

    // 実際のAPIリクエストの代わりにモックデータを生成
    setTimeout(() => {
      // 実際の実装では、ここでKubernetes APIを呼び出してJobを作成します
      console.log(`Creating job from CronJob: ${cronJobName}`)

      // 新しいイベントを追加
      const newEvent: EventInfo = {
        type: "Normal",
        reason: "Created",
        object: {
          kind: "Job",
          name: `${cronJobName}-manual-${Math.floor(Date.now() / 1000)}`,
        },
        message: `Created Job ${cronJobName}-manual from CronJob ${cronJobName}`,
        count: 1,
        firstSeen: "Just now",
        lastSeen: "Just now",
      }

      setData((prevData) => ({
        ...prevData,
        eventsInfo: [newEvent, ...prevData.eventsInfo],
      }))

      setIsLoading(false)
    }, 1000)
  }, [])

  // Podを再起動する関数
  const restartPod = useCallback((podName: string, namespace: string) => {
    setIsLoading(true)

    // 実際のAPIリクエストの代わりにモックデータを生成
    setTimeout(() => {
      // 実際の実装では、ここでKubernetes APIを呼び出してPodを削除します
      console.log(`Restarting pod: ${podName} in namespace: ${namespace}`)

      // 新しいイベントを追加
      const newEvent: EventInfo = {
        type: "Normal",
        reason: "Killing",
        object: {
          kind: "Pod",
          name: podName,
        },
        message: `Restarting Pod ${podName}`,
        count: 1,
        firstSeen: "Just now",
        lastSeen: "Just now",
      }

      setData((prevData) => ({
        ...prevData,
        eventsInfo: [newEvent, ...prevData.eventsInfo],
        podsInfo: prevData.podsInfo.map((pod) =>
          pod.name === podName && pod.namespace === namespace
            ? { ...pod, status: "Pending", restarts: pod.restarts + 1 }
            : pod,
        ),
      }))

      setIsLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    fetchData()

    // 30秒ごとに自動更新
    const intervalId = setInterval(fetchData, 30000)

    return () => clearInterval(intervalId)
  }, [fetchData])

  return {
    ...data,
    isLoading,
    refresh: fetchData,
    createJobFromCronJob,
    restartPod,
  }
}

