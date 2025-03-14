"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ExternalLink, GitBranch, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ArgoAppInfo } from "@/lib/kubernetes-types"

interface ArgoApplicationsProps {
  argoAppInfo: ArgoAppInfo[]
}

export function ArgoApplications({ argoAppInfo }: ArgoApplicationsProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const openArgoCD = (appName: string) => {
    window.open(`https://argocd.example.com/applications/${appName}`, "_blank")
  }

  const columns: ColumnDef<ArgoAppInfo>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="全て選択"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="行を選択"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            名前
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "namespace",
      header: "名前空間",
      cell: ({ row }) => <div>{row.getValue("namespace")}</div>,
    },
    {
      accessorKey: "project",
      header: "プロジェクト",
      cell: ({ row }) => <div>{row.getValue("project")}</div>,
    },
    {
      accessorKey: "status",
      header: "ステータス",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={
              status === "Synced"
                ? "default"
                : status === "OutOfSync"
                  ? "secondary"
                  : status === "Progressing"
                    ? "outline"
                    : "destructive"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "health",
      header: "ヘルス",
      cell: ({ row }) => {
        const health = row.getValue("health") as string
        return (
          <Badge
            variant={
              health === "Healthy"
                ? "default"
                : health === "Progressing"
                  ? "outline"
                  : health === "Suspended"
                    ? "secondary"
                    : "destructive"
            }
          >
            {health}
          </Badge>
        )
      },
    },
    {
      accessorKey: "syncStatus",
      header: "同期状態",
      cell: ({ row }) => {
        const syncStatus = row.getValue("syncStatus") as string
        return <Badge variant={syncStatus === "Synced" ? "default" : "secondary"}>{syncStatus}</Badge>
      },
    },
    {
      accessorKey: "targetRevision",
      header: "リビジョン",
      cell: ({ row }) => {
        const targetRevision = row.getValue("targetRevision") as string
        return (
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span>{targetRevision}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const app = row.original

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => openArgoCD(app.name)}
            >
              <ExternalLink className="h-3 w-3" />
              <span>ArgoCD</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">メニューを開く</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>アクション</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(app.name)}>
                  名前をコピー
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open(app.repository, "_blank")}>
                  リポジトリを開く
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openArgoCD(app.name)}>ArgoCDで開く</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: argoAppInfo,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>ArgoCD アプリケーション</CardTitle>
        <CardDescription>GitOpsで管理されているアプリケーションとその状態</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="アプリケーション名でフィルタ..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  表示列 <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id === "name"
                          ? "名前"
                          : column.id === "namespace"
                            ? "名前空間"
                            : column.id === "project"
                              ? "プロジェクト"
                              : column.id === "status"
                                ? "ステータス"
                                : column.id === "health"
                                  ? "ヘルス"
                                  : column.id === "syncStatus"
                                    ? "同期状態"
                                    : column.id === "targetRevision"
                                      ? "リビジョン"
                                      : column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      結果がありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} 行を選択
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                前へ
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                次へ
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

