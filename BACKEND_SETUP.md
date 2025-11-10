# Fake Backend Setup

This document describes the fake backend implementation for the analysis workbench application.

## API Endpoints

### 1. Image List - `POST /api/images/list`

Lists images from a folder with search, sort, and pagination support.

**Request Body:**
```json
{
  "folder_path": "C:/path/to/images",
  "search": "optional search query",
  "sort_by": "filename|size|date",
  "page": 1,
  "per_page": 20
}
```

**Response:**
```json
{
  "images": [
    {
      "filename": "image-4.png",
      "image_name": "image-4",
      "image_id": 4,
      "file_path": "C:/path/to/images/image-4.png",
      "size": 12345,
      "modified_time": "2024-11-10T18:55:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "pages": 3
  }
}
```

### 2. Start Analysis - `POST /api/analysis/start`

Starts a comprehensive analysis task for an image.

**Request Body:**
```json
{
  "image_id": 4,
  "method": "comprehensive_analysis",
  "options": {
    "skip_cache": false
  }
}
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "type": "comprehensive_analysis",
  "status": "processing"
}
```

### 3. Check Status - `POST /api/analysis/status`

Checks the status of an analysis task.

**Request Body:**
```json
{
  "task_id": "uuid-string"
}
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "completed|processing|failed",
  "error_message": null
}
```

### 4. Get Results - `POST /api/analysis/results`

Fetches the analysis results including contours and features.

**Request Body:**
```json
{
  "task_id": "uuid-string",
  "image_id": 4
}
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "task_type": "comprehensive_analysis",
  "image_id": 4,
  "options": {"skip_cache": false},
  "contours": [
    {
      "name": "RBC",
      "color": "#ff0000",
      "area": 15234.5,
      "number": 17,
      "contours": [
        {
          "contour_id": 0,
          "area": 985.0,
          "perimeter": 390.5,
          "centroid": {"x": 2108, "y": 2922},
          "bounding_box": {"x": 2061, "y": 2900, "width": 101, "height": 42},
          "contour_points": [[x, y], ...],
          "convex_hull_area": 3022.0,
          "solidity": 0.326,
          "aspect_ratio": 2.405,
          "extent": 0.232,
          "point_count": 193
        }
      ]
    }
  ],
  "features": [
    {
      "name": "RBC Count",
      "description": "Total number of detected red blood cells",
      "value": 17
    },
    {
      "name": "WBC Count",
      "description": "Total number of detected white blood cells",
      "value": 1
    },
    {
      "name": "Avg RBC Area",
      "description": "Mean area of all detected red blood cells",
      "value": 896.15
    },
    {
      "name": "Avg WBC Area",
      "description": "Mean area of all detected white blood cells",
      "value": 3800.25
    },
    {
      "name": "RBC Shape Dev",
      "description": "Average deviation of RBC shape from circular form",
      "value": 0.0245
    }
  ],
  "completed_at": "2024-11-10T18:55:00Z"
}
```

## Features

The features returned in the analysis results include:

1. **RBC Count** - Total number of detected red blood cells
2. **WBC Count** - Total number of detected white blood cells
3. **Total Cells** - Combined count of all cells
4. **Avg RBC Area** - Mean area of all RBCs
5. **Avg WBC Area** - Mean area of all WBCs
6. **RBC Shape Dev** - Average deviation of RBC shape from a perfect circle (circularity deviation)

## Implementation Details

- Image list endpoint reads PNG files from the specified folder
- Analysis endpoints read contour data from JSON files in `/public/red-blood-cells-data`
- Task completion is simulated with a 2-second delay
- All calculations (area, perimeter, centroid, etc.) are computed from contour points using geometric formulas
- Shape circularity is calculated as: `4π × Area / Perimeter²`, with deviation = `|1 - circularity|`
