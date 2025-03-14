export interface ClusterInfo {
  name: string
  status: string
  version: string
  nodeCount: number
  region: string
}

export interface PodInfo {
  name: string
  namespace: string
  status: string
  restarts: number
  age: string
  cpu: string
  memory: string
  image: string
  securityContext?: {
    runAsNonRoot?: boolean
    readOnlyRootFilesystem?: boolean
    privileged?: boolean
  }
  resources?: {
    limits?: {
      cpu?: string
      memory?: string
    }
    requests?: {
      cpu?: string
      memory?: string
    }
  }
}

export interface DeploymentInfo {
  name: string
  namespace: string
  desiredReplicas: number
  availableReplicas: number
  age: string
  image: string
}

export interface ServiceInfo {
  name: string
  namespace: string
  type: string
  clusterIP: string
  externalIP: string
  ports: string[]
  age: string
}

export interface EventInfo {
  type: string
  reason: string
  object: {
    kind: string
    name: string
  }
  message: string
  count: number
  firstSeen: string
  lastSeen: string
}

export interface ResourceUsageHistory {
  timestamp: string
  cpu: number
  memory: number
}

export interface NamespaceResourceUsage {
  namespace: string
  cpu: number
  memory: number
}

export interface ResourceUsage {
  cpuUsage: number
  cpuLimit: number
  memoryUsage: number
  memoryLimit: number
  history: ResourceUsageHistory[]
  namespaceUsage: NamespaceResourceUsage[]
}

export interface CronJobInfo {
  name: string
  namespace: string
  schedule: string
  suspend: boolean
  active: number
  lastSchedule: string
  age: string
  lastSuccessfulTime?: string
}

export interface ArgoAppInfo {
  name: string
  namespace: string
  project: string
  status: string
  health: string
  syncStatus: string
  repository: string
  path: string
  targetRevision: string
  conditions?: string[]
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  category: "security" | "cost" | "reliability" | "best-practice"
}

export interface ValidationResult {
  podName: string
  namespace: string
  validations: {
    ruleId: string
    status: "pass" | "fail" | "warning" | "info"
    message: string
    details?: string
  }[]
}

export interface ExternalLink {
  name: string
  url: string
  description: string
  category: "monitoring" | "repository" | "documentation" | "other"
  icon: string
}

