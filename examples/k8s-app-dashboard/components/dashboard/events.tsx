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
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { EventInfo } from "@/lib/kubernetes-types"

interface EventsProps {
  eventsInfo: EventInfo[]
}

export function Events({ eventsInfo }: EventsProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columns: ColumnDef<EventInfo>[] = [
    {
      accessorKey: "type",
      header: "タイプ",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return <Badge variant={type === "Normal" ? "outline" : "destructive"}>{type}</Badge>
      },
    },
    {
      accessorKey: "reason",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            理由
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("reason")}</div>,
    },
    {
      accessorKey: "object",
      header: "オブジェクト",
      cell: ({ row }) => {
        const object = row.getValue("object") as { kind: string; name: string }
        return (
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{object.kind}</Badge>
            <span className="font-medium">{object.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "message",
      header: "メッセージ",
      cell: ({ row }) => <div className="max-w-md truncate">{row.getValue("message")}</div>,
    },
    {
      accessorKey: "count",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            回数
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-center">{row.getValue("count")}</div>,
    },
    {
      accessorKey: "firstSeen",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            初回確認
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("firstSeen")}</div>,
    },
    {
      accessorKey: "lastSeen",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            最終確認
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("lastSeen")}</div>,
    },
  ]

  const table = useReactTable({
    data: eventsInfo,
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
        <CardTitle>イベント</CardTitle>
        <CardDescription>クラスター内のすべてのイベントとアラート</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="メッセージでフィルタ..."
              value={(table.getColumn("message")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("message")?.setFilterValue(event.target.value)}
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
                        {column.id === "type"
                          ? "タイプ"
                          : column.id === "reason"
                            ? "理由"
                            : column.id === "object"
                              ? "オブジェクト"
                              : column.id === "message"
                                ? "メッセージ"
                                : column.id === "count"
                                  ? "回数"
                                  : column.id === "firstSeen"
                                    ? "初回確認"
                                    : column.id === "lastSeen"
                                      ? "最終確認"
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

