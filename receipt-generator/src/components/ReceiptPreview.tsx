import React from 'react';
import type { ReceiptDocument } from '../types';
import { calculateTotals } from '../utils/calculations';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CompactTemplate } from './templates/CompactTemplate';

interface ReceiptPreviewProps {
  document: ReceiptDocument;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ document: doc }) => {
  const totals = calculateTotals(doc.items, doc.taxSettings);

  return (
    <div className="flex flex-col items-center w-full">
      {/* A4 Container */}
      <div
        id="receipt-document-content"
        className="w-full max-w-[794px] bg-white shadow-xl rounded-sm print:shadow-none print:w-full print:max-w-none transition-all duration-200"
      >
        {doc.templateStyle === 'classic' && (
          <ClassicTemplate document={doc} totals={totals} />
        )}
        {doc.templateStyle === 'modern' && (
          <ModernTemplate document={doc} totals={totals} />
        )}
        {doc.templateStyle === 'compact' && (
          <CompactTemplate document={doc} totals={totals} />
        )}
      </div>
    </div>
  );
};
