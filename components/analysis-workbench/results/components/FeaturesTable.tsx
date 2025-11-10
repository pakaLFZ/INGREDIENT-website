/**
 * Generic features table component
 * Displays standardized feature data in a clean table format
 *
 * @param features - Array of feature objects with name, description, and value
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Feature {
  name: string
  description: string
  value: number
}

interface FeaturesTableProps {
  features: Feature[]
  title?: string
}

export function FeaturesTable({ features, title }: FeaturesTableProps) {
  if (!features || features.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-xs text-gray-500">No features available</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <div className="text-sm font-medium mb-3">{title}</div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead className="text-right w-[120px]">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="font-medium text-sm">{feature.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {feature.description}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm font-mono">
                {typeof feature.value === 'number'
                  ? feature.value.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    })
                  : feature.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
