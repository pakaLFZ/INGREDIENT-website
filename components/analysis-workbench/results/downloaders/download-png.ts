export function downloadPngFromCanvas(canvasSelector: string) {
  const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector)
  if (!canvas) return
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `analysis-visual-${new Date().toISOString().split('T')[0]}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

