import { useState } from 'react'
import { useQuery, AnyVariables, TypedDocumentNode, gql } from 'urql'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SearchSelectOption {
  value: string
  label: string
}

interface SearchSelectProps {
  value?: string
  onChange: (value: string) => void
  query?: TypedDocumentNode<any, AnyVariables> | string
  queryKey?: string
  staticData?: any[] // Add support for static data
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  disabled?: boolean
  formatOption: (item: any) => SearchSelectOption
  className?: string
}

export function SearchSelect({
  value,
  onChange,
  query,
  queryKey,
  staticData,
  placeholder,
  emptyText,
  searchPlaceholder,
  disabled = false,
  formatOption,
  className,
}: SearchSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const defaultPlaceholder =
    placeholder ?? t('common.search_select.select_placeholder')
  const defaultEmptyText = emptyText ?? t('common.search_select.no_results')
  const defaultSearchPlaceholder =
    searchPlaceholder ?? t('common.search_select.search_placeholder')

  // Only use GraphQL query if no static data provided and query exists
  const shouldUseQuery = !staticData && query && query !== ''

  const [result] = useQuery({
    query: shouldUseQuery
      ? query
      : gql`
          query Placeholder {
            __typename
          }
        `,
    variables: {
      page: 1,
      perPage: 100,
      search: search || undefined,
    },
    // Fetch immediately if there's a value (for edit mode), then only when open
    pause: !shouldUseQuery,
  })

  const { data, fetching } = result

  // Use static data if provided, otherwise use query result
  const options: SearchSelectOption[] = staticData
    ? staticData
        .filter((item) => {
          if (!search) return true
          const formatted = formatOption(item)
          return formatted.label.toLowerCase().includes(search.toLowerCase())
        })
        .map(formatOption)
    : data?.[queryKey || '']?.data?.[queryKey || '']?.map(formatOption) || []

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          {selectedOption?.label || defaultPlaceholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={defaultSearchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {!staticData && fetching ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>{defaultEmptyText}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
