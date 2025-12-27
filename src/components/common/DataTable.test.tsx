import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { DataTable, type Column } from './DataTable'

interface TestData {
  id: number
  name: string
  value: number
}

describe('DataTable', () => {
  const columns: Column<TestData>[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'value', header: 'Value', render: (item) => `$${item.value}` },
  ]

  const data: TestData[] = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 },
  ]

  describe('rendering', () => {
    it('renders column headers', () => {
      render(<DataTable columns={columns} data={data} />)
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Value')).toBeInTheDocument()
    })

    it('renders data rows', () => {
      render(<DataTable columns={columns} data={data} />)
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('uses custom render function for columns', () => {
      render(<DataTable columns={columns} data={data} />)
      expect(screen.getByText('$100')).toBeInTheDocument()
      expect(screen.getByText('$200')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loading skeleton when isLoading is true', () => {
      render(<DataTable columns={columns} data={[]} isLoading />)
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })

    it('hides data when loading', () => {
      render(<DataTable columns={columns} data={data} isLoading />)
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no data', () => {
      render(<DataTable columns={columns} data={[]} />)
      expect(screen.getByText('No data found')).toBeInTheDocument()
    })

    it('shows custom empty message', () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          emptyMessage="No items available"
        />
      )
      expect(screen.getByText('No items available')).toBeInTheDocument()
    })

    it('does not show empty state when loading', () => {
      render(<DataTable columns={columns} data={[]} isLoading />)
      expect(screen.queryByText('No data found')).not.toBeInTheDocument()
    })
  })

  describe('row click', () => {
    it('calls onRowClick when row is clicked', () => {
      const onRowClick = vi.fn()
      render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />)

      fireEvent.click(screen.getByText('Item 1'))

      expect(onRowClick).toHaveBeenCalledWith(data[0])
    })

    it('adds cursor-pointer class when onRowClick is provided', () => {
      const onRowClick = vi.fn()
      render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />)

      const row = screen.getByText('Item 1').closest('tr')
      expect(row).toHaveClass('cursor-pointer')
    })
  })

  describe('expandable rows', () => {
    it('shows expand button when renderExpanded is provided', () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          renderExpanded={() => <div>Expanded content</div>}
        />
      )
      expect(screen.getAllByRole('button', { name: 'Expand row' })).toHaveLength(3)
    })

    it('expands row when expand button is clicked', () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          renderExpanded={(item) => <div>Details for {item.name}</div>}
        />
      )

      fireEvent.click(screen.getAllByRole('button', { name: 'Expand row' })[0])

      expect(screen.getByText('Details for Item 1')).toBeInTheDocument()
    })

    it('collapses row when expand button is clicked again', () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          renderExpanded={(item) => <div>Details for {item.name}</div>}
        />
      )

      const expandButton = screen.getAllByRole('button', { name: 'Expand row' })[0]
      fireEvent.click(expandButton)
      expect(screen.getByText('Details for Item 1')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Collapse row' }))
      expect(screen.queryByText('Details for Item 1')).not.toBeInTheDocument()
    })
  })

  describe('key extraction', () => {
    it('uses keyExtractor when provided', () => {
      const keyExtractor = vi.fn((item: TestData) => `custom-${item.id}`)
      render(
        <DataTable
          columns={columns}
          data={data}
          keyExtractor={keyExtractor}
        />
      )

      expect(keyExtractor).toHaveBeenCalledTimes(3)
    })

    it('falls back to id when keyExtractor not provided', () => {
      // This should render without errors
      render(<DataTable columns={columns} data={data} />)
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })
})
