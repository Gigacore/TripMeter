import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LazySection from './LazySection';
import { assertAccessible } from '../../tests/utils';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver as any;

describe('LazySection', () => {
    let intersectionObserverCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;

    beforeEach(() => {
        mockIntersectionObserver.mockImplementation((callback) => {
            intersectionObserverCallback = callback;
            return {
                observe: () => null,
                unobserve: () => null,
                disconnect: () => null,
            };
        });
        mockIntersectionObserver.mockClear();
    });

    it('should be accessible when showing the skeleton', async () => {
        await assertAccessible(
            <LazySection id="test-section">
                <div>Actual Content</div>
            </LazySection>
        );
    });

    it('should be accessible when showing the content', async () => {
        render(
            <LazySection id="test-section">
                <div>Actual Content</div>
            </LazySection>
        );

        act(() => {
            intersectionObserverCallback([{ isIntersecting: true }]);
        });

        await assertAccessible(
            <LazySection id="test-section">
                <div>Actual Content</div>
            </LazySection>
        );
    });

    it('renders skeleton initially', () => {
        render(
            <LazySection id="test-section">
                <div>Actual Content</div>
            </LazySection>
        );

        // Should show skeleton, not actual content
        expect(screen.queryByText('Actual Content')).not.toBeInTheDocument();
        // Check for skeleton elements
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('sets up IntersectionObserver with correct options', () => {
        render(
            <LazySection id="test-section">
                <div>Content</div>
            </LazySection>
        );

        expect(mockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                rootMargin: '200px',
                threshold: 0,
            })
        );
    });

    it('applies custom className', () => {
        const { container } = render(
            <LazySection id="test-section" className="custom-class">
                <div>Content</div>
            </LazySection>
        );

        const wrapper = container.querySelector('.custom-class');
        expect(wrapper).toBeInTheDocument();
    });

    it('sets data attribute with id', () => {
        const { container } = render(
            <LazySection id="test-section">
                <div>Content</div>
            </LazySection>
        );

        const wrapper = container.querySelector('[data-lazy-section-id="test-section"]');
        expect(wrapper).toBeInTheDocument();
    });
});
