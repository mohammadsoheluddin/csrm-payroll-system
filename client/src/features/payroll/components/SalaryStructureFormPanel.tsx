import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'

import { FormErrorSummary } from '@/components/feedback/FormErrorSummary'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { PayrollLookupOption, SalaryStructurePayload, SalaryStructureRecord } from '@/features/payroll/types/payroll.types'
import { getReferenceId } from '@/features/payroll/utils/payroll.utils'
import { applyApiFieldErrors, normalizeApiError } from '@/lib/api/apiError'

type SalaryStructureFormValues = SalaryStructurePayload

type SalaryStructureFormPanelProps = {
  mode: 'create' | 'edit'
  record?: SalaryStructureRecord | null
  employeeOptions: PayrollLookupOption[]
  onSubmit: (payload: SalaryStructurePayload) => void
  onClose: () => void
  isPending?: boolean
  error?: unknown
}

const inputClass =
  'h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

const defaultValues: SalaryStructureFormValues = {
  employee: '',
  basicSalary: 0,
  houseRent: 0,
  medicalAllowance: 0,
  transportAllowance: 0,
  otherAllowance: 0,
  taxDeduction: 0,
  providentFund: 0,
  loanDeduction: 0,
  otherDeduction: 0,
  effectiveFrom: '',
  remarks: '',
  isActive: true,
}

export const SalaryStructureFormPanel = ({
  mode,
  record,
  employeeOptions,
  onSubmit,
  onClose,
  isPending,
  error,
}: SalaryStructureFormPanelProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<SalaryStructureFormValues>({
    defaultValues,
  })

  useEffect(() => {
    if (!record) {
      reset(defaultValues)
      return
    }

    reset({
      employee: getReferenceId(record.employee),
      basicSalary: Number(record.basicSalary || 0),
      houseRent: Number(record.houseRent || 0),
      medicalAllowance: Number(record.medicalAllowance || 0),
      transportAllowance: Number(record.transportAllowance || 0),
      otherAllowance: Number(record.otherAllowance || 0),
      taxDeduction: Number(record.taxDeduction || 0),
      providentFund: Number(record.providentFund || 0),
      loanDeduction: Number(record.loanDeduction || 0),
      otherDeduction: Number(record.otherDeduction || 0),
      effectiveFrom: String(record.effectiveFrom || '').slice(0, 10),
      remarks: String(record.remarks || ''),
      isActive: record.isActive !== false,
    })
  }, [record, reset])

  useEffect(() => {
    if (error) {
      applyApiFieldErrors(error, setError)
    }
  }, [error, setError])

  const normalizedError = error ? normalizeApiError(error) : null

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm">
      <Card className="h-full w-full max-w-2xl overflow-y-auto rounded-none border-y-0 border-r-0 shadow-2xl">
        <CardHeader className="sticky top-0 z-10 flex flex-row items-start justify-between border-b border-border bg-card/95 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Salary Structure</p>
            <CardTitle>{mode === 'create' ? 'Create Salary Structure' : 'Edit Salary Structure'}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-5">
          <form className="space-y-5" onSubmit={handleSubmit((values) => onSubmit(values))}>
            {normalizedError && <FormErrorSummary errors={{}} serverError={normalizedError.message} />}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">Employee</span>
                <select className={inputClass} {...register('employee', { required: 'Employee is required' })}>
                  <option value="">Select employee</option>
                  {employeeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.employee?.message && <p className="text-xs text-destructive">{errors.employee.message}</p>}
              </label>

              {[
                ['basicSalary', 'Basic Salary'],
                ['houseRent', 'House Rent'],
                ['medicalAllowance', 'Medical Allowance'],
                ['transportAllowance', 'Transport Allowance'],
                ['otherAllowance', 'Other Allowance'],
                ['taxDeduction', 'Tax Deduction'],
                ['providentFund', 'Provident Fund'],
                ['loanDeduction', 'Loan Deduction'],
                ['otherDeduction', 'Other Deduction'],
              ].map(([name, label]) => (
                <label key={name} className="space-y-2">
                  <span className="text-sm font-medium">{label}</span>
                  <input className={inputClass} type="number" min="0" step="0.01" {...register(name as keyof SalaryStructureFormValues)} />
                </label>
              ))}

              <label className="space-y-2">
                <span className="text-sm font-medium">Effective From</span>
                <input className={inputClass} type="date" {...register('effectiveFrom', { required: 'Effective date is required' })} />
                {errors.effectiveFrom?.message && <p className="text-xs text-destructive">{errors.effectiveFrom.message}</p>}
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm">
                <input type="checkbox" {...register('isActive')} />
                Active salary structure
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">Remarks</span>
                <textarea
                  className="min-h-24 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  {...register('remarks')}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : mode === 'create' ? 'Create Structure' : 'Update Structure'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
