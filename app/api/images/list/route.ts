import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    let { folder_path, search = '', sort_by = 'filename', page = 1, per_page = 20 } = await request.json()

    if (!folder_path) {
      return NextResponse.json(
        { error: 'folder_path is required' },
        { status: 400 }
      )
    }

    // Resolve special folder names
    if (folder_path === 'sample_data_folder') {
      folder_path = path.join(process.cwd(), 'public/red-blood-cells-data')
    }

    // Check if folder exists
    if (!fs.existsSync(folder_path)) {
      return NextResponse.json(
        { error: `Folder not found: ${folder_path}` },
        { status: 404 }
      )
    }

    // Get all PNG files
    const files = fs.readdirSync(folder_path)
    const imageFiles = files
      .filter(file => file.endsWith('.png') && !file.includes('_contours'))
      .map(file => {
        const fullPath = path.join(folder_path, file)
        const stat = fs.statSync(fullPath)
        const imageName = file.replace(/\.png$/, '')

        return {
          filename: file,
          image_name: imageName,
          image_id: parseInt(imageName.split('-')[1]) || 0,
          file_path: fullPath,
          size: stat.size,
          modified_time: stat.mtime.toISOString()
        }
      })

    // Apply search filter
    let filtered = imageFiles.filter(img =>
      img.filename.toLowerCase().includes(search.toLowerCase())
    )

    // Sort
    if (sort_by === 'size') {
      filtered.sort((a, b) => a.size - b.size)
    } else if (sort_by === 'date') {
      filtered.sort((a, b) => new Date(b.modified_time).getTime() - new Date(a.modified_time).getTime())
    } else {
      // Default: filename
      filtered.sort((a, b) => a.filename.localeCompare(b.filename))
    }

    const total = filtered.length
    const pages = Math.ceil(total / per_page)
    const start = (page - 1) * per_page
    const paginatedImages = filtered.slice(start, start + per_page)

    return NextResponse.json({
      images: paginatedImages,
      pagination: {
        page,
        per_page,
        total,
        pages
      }
    })
  } catch (error) {
    console.error('Error listing images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
