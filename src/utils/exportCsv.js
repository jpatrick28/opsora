export function exportCsv({
  filename,
  columns,
  rows,
}) {
  const escapeValue = (value) => {
    const normalized =
      value === null || value === undefined
        ? ''
        : String(value)

    return `"${normalized.replaceAll(
      '"',
      '""',
    )}"`
  }

  const header = columns
    .map((column) =>
      escapeValue(column.label),
    )
    .join(',')

  const body = rows.map((row) =>
    columns
      .map((column) => {
        const value =
          typeof column.value === 'function'
            ? column.value(row)
            : row[column.value]

        return escapeValue(value)
      })
      .join(','),
  )

  const csv = [header, ...body].join('\n')

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}