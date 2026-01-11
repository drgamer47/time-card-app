import { formatCurrency, formatHours } from '../lib/calculations';

interface PaySummaryProps {
  regularHours: number;
  otHours: number;
  totalHours: number;
  totalPay: number;
  compact?: boolean;
}

export default function PaySummary({
  regularHours,
  otHours,
  totalHours,
  totalPay,
  compact = false,
}: PaySummaryProps) {
  if (compact) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary">Total Hours</span>
          <span className="font-semibold">{formatHours(totalHours)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary">Regular</span>
          <span>{formatHours(regularHours)} × $14 = {formatCurrency(regularHours * 14)}</span>
        </div>
        {otHours > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-text-secondary">Overtime</span>
            <span>{formatHours(otHours)} × $21 = {formatCurrency(otHours * 21)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="font-semibold text-lg">Total Pay</span>
          <span className="font-bold text-xl text-success">{formatCurrency(totalPay)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Pay Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Regular Hours</span>
          <span className="font-medium">{formatHours(regularHours)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Regular Pay</span>
          <span>{formatCurrency(regularHours * 14)}</span>
        </div>
        {otHours > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Overtime Hours</span>
              <span className="font-medium text-warning">{formatHours(otHours)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Overtime Pay</span>
              <span className="text-warning">{formatCurrency(otHours * 21)}</span>
            </div>
          </>
        )}
        <div className="pt-3 border-t border-gray-200 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Hours</span>
            <span className="text-lg font-semibold">{formatHours(totalHours)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xl font-bold">Total Pay</span>
            <span className="text-2xl font-bold text-success">{formatCurrency(totalPay)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

