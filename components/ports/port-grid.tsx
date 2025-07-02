"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Palette, X, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface GridCell {
  x: number
  y: number
  type: "input" | "output" | "passthrough" | null
  blockName?: string
  blockVariation?: string
  color?: string
}

interface PortGridProps {
  gridData: GridCell[]
  onGridChange: (gridData: GridCell[]) => void
  isPassthrough: boolean
  customBlocksMode: boolean
}

const COLORS = [
  { name: "Red", value: "#ef4444", bg: "bg-red-500" },
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Green", value: "#10b981", bg: "bg-emerald-500" },
  // ... keep other colors as needed
]

export default function PortGrid({ gridData, onGridChange, isPassthrough, customBlocksMode }: PortGridProps) {
  const [selectedTool, setSelectedTool] = useState<"input" | "output" | "passthrough" | "erase">("input")
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [editingCell, setEditingCell] = useState<{x: number, y: number} | null>(null)
  const [blockName, setBlockName] = useState("")
  const [blockVariation, setBlockVariation] = useState("")

  const handleCellClick = (x: number, y: number) => {
    const newGridData = [...gridData]
    const existingIndex = newGridData.findIndex((cell) => cell.x === x && cell.y === y)

    if (selectedTool === "erase") {
      if (existingIndex !== -1) {
        newGridData.splice(existingIndex, 1)
      }
    } else {
      const newCell: GridCell = {
        x,
        y,
        type: isPassthrough ? "passthrough" : selectedTool,
        color: selectedColor
      }

      if (existingIndex !== -1) {
        newGridData[existingIndex] = newCell
      } else {
        newGridData.push(newCell)
      }
    }

    onGridChange(newGridData)
  }

  const handleEditBlock = (x: number, y: number) => {
    const cell = gridData.find(c => c.x === x && c.y === y)
    setEditingCell({x, y})
    setBlockName(cell?.blockName || "")
    setBlockVariation(cell?.blockVariation || "")
  }

  const saveBlockDetails = () => {
    if (!editingCell) return

    const newGridData = gridData.map(cell => {
      if (cell.x === editingCell.x && cell.y === editingCell.y) {
        return {
          ...cell,
          blockName,
          blockVariation
        }
      }
      return cell
    })

    onGridChange(newGridData)
    setEditingCell(null)
  }

  const getCellContent = (x: number, y: number) => {
    const cell = gridData.find((c) => c.x === x && c.y === y)
    if (!cell) return null

    switch (cell.type) {
      case "input":
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case "output":
        return <ArrowDown className="w-4 h-4 text-red-600" />
      case "passthrough":
        return <span className="font-bold">P</span>
      default:
        return null
    }
  }

  const getCellClass = (x: number, y: number) => {
    const cell = gridData.find((c) => c.x === x && c.y === y)
    let baseClass = "w-6 h-6 border border-gray-300 flex items-center justify-center text-xs relative"

    if (cell) {
      if (cell.type === "input") baseClass += " bg-green-100"
      else if (cell.type === "output") baseClass += " bg-red-100"
      else if (cell.type === "passthrough") baseClass += " bg-blue-100"
      else baseClass += " bg-gray-100"
    } else {
      baseClass += " bg-white hover:bg-gray-50"
    }

    return baseClass
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={selectedTool === "input" ? "default" : "outline"}
          onClick={() => setSelectedTool("input")}
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Input
        </Button>
        <Button
          variant={selectedTool === "output" ? "default" : "outline"}
          onClick={() => setSelectedTool("output")}
        >
          <ArrowDown className="w-4 h-4 mr-2" />
          Output
        </Button>
        <Button
          variant={selectedTool === "erase" ? "default" : "outline"}
          onClick={() => setSelectedTool("erase")}
        >
          <X className="w-4 h-4 mr-2" />
          Erase
        </Button>
      </div>

      {customBlocksMode && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Custom Blocks Mode: Click on placed ports to specify block types
          </p>
        </div>
      )}

      <div className="inline-block border-2 border-gray-400 p-2 bg-white">
        <div className="grid grid-cols-16 gap-0">
          {Array.from({ length: 16 }, (_, row) =>
            Array.from({ length: 16 }, (_, col) => {
              const x = col + 1
              const y = 16 - row
              const cell = gridData.find(c => c.x === x && c.y === y)
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={getCellClass(x, y)}
                  onClick={() => handleCellClick(x, y)}
                >
                  {getCellContent(x, y)}
                  {cell && customBlocksMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditBlock(x, y)
                      }}
                      className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5"
                    >
                      <Pencil className="w-2 h-2" />
                    </button>
                  )}
                </div>
              )
            }),
          )}
        </div>
      </div>

      {/* Block Details Editor */}
      {editingCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-bold mb-4">
              Block Details at ({editingCell.x}, {editingCell.y})
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Block Name</Label>
                <Input 
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  placeholder="e.g., Stone, Redstone Lamp"
                />
              </div>
              <div>
                <Label>Variation (Optional)</Label>
                <Input 
                  value={blockVariation}
                  onChange={(e) => setBlockVariation(e.target.value)}
                  placeholder="e.g., Polished, Mossy"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingCell(null)}>
                  Cancel
                </Button>
                <Button onClick={saveBlockDetails}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}