import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import type { ButtonProps } from '@/components/ui/Button'
import { downloadApiFile } from '@/lib/api/fileDownload'
import { normalizeApiError } from '@/lib/api/apiError'

export type ExportActionButtonProps = Omit<ButtonProps, 'onClick'> & {
  endpoint: string
  params?: Record<string, string | number | boolean | null | undefined>
  fileName: string
  mimeType?: string
  label: string
}

export const ExportActionButton = ({
  endpoint,
  params,
  fileName,
  mimeType,
  label,
  disabled,
  children,
  className,
  ...buttonProps
}: ExportActionButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      await downloadApiFile({ endpoint, params, fileName, mimeType })
      toast.success(`${label} downloaded`)
    } catch (error) {
      const normalizedError = normalizeApiError(error)
      toast.error(normalizedError.message, {
        description: normalizedError.title,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      type="button"
      disabled={disabled || isDownloading}
      onClick={handleDownload}
      className={className}
      {...buttonProps}
    >
      {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      <span className="truncate">{children ?? label}</span>
    </Button>
  )
}
