export interface ImageMask {
    id: string
    name: string
    color: string
    url: string
    visible: boolean
    description?: string
    groupId?: string
    thickness?: number
    opacity?: number
    contourData?: any // Store actual contour data for direct rendering
}