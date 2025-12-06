import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  title: string
  description?: string
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
  canAdd?: boolean
  addButtonTitle?: string
  onAddClick?: () => void
  // Server-side search props
  serverSideSearch?: boolean
  onSearchChange?: (value: string) => void
  isLoading?: boolean
  // Pagination props for row number calculation
  showRowNumber?: boolean
  currentPage?: number
  pageSize?: number
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export function DataTable<TData, TValue>({
  title,
  description,
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchColumn,
  canAdd = false,
  addButtonTitle = 'Add',
  onAddClick,
  serverSideSearch = false,
  onSearchChange,
  isLoading = false,
  showRowNumber = true,
  currentPage = 1,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [searchInputValue, setSearchInputValue] = React.useState('')
  const [isDebouncing, setIsDebouncing] = React.useState(false)

  // Create row number column
  const rowNumberColumn: ColumnDef<TData, TValue> = {
    id: 'rowNumber',
    header: 'No',
    cell: ({ row }) => {
      const rowIndex = row.index
      const rowNumber = (currentPage - 1) * pageSize + rowIndex + 1
      return <div className="w-12 text-left font-medium">{rowNumber}</div>
    },
    size: 60,
  }

  // Combine row number column with user columns
  const allColumns = React.useMemo(
    () => (showRowNumber ? [rowNumberColumn, ...columns] : columns),
    [showRowNumber, columns, currentPage, pageSize],
  )

  React.useEffect(() => {
    if (serverSideSearch && onSearchChange) {
      setIsDebouncing(true)
      const timer = setTimeout(() => {
        onSearchChange(searchInputValue)
        setIsDebouncing(false)
      }, 500)
      return () => {
        clearTimeout(timer)
        setIsDebouncing(false)
      }
    }
  }, [searchInputValue, serverSideSearch, onSearchChange])

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    // Disable client-side features when using server-side search
    getPaginationRowModel: serverSideSearch
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: serverSideSearch ? undefined : getSortedRowModel(),
    getFilteredRowModel: serverSideSearch ? undefined : getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    // Manual pagination for server-side
    manualPagination: serverSideSearch,
    manualSorting: serverSideSearch,
    manualFiltering: serverSideSearch,
  })

  const handleSearchChange = (value: string) => {
    setSearchInputValue(value)

    // For client-side search, update table filter immediately
    if (!serverSideSearch && searchColumn) {
      table.getColumn(searchColumn)?.setFilterValue(value)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {canAdd && (
          <Button onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            {addButtonTitle}
          </Button>
        )}
      </div>

      {/* Search Section */}
      {searchColumn && (
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Input
              placeholder={searchPlaceholder}
              value={searchInputValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pr-20"
            />
            {serverSideSearch && isDebouncing && searchInputValue && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                Typing...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className={`rounded-md border ${isLoading ? 'opacity-50' : ''}`}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()} page(s)
        </div>

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
