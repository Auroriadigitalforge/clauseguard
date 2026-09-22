import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from './App';

describe('ClauseGuard Application Tests', () => {
  it('renders the core application header or main container', () => {
    render(<App />);
    // Verifies that the app successfully mounts and displays key branding or title text
    const titleElements = screen.getAllByText(/ClauseGuard/i);
    expect(titleElements.length).toBeGreaterThan(0);
    expect(titleElements[0]).toBeInTheDocument();
  });

  it('verifies initial state and document upload components exist', () => {
    render(<App />);
    // Check that standard UI elements for document handling are present
    const uploadPrompt = screen.getByText(/upload file/i);
    expect(uploadPrompt).toBeInTheDocument();
  });
});
