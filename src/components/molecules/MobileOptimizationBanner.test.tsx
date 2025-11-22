import { render, screen, fireEvent } from '@testing-library/react';
import { MobileOptimizationBanner } from './MobileOptimizationBanner';
import '@testing-library/jest-dom';

describe('MobileOptimizationBanner', () => {
    test('renders the banner with correct text', () => {
        render(<MobileOptimizationBanner />);
        expect(screen.getByText('This application is optimized for large screens like tablets and desktops.')).toBeInTheDocument();
    });

    test('dismisses the banner when close button is clicked', () => {
        render(<MobileOptimizationBanner />);
        const closeButton = screen.getByRole('button', { name: /dismiss/i });
        fireEvent.click(closeButton);
        expect(screen.queryByText('This application is optimized for large screens like tablets and desktops.')).not.toBeInTheDocument();
    });
});
