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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Play } from "lucide-react"
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
import type { CronJobInfo } from "@/lib/kubernetes-types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

interface CronJobsProps {
  cronJobInfo: CronJobInfo[]
  createJobFromCronJob: (cronJobName: string) => void
  isLoading: boolean
}

export function CronJobs({ cronJobInfo, createJobFromCronJob, isLoading }: CronJobsProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedCronJob, setSelectedCronJob] = useState<string | null>(null)

  const handleCreateJob = (cronJobName: string) => {
    createJobFromCronJob(cronJobName)
    toast({
      title: "ジョブを作成しました",
      description: `CronJob ${cronJobName} からジョブを作成しました`,
    })
  }

  const columns: ColumnDef<CronJobInfo>[] = [
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
      accessorKey: "schedule",
      header: "スケジュール",
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("schedule")}</div>,
    },
    {
      accessorKey: "suspend",
      header: "状態",
      cell: ({ row }) => {
        const suspended = row.getValue("suspend") as boolean
        return <Badge variant={suspended ? "outline" : "default"}>{suspended ? "停止中" : "有効"}</Badge>
      },
    },
    {
      accessorKey: "active",
      header: "アクティブ",
      cell: ({ row }) => <div className="text-center">{row.getValue("active")}</div>,
    },
    {
      accessorKey: "lastSchedule",
      header: "最終実行",
      cell: ({ row }) => <div>{row.getValue("lastSchedule")}</div>,
    },
    {
      accessorKey: "lastSuccessfulTime",
      header: "最終成功",
      cell: ({ row }) => <div>{row.getValue("lastSuccessfulTime") || "-"}</div>,
    },
    {
      accessorKey: "age",
      header: "経過時間",
      cell: ({ row }) => <div>{row.getValue("age")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const cronJob = row.original

        return (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedCronJob(cronJob.name)}
                  disabled={isLoading || cronJob.suspend}
                >
                  <Play className="h-4 w-4" />
                  <span className="sr-only">ジョブを作成</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ジョブの作成</AlertDialogTitle>
                  <AlertDialogDescription>
                    CronJob {cronJob.name} からジョブを手動で作成しますか？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleCreateJob(cronJob.name)}>作成</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">メニューを開く</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>アクション</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(cronJob.name)}>
                  名前をコピー
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>詳細を表示</DropdownMenuItem>
                <DropdownMenuItem>ログを表示</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: cronJobInfo,
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
        <CardTitle>CronJob</CardTitle>
        <CardDescription>スケジュールされたジョブとその実行状況</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="CronJob名でフィルタ..."
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
                            : column.id === "schedule"
                              ? "スケジュール"
                              : column.id === "suspend"
                                ? "状態"
                                : column.id === "active"
                                  ? "アクティブ"
                                  : column.id === "lastSchedule"
                                    ? "最終実行"
                                    : column.id === "lastSuccessfulTime"
                                      ? "最終成功"
                                      : column.id === "age"
                                        ? "経過時間"
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

