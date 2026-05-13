export const toTitleCase = (value: string) => {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

export const formatDateTime = (value?: unknown) => {
  if (!value || typeof value !== 'string') {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatBoolean = (value: unknown) => {
  return value === true ? 'Yes' : 'No'
}

export const getRecordId = (record: Record<string, unknown>) => {
  const value = record._id ?? record.id
  return typeof value === 'string' ? value : ''
}

export const getReferenceId = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const id = record._id ?? record.id
    return typeof id === 'string' ? id : ''
  }

  return ''
}

export const getReferenceLabel = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const label =
      record.shortName ??
      record.name ??
      record.accountName ??
      record.bankName ??
      record.code ??
      record._id ??
      record.id

    return typeof label === 'string' ? label : '—'
  }

  return '—'
}

export const getRecordDisplayName = (record: Record<string, unknown>) => {
  const label = record.name ?? record.accountName ?? record.bankName ?? record.code ?? record._id ?? record.id
  return typeof label === 'string' ? label : 'Untitled record'
}

export const getRecordValueByPath = (record: Record<string, unknown>, path: string) => {
  return path.split('.').reduce<unknown>((current, key) => {
    if (typeof current !== 'object' || current === null) {
      return undefined
    }

    return (current as Record<string, unknown>)[key]
  }, record)
}
