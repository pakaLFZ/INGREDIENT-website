export async function downloadPreviewSnapshot(containerSelector: string) {
  const container = document.querySelector<HTMLElement>(containerSelector)
  if (!container) return

  const img = container.querySelector<HTMLImageElement>('img[src]')
  if (!img) return

  const width = img.naturalWidth
  const height = img.naturalHeight
  if (!width || !height) return

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Draw base image at original pixels
  const base = await loadImage(img.src)
  ctx.drawImage(base, 0, 0, width, height)

  // Collect all overlay SVGs inside the preview container
  const svgs = Array.from(container.querySelectorAll<SVGSVGElement>('svg'))
  if (svgs.length) {
    // Merge into one SVG sized to image pixels
    const merged = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    merged.setAttribute('viewBox', `0 0 ${width} ${height}`)
    merged.setAttribute('width', String(width))
    merged.setAttribute('height', String(height))

    for (const svg of svgs) {
      const svgStyle = getComputedStyle(svg)
      const svgVisible = svgStyle.display !== 'none' && parseFloat(svgStyle.opacity || '1') > 0
      if (!svgVisible) continue
      // Copy visible paths only
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>('path'))
      for (const p of paths) {
        const ps = getComputedStyle(p)
        const pathVisible = ps.display !== 'none' && parseFloat(ps.opacity || '1') > 0
        if (!pathVisible) continue
        const clone = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        clone.setAttribute('d', p.getAttribute('d') || '')

        // Inline effective styles from computed style
        const stroke = p.getAttribute('stroke') || ps.stroke || 'none'
        const strokeWidth = p.getAttribute('stroke-width') || ps.strokeWidth || '0'
        const strokeLinecap = p.getAttribute('stroke-linecap') || ps.strokeLinecap || 'round'
        const strokeLinejoin = p.getAttribute('stroke-linejoin') || ps.strokeLinejoin || 'round'
        const strokeOpacity = p.getAttribute('stroke-opacity') || ps.strokeOpacity || '1'
        const opacity = p.getAttribute('opacity') || ps.opacity || '1'

        clone.setAttribute('fill', 'none')
        clone.setAttribute('stroke', stroke)
        clone.setAttribute('stroke-width', strokeWidth)
        clone.setAttribute('stroke-linecap', strokeLinecap)
        clone.setAttribute('stroke-linejoin', strokeLinejoin)
        if (strokeOpacity) clone.setAttribute('stroke-opacity', String(strokeOpacity))
        if (opacity) clone.setAttribute('opacity', String(opacity))

        merged.appendChild(clone)
      }
    }

    // Serialize and draw
    const svgData = new XMLSerializer().serializeToString(merged)
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
    const overlay = await loadImage(svgUrl)
    ctx.drawImage(overlay, 0, 0, width, height)
  }

  // Download
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `analysis-preview-${new Date().toISOString().split('T')[0]}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = src
  })
}
