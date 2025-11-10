import json
from pathlib import Path
from typing import List, Dict, Any
import math

AVAILABLE_IMAGE_IDS = [4, 33, 37, 45, 62, 79, 100, 103, 104, 117]
DATA_DIR = r"C:\Data\Projects\INGREDIENT\INGREDIENT-CODEBASE-DESKTOP\website\public\red-blood-cells-data"

def calculate_area(points: List[List]) -> float:
    if not points or len(points) < 3:
        return 0
    area = 0
    for i in range(len(points)):
        j = (i + 1) % len(points)
        p1, p2 = points[i], points[j]
        area += p1[0] * p2[1] - p2[0] * p1[1]
    return abs(area) / 2

def calculate_perimeter(points: List[List]) -> float:
    if not points or len(points) < 2:
        return 0
    perimeter = 0
    for i in range(len(points)):
        j = (i + 1) % len(points)
        p1, p2 = points[i], points[j]
        dx = float(p2[0]) - float(p1[0])
        dy = float(p2[1]) - float(p1[1])
        perimeter += math.sqrt(dx*dx + dy*dy)
    return perimeter

def calculate_circularity_deviation(area: float, perimeter: float) -> float:
    if area <= 0 or perimeter <= 0:
        return 0
    circularity = (4 * math.pi * area) / (perimeter * perimeter)
    return abs(1 - circularity)

def load_image_analysis(image_id: int) -> Dict[str, Any]:
    file_path = Path(DATA_DIR) / f"image-{image_id}_contours.json"

    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

    rbc_cells = data.get('rbc', [])
    wbc_cells = data.get('wbc', [])

    rbc_metrics = []
    wbc_metrics = []

    # Process RBC
    for cell in rbc_cells:
        contours = cell.get('contours', [])
        if not contours or len(contours) == 0:
            continue
        points = contours[0]
        if not isinstance(points, list) or len(points) < 3:
            continue
        area = calculate_area(points)
        perimeter = calculate_perimeter(points)
        if area > 0 and perimeter > 0:
            rbc_metrics.append({'area': area, 'perimeter': perimeter})

    # Process WBC
    for cell in wbc_cells:
        contours = cell.get('contours', [])
        if not contours or len(contours) == 0:
            continue
        points = contours[0]
        if not isinstance(points, list) or len(points) < 3:
            continue
        area = calculate_area(points)
        perimeter = calculate_perimeter(points)
        if area > 0 and perimeter > 0:
            wbc_metrics.append({'area': area, 'perimeter': perimeter})

    rbc_count = len(rbc_metrics)
    wbc_count = len(wbc_metrics)

    avg_rbc_area = sum(m['area'] for m in rbc_metrics) / rbc_count if rbc_count > 0 else 0
    avg_wbc_area = sum(m['area'] for m in wbc_metrics) / wbc_count if wbc_count > 0 else 0
    avg_rbc_shape_dev = sum(calculate_circularity_deviation(m['area'], m['perimeter']) for m in rbc_metrics) / rbc_count if rbc_count > 0 else 0

    return {
        'image_id': image_id,
        'filename': f'image-{image_id}.png',
        'rbc_count': rbc_count,
        'wbc_count': wbc_count,
        'total_cells': rbc_count + wbc_count,
        'avg_rbc_area': round(avg_rbc_area, 2),
        'avg_wbc_area': round(avg_wbc_area, 2),
        'avg_rbc_shape_dev': round(avg_rbc_shape_dev, 4)
    }

# Load all analyses
per_image_metrics = []
for image_id in AVAILABLE_IMAGE_IDS:
    result = load_image_analysis(image_id)
    if result:
        per_image_metrics.append(result)

# Calculate aggregated metrics
total_rbc = sum(m['rbc_count'] for m in per_image_metrics)
total_wbc = sum(m['wbc_count'] for m in per_image_metrics)
total_cells = total_rbc + total_wbc

total_rbc_area = sum(m['avg_rbc_area'] * m['rbc_count'] for m in per_image_metrics)
total_wbc_area = sum(m['avg_wbc_area'] * m['wbc_count'] for m in per_image_metrics)
total_rbc_shape_dev = sum(m['avg_rbc_shape_dev'] * m['rbc_count'] for m in per_image_metrics)

avg_rbc_area = round(total_rbc_area / total_rbc, 2) if total_rbc > 0 else 0
avg_wbc_area = round(total_wbc_area / total_wbc, 2) if total_wbc > 0 else 0
avg_rbc_shape_dev = round(total_rbc_shape_dev / total_rbc, 4) if total_rbc > 0 else 0

aggregated = {
    'total_images': len(per_image_metrics),
    'total_rbc': total_rbc,
    'total_wbc': total_wbc,
    'total_cells': total_cells,
    'avg_rbc_area': avg_rbc_area,
    'avg_wbc_area': avg_wbc_area,
    'avg_rbc_shape_dev': avg_rbc_shape_dev
}

print("=" * 80)
print("FOLDER ANALYSIS RESULTS")
print("=" * 80)
print("\nAGGREGATED METRICS")
print("-" * 80)
for key, value in aggregated.items():
    if isinstance(value, float) and key.endswith('area'):
        print(f"{key:.<40} {value:.2f} px²")
    elif isinstance(value, float):
        print(f"{key:.<40} {value:.4f}")
    else:
        print(f"{key:.<40} {value}")

print("\nPER-IMAGE METRICS")
print("-" * 80)
print(f"{'Image':<15} {'RBCs':>8} {'WBCs':>8} {'Total':>8} {'Avg RBC Area':>15} {'Avg WBC Area':>15} {'RBC Shape Dev':>15}")
print("-" * 80)
for m in per_image_metrics:
    print(f"{m['filename']:<15} {m['rbc_count']:>8} {m['wbc_count']:>8} {m['total_cells']:>8} {m['avg_rbc_area']:>15.2f} {m['avg_wbc_area']:>15.2f} {m['avg_rbc_shape_dev']:>15.4f}")

print("\n" + "=" * 80)
print(f"Analysis complete: {aggregated['total_images']} images processed")
print("=" * 80)
