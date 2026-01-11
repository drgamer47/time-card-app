import { format } from 'date-fns';
import { formatCurrency, formatHours, calculatePayPeriodPay } from '../lib/calculations';
import type { Shift } from '../types';

interface PayPeriodSummaryCardProps {
  periodStart: Date;
  periodEnd: Date;
  payDate: Date;
  shifts: Shift[];
}

export default function PayPeriodSummaryCard({
  periodStart,
  periodEnd,
  payDate,
  shifts,
}: PayPeriodSummaryCardProps) {
  const periodPay = calculatePayPeriodPay(shifts);
  const today = new Date();
  const daysUntilPayday = Math.ceil((payDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-surface rounded-lg p-6 border border-gray-200 shadow-md mx-4 my-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Current Pay Period</h2>
      
      {/* Period Dates */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-sm text-text-secondary">
          {format(periodStart, 'MMM d')} - {format(periodEnd, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Hours and Pay Breakdown */}
      <div className="space-y-3 mb-4">
        {periodPay.totalPaidHours === 0 ? (
          <div className="text-sm text-text-secondary italic text-center py-4">
            No shifts recorded yet this period
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Hours Worked</span>
              <span className="font-semibold text-text-primary">
                {formatHours(periodPay.totalPaidHours)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Regular</span>
              <span className="font-medium text-text-primary">
                {formatHours(periodPay.totalRegularHours)} × $14 = {formatCurrency(periodPay.totalRegularHours * 14)}
              </span>
            </div>
            
            {periodPay.totalOtHours > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Overtime</span>
                <span className="font-medium text-warning">
                  {formatHours(periodPay.totalOtHours)} × $21 = {formatCurrency(periodPay.totalOtHours * 21)}
                </span>
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-text-primary">Total Pay</span>
                <span className="text-2xl font-bold text-success">
                  {formatCurrency(periodPay.totalPay)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pay Date Info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">Pay Date</span>
          <span className="font-semibold text-text-primary">
            {format(payDate, 'EEE, MMM d')}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Days Until Payday</span>
          <span className="text-lg font-bold text-primary">{daysUntilPayday}</span>
        </div>
      </div>
    </div>
  );
}

