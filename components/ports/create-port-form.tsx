"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, ArrowLeft } from "lucide-react"
import PortGrid from "./port-grid"
import { supabase } from "@/lib/supabase"
import { Checkbox } from "@/components/ui/checkbox"

interface GridCell {
  x: number
  y: number
  type: "input" | "output" | "passthrough" | null
  group?: number // For grouping multiple blocks
}

export default function CreatePortForm() {
  const [formData, setFormData] = useState({
    type: "",
    portCount: 1,
    role: "SD",
    description: "",
    isPassthrough: false,
    inputCount: 1,
    outputCount: 1,
    usesMoreBlocks: false,
    blockSize: 1,
    showGridColors: true, // New state for showing colors on grid
  })

  const [gridData, setGridData] = useState<GridCell[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const analyzeGridDirection = (gridData: GridCell[]) => {
    const inputs = gridData.filter(cell => cell.type === "input").length
    const outputs = gridData.filter(cell => cell.type === "output").length
    const passthroughs = gridData.filter(cell => cell.type === "passthrough").length

    if (passthroughs > 0) return "P" // Passthrough
    if (inputs > 0 && outputs > 0) return `${inputs}I${outputs}O` // Custom input/output counts
    if (inputs > 0) return `${inputs}I` // Input only
    if (outputs > 0) return `${outputs}O` // Output only
    return "" // No ports placed
  }

  const generatePortName = () => {
    const direction = analyzeGridDirection(gridData)
    if (!direction || !formData.type) return ""

    let name = formData.isPassthrough ? "P" : direction
    name += formData.type

    if (formData.portCount > 1) {
      name += `-${formData.portCount}`
    }

    if (formData.role !== "SD") {
      name += `-${formData.role}`
    }

    if (formData.usesMoreBlocks && formData.blockSize > 1) {
      name += `-${formData.blockSize}B`
    }

    return name
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (gridData.length === 0) {
      setError("Please place at least one port on the grid")
      setLoading(false)
      return
    }

    try {
      const portName = generatePortName()

      const { error: insertError } = await supabase.from("ports").insert([
        {
          name: portName,
          direction: analyzeGridDirection(gridData),
          type: formData.type,
          port_count: formData.portCount,
          role: formData.role,
          description: formData.description,
          is_passthrough: formData.isPassthrough,
          input_count: formData.inputCount,
          output_count: formData.outputCount,
          block_size: formData.usesMoreBlocks ? formData.blockSize : 1,
          grid_data: gridData,
          created_by: null,
          show_grid_colors: formData.showGridColors, // Save the color preference
        },
      ])

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        type: "",
        portCount: 1,
        role: "SD",
        description: "",
        isPassthrough: false,
        inputCount: 1,
        outputCount: 1,
        usesMoreBlocks: false,
        blockSize: 1,
        showGridColors: true, // Reset to default
      })
      setGridData([])
    } catch (err: any) {
      setError(err.message || "Failed to create port")
    } finally {
      setLoading(false)
    }
  }

  const currentDirection = analyzeGridDirection(gridData)
  const getDirectionLabel = (dir: string) => {
    if (dir === "P") return "Passthrough"
    if (dir.includes("I") && dir.includes("O")) return `Custom (${dir})`
    if (dir.includes("I")) return `Input (${dir.replace("I", "")}×)`
    if (dir.includes("O")) return `Output (${dir.replace("O", "")}×)`
    return "No ports placed"
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-green-600">Port Created!</CardTitle>
          <CardDescription>Your port has been successfully added to the community database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
            Create Another Port
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">Create New Port</CardTitle>
          <CardDescription>
            Define a new port following the BIGSTONE Port Standards. Place inputs and outputs on the grid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="passthrough"
                    checked={formData.isPassthrough}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, isPassthrough: Boolean(checked) }))
                      if (checked) {
                        setGridData([]) // Clear grid when switching to passthrough
                      }
                    }}
                  />
                  <Label htmlFor="passthrough">Passthrough Port</Label>
                </div>

                {!formData.isPassthrough && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inputCount">Input Count</Label>
                        <Input
                          id="inputCount"
                          type="number"
                          min="1"
                          max="16"
                          value={formData.inputCount}
                          onChange={(e) =>
                            setFormData(prev => ({ ...prev, inputCount: Number(e.target.value) || 1 }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="outputCount">Output Count</Label>
                        <Input
                          id="outputCount"
                          type="number"
                          min="1"
                          max="16"
                          value={formData.outputCount}
                          onChange={(e) =>
                            setFormData(prev => ({ ...prev, outputCount: Number(e.target.value) || 1 }))
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIN">Binary (BIN)</SelectItem>
                      <SelectItem value="HEX">Hexadecimal (HEX)</SelectItem>
                      <SelectItem value="ITEM">Item</SelectItem>
                      <SelectItem value="FLY">Fly (FLY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portCount">Number of Ports</Label>
                  <Input
                    id="portCount"
                    type="number"
                    min="1"
                    max="16"
                    value={formData.portCount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, portCount: Number.parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">Standard (SD)</SelectItem>
                      <SelectItem value="STATE">State</SelectItem>
                      <SelectItem value="CLK">Clock</SelectItem>
                      <SelectItem value="RST">Reset</SelectItem>
                      <SelectItem value="WATER">Water stream</SelectItem>
                      <SelectItem value="HOPPER">Hopper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="moreBlocks"
                    checked={formData.usesMoreBlocks}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, usesMoreBlocks: Boolean(checked) }))
                    }
                  />
                  <Label htmlFor="moreBlocks">Uses More Blocks</Label>
                </div>

                {formData.usesMoreBlocks && (
                  <div className="space-y-2">
                    <Label htmlFor="blockSize">Block Size</Label>
                    <Input
                      id="blockSize"
                      type="number"
                      min="1"
                      max="16"
                      value={formData.blockSize}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, blockSize: Number(e.target.value) || 1 }))
                      }
                    />
                  </div>
                )}

                {/* New checkbox for toggling grid colors */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showGridColors"
                    checked={formData.showGridColors}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, showGridColors: Boolean(checked) }))
                    }
                  />
                  <Label htmlFor="showGridColors">Show Colors on Grid</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the port's functionality..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">Detected Direction:</Label>
                  <div className="text-lg font-bold text-blue-600">
                    {getDirectionLabel(currentDirection)}
                  </div>
                </div>

                {currentDirection && formData.type && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium">Generated Port Name:</Label>
                    <div className="text-lg font-mono font-bold text-blue-600">
                      {generatePortName()}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Port Layout</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    {formData.isPassthrough
                      ? "Click on the grid to place passthrough ports (•)"
                      : "Click on the grid to place inputs (↑) and outputs (↓)"}
                  </p>
                  <PortGrid
                    gridData={gridData}
                    onGridChange={setGridData}
                    isPassthrough={formData.isPassthrough}
                    blockSize={formData.usesMoreBlocks ? formData.blockSize : 1}
                    showColors={formData.showGridColors} // Pass the color toggle to PortGrid
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Port..." : "Create Port"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
