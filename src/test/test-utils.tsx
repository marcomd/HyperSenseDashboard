import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

// Create a fresh QueryClient for each test
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface WrapperProps {
  children: ReactNode
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

function AllTheProviders({ children, initialEntries = ['/'] }: WrapperProps & { initialEntries?: string[] }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialEntries, ...renderOptions } = options || {}
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialEntries={initialEntries}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Wrapper for testing hooks
export function createTestWrapper(initialEntries: string[] = ['/']) {
  const queryClient = createTestQueryClient()
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }
