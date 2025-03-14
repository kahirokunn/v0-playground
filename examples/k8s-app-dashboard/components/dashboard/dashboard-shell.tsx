import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex-1 items-start gap-4 p-4 md:p-8">
      <div className="flex flex-col space-y-6">{children}</div>
    </div>
  )
}

