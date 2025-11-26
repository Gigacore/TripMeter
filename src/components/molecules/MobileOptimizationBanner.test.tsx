import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { MobileOptimizationBanner } from './MobileOptimizationBanner';
import '@testing-library/jest-dom';

describe('MobileOptimizationBanner', () => {
    test('renders the banner with correct text', () => {
        const { container } = render(<MobileOptimizationBanner />);
        expect(container.textContent).toContain('This application is optimized for large screens like tablets and desktops.');
    });

    test('dismisses the banner when close button is clicked', () => {
        const { container } = render(<MobileOptimizationBanner />);
        const closeButton = screen.getByRole('button', { name: /dismiss/i });
        fireEvent.click(closeButton);
        expect(container.textContent).not.toContain('This application is optimized for large screens like tablets and desktops.');
    });
});
