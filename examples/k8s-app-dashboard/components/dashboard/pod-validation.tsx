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
import { ArrowUpDown, ChevronDown, MoreHorizontal, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { ValidationResult, ValidationRule } from "@/lib/kubernetes-types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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

interface PodValidationProps {
  validationResults: ValidationResult[]
  validationRules: ValidationRule[]
  restartPod: (podName: string, namespace: string) => void
  isLoading: boolean
}

export function PodValidation({ validationResults, validationRules, restartPod, isLoading }: PodValidationProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [selectedPod, setSelectedPod] = useState<{ name: string; namespace: string } | null>(null)

  const handleRestartPod = (podName: string, namespace: string) => {
    restartPod(podName, namespace)
    toast({
      title: "ポッドを再起動しています",
      description: `ポッド ${podName} を再起動しています`,
    })
  }

  // 検証結果の集計
  const getValidationSummary = (result: ValidationResult) => {
    const failCount = result.validations.filter((v) => v.status === "fail").length
    const warningCount = result.validations.filter((v) => v.status === "warning").length
    const passCount = result.validations.filter((v) => v.status === "pass").length

    let status: "critical" | "warning" | "success" = "success"
    if (failCount > 0) {
      status = "critical"
    } else if (warningCount > 0) {
      status = "warning"
    }

    return { failCount, warningCount, passCount, status }
  }

  const columns: ColumnDef<ValidationResult>[] = [
    {
      accessorKey: "podName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            ポッド名
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("podName")}</div>,
    },
    {
      accessorKey: "namespace",
      header: "名前空間",
      cell: ({ row }) => <div>{row.getValue("namespace")}</div>,
    },
    {
      id: "validationSummary",
      header: "検証結果",
      cell: ({ row }) => {
        const result = row.original
        const summary = getValidationSummary(result)

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={
                summary.status === "critical" ? "destructive" : summary.status === "warning" ? "outline" : "default"
              }
            >
              {summary.status === "critical" ? "重大な問題" : summary.status === "warning" ? "警告あり" : "合格"}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {summary.failCount > 0 && <span className="text-destructive">{summary.failCount} 失敗</span>}
              {summary.failCount > 0 && summary.warningCount > 0 && <span>, </span>}
              {summary.warningCount > 0 && <span className="text-yellow-500">{summary.warningCount} 警告</span>}
              {(summary.failCount > 0 || summary.warningCount > 0) && summary.passCount > 0 && <span>, </span>}
              {summary.passCount > 0 && <span>{summary.passCount} 合格</span>}
            </div>
          </div>
        )
      },
    },
    {
      id: "details",
      header: "詳細",
      cell: ({ row }) => {
        const result = row.original

        return (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-0">
              <AccordionTrigger className="py-1">
                <span className="text-xs">詳細を表示</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  {result.validations.map((validation, index) => {
                    const rule = validationRules.find((r) => r.id === validation.ruleId)
                    return (
                      <div key={index} className="border rounded-md p-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{rule?.name}</div>
                          <Badge
                            variant={
                              validation.status === "fail"
                                ? "destructive"
                                : validation.status === "warning"
                                  ? "outline"
                                  : "default"
                            }
                          >
                            {validation.status === "fail" ? "失敗" : validation.status === "warning" ? "警告" : "合格"}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground text-xs mt-1">{validation.message}</div>
                        {validation.details && (
                          <div className="text-xs mt-1 font-mono bg-muted p-1 rounded">{validation.details}</div>
                        )}
                        <div className="text-xs mt-1">
                          <span className="font-medium">重要度: </span>
                          <Badge variant="outline" className="ml-1">
                            {rule?.severity === "critical"
                              ? "重大"
                              : rule?.severity === "high"
                                ? "高"
                                : rule?.severity === "medium"
                                  ? "中"
                                  : rule?.severity === "low"
                                    ? "低"
                                    : "情報"}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const result = row.original

        return (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedPod({ name: result.podName, namespace: result.namespace })}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">ポッドを再起動</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ポッドの再起動</AlertDialogTitle>
                  <AlertDialogDescription>
                    ポッド {result.podName} を再起動しますか？この操作は元に戻せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleRestartPod(result.podName, result.namespace)}>
                    再起動
                  </AlertDialogAction>
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(result.podName)}>
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
    data: validationResults,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>ポッド検証</CardTitle>
        <CardDescription>ポッドの設定が推奨値に従っているかの検証結果</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="ポッド名でフィルタ..."
              value={(table.getColumn("podName")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("podName")?.setFilterValue(event.target.value)}
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
                        {column.id === "podName"
                          ? "ポッド名"
                          : column.id === "namespace"
                            ? "名前空間"
                            : column.id === "validationSummary"
                              ? "検証結果"
                              : column.id === "details"
                                ? "詳細"
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

