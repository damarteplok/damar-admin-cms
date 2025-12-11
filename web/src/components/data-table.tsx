import * as React from 'react'
import { useTranslation } from 'react-i18next'
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
  VisibilityState,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
} from 'lucide-react'

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
  // Server-side pagination props
  totalItems?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  // Server-side sorting props
  onSortChange?: (columnId: string, order: 'asc' | 'desc') => void
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
  totalItems,
  totalPages,
  onPageChange,
  onSortChange, // TODO: Implement column header sorting
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [searchInputValue, setSearchInputValue] = React.useState('')
  const [isDebouncing, setIsDebouncing] = React.useState(false)
  const [currentSortColumn, setCurrentSortColumn] = React.useState<
    string | null
  >(null)
  const [currentSortOrder, setCurrentSortOrder] = React.useState<
    'asc' | 'desc'
  >('asc')

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
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
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

  const handleSort = (columnId: string) => {
    if (!onSortChange) return

    let newOrder: 'asc' | 'desc' = 'asc'

    if (currentSortColumn === columnId) {
      // Toggle order if clicking same column
      newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc'
    }

    setCurrentSortColumn(columnId)
    setCurrentSortOrder(newOrder)
    onSortChange(columnId, newOrder)
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
        {canAdd && <Button onClick={onAddClick}>{addButtonTitle}</Button>}
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
                {t('datatable.typing', { defaultValue: 'Typing...' })}
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Settings2 className="h-4 w-4" />
                {t('datatable.columns', { defaultValue: 'Columns' })}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Table Section */}
      <div
        className={`rounded-md border bg-card ${isLoading ? 'opacity-50' : ''}`}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort =
                    serverSideSearch &&
                    onSortChange &&
                    header.id !== 'rowNumber' &&
                    header.id !== 'actions'
                  const isSorted = currentSortColumn === header.id

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 data-[state=open]:bg-accent"
                          onClick={() => handleSort(header.id)}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {isSorted ? (
                            currentSortOrder === 'asc' ? (
                              <ArrowUp className="ml-2 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-2 h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  )
                })}
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
                  {t('datatable.no_results', {
                    defaultValue: 'No results found.',
                  })}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {serverSideSearch && totalItems !== undefined ? (
            <>
              {t('datatable.showing', { defaultValue: 'Showing' })}{' '}
              {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{' '}
              {t('datatable.to', { defaultValue: 'to' })}{' '}
              {Math.min(currentPage * pageSize, totalItems)}{' '}
              {t('datatable.of', { defaultValue: 'of' })} {totalItems}{' '}
              {t('datatable.results', { defaultValue: 'results' })}
            </>
          ) : (
            <>
              {t('datatable.showing', { defaultValue: 'Showing' })}{' '}
              {table.getState().pagination.pageIndex + 1}{' '}
              {t('datatable.of', { defaultValue: 'of' })} {table.getPageCount()}{' '}
              {t('datatable.pages', { defaultValue: 'page(s)' })}
            </>
          )}
        </div>

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('datatable.rows_per_page', { defaultValue: 'Rows per page' })}:
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
            onClick={() => {
              if (serverSideSearch && onPageChange) {
                onPageChange(currentPage - 1)
              } else {
                table.previousPage()
              }
            }}
            disabled={
              serverSideSearch ? currentPage <= 1 : !table.getCanPreviousPage()
            }
          >
            <ChevronLeft className="h-4 w-4" />
            {t('datatable.previous', { defaultValue: 'Previous' })}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (serverSideSearch && onPageChange) {
                onPageChange(currentPage + 1)
              } else {
                table.nextPage()
              }
            }}
            disabled={
              serverSideSearch && totalPages
                ? currentPage >= totalPages
                : !table.getCanNextPage()
            }
          >
            {t('datatable.next', { defaultValue: 'Next' })}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
