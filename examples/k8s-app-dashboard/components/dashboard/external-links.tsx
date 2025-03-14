"use client"

import type { ExternalLink } from "@/lib/kubernetes-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLinkIcon, Github, GitBranch, LineChart } from "lucide-react"

interface ExternalLinksProps {
  externalLinks: ExternalLink[]
}

export function ExternalLinks({ externalLinks }: ExternalLinksProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "LineChart":
        return <LineChart className="h-4 w-4" />
      case "Github":
        return <Github className="h-4 w-4" />
      case "GitBranch":
        return <GitBranch className="h-4 w-4" />
      case "BookOpen":
        return <BookOpen className="h-4 w-4" />
      default:
        return <ExternalLinkIcon className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>外部リンク</CardTitle>
        <CardDescription>関連するツールとリソース</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {externalLinks.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto flex flex-col items-start p-4 gap-2 text-left"
              onClick={() => window.open(link.url, "_blank")}
            >
              <div className="flex items-center gap-2">
                {getIcon(link.icon)}
                <span className="font-medium">{link.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{link.description}</p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

