import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DocumentUploader } from './DocumentUploader';

describe('DocumentUploader Component', () => {
  const defaultProps = {
    documentText: '',
    documentTitle: 'Sample Lease Agreement',
    onTextChange: vi.fn(),
    onTitleChange: vi.fn(),
    onFileLoaded: vi.fn(),
    onAudit: vi.fn(),
    isLoading: false,
    uploadedFileName: null,
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props and accessible inputs', () => {
    render(<DocumentUploader {...defaultProps} />);

    // Verify document title input
    const titleInput = screen.getByLabelText(/contract or document title/i);
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue('Sample Lease Agreement');

    // Verify paste textarea
    const textarea = screen.getByLabelText(/paste contract clauses or agreement text/i);
    expect(textarea).toBeInTheDocument();

    // Verify Audit button is rendered and disabled when text is empty
    const auditButton = screen.getByRole('button', { name: /audit contract clauses with clauseguard/i });
    expect(auditButton).toBeInTheDocument();
    expect(auditButton).toBeDisabled();
  });

  it('triggers onTextChange when the user types in the textarea', () => {
    render(<DocumentUploader {...defaultProps} />);

    const textarea = screen.getByLabelText(/paste contract clauses or agreement text/i);
    fireEvent.change(textarea, {
      target: { value: 'Tenant agrees to waive all statutory rights to security deposit return.' },
    });

    expect(defaultProps.onTextChange).toHaveBeenCalledWith(
      'Tenant agrees to waive all statutory rights to security deposit return.'
    );
  });

  it('enables the audit button and triggers onAudit when text is present', () => {
    render(
      <DocumentUploader
        {...defaultProps}
        documentText="Tenant agrees to indemnify landlord unconditionally for all claims."
      />
    );

    const auditButton = screen.getByRole('button', { name: /audit contract clauses with clauseguard/i });
    expect(auditButton).not.toBeDisabled();

    fireEvent.click(auditButton);
    expect(defaultProps.onAudit).toHaveBeenCalledTimes(1);
  });

  it('displays loading state and disables actions during auditing', () => {
    render(
      <DocumentUploader
        {...defaultProps}
        documentText="Sample clause text..."
        isLoading={true}
      />
    );

    const loadingText = screen.getByText(/auditing legal clauses.../i);
    expect(loadingText).toBeInTheDocument();

    const auditButton = screen.getByRole('button', { name: /auditing legal clauses in document/i });
    expect(auditButton).toBeDisabled();
  });

  it('allows switching between Paste Text and Upload File tabs', () => {
    render(<DocumentUploader {...defaultProps} />);

    const uploadTab = screen.getByRole('tab', { name: /upload file/i });
    fireEvent.click(uploadTab);

    // Dropzone instructions should appear
    expect(screen.getByText(/drop your contract here or click to browse/i)).toBeInTheDocument();

    const pasteTab = screen.getByRole('tab', { name: /paste text/i });
    fireEvent.click(pasteTab);
    expect(screen.getByLabelText(/paste contract clauses or agreement text/i)).toBeInTheDocument();
  });
});
