import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { PageLayout } from './PageLayout'

describe('PageLayout', () => {
  describe('rendering', () => {
    it('renders page title', () => {
      render(
        <PageLayout title="Test Page">
          <div>Content</div>
        </PageLayout>
      )
      expect(screen.getByText('Test Page')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <PageLayout title="Test Page">
          <div>Test Content</div>
        </PageLayout>
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders back to dashboard link', () => {
      render(
        <PageLayout title="Test Page">
          <div>Content</div>
        </PageLayout>
      )
      expect(screen.getByRole('link', { name: /back to dashboard/i })).toBeInTheDocument()
    })

    it('links back to home', () => {
      render(
        <PageLayout title="Test Page">
          <div>Content</div>
        </PageLayout>
      )
      expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute('href', '/')
    })

    it('renders optional subtitle', () => {
      render(
        <PageLayout title="Test Page" subtitle="Page description">
          <div>Content</div>
        </PageLayout>
      )
      expect(screen.getByText('Page description')).toBeInTheDocument()
    })

    it('does not render subtitle when not provided', () => {
      render(
        <PageLayout title="Test Page">
          <div>Content</div>
        </PageLayout>
      )
      // Should only have title, not any subtitle element
      const titleElement = screen.getByText('Test Page')
      expect(titleElement.nextElementSibling).toBeFalsy()
    })
  })
})
