type Feature = { name: string; description: string; value: number }

export function downloadCsv(features: Feature[]) {
  if (!features || features.length === 0) return
  const header = 'name,description,value\n'
  const rows = features.map(f => `${JSON.stringify(f.name)},${JSON.stringify(f.description)},${f.value}`)
  const csv = header + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analysis-features-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

