export async function downloadCompositePng(opts: {
  imageEl: HTMLImageElement
  svgEl?: SVGSVGElement | null
  filename?: string
}) {
  const { imageEl, svgEl, filename } = opts
  const width = imageEl.naturalWidth
  const height = imageEl.naturalHeight

  const img = await loadImage(imageEl.src)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Draw base image full size
  ctx.drawImage(img, 0, 0, width, height)

  if (svgEl) {
    const svgClone = svgEl.cloneNode(true) as SVGSVGElement
    // Force viewport to original image pixels
    svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svgClone.setAttribute('width', `${width}`)
    svgClone.setAttribute('height', `${height}`)
    // Ensure styles are inlined so colors/strokes persist
    inlineSvgStyles(svgClone)
    // Remove transforms so we render in original coordinate space
    svgClone.removeAttribute('style')
    // Serialize SVG and draw onto canvas via Image element
    const svgData = new XMLSerializer().serializeToString(svgClone)
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
    const overlay = await loadImage(svgUrl)
    ctx.drawImage(overlay, 0, 0, width, height)
  }

  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename || 'analysis-visual'}-${new Date().toISOString().split('T')[0]}.png`
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

function inlineSvgStyles(svg: SVGSVGElement) {
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT)
  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement
    const cs = getComputedStyle(el)
    const style: Record<string, string> = {}
    const props = ['stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-opacity', 'fill', 'fill-opacity', 'opacity']
    for (const p of props) {
      const v = cs.getPropertyValue(p)
      if (v) style[p] = v
    }
    Object.assign(el.style, style)
  }
}
