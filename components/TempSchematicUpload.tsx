// components/TempSchematicUpload.tsx
import Link from "next/link"
import { Plus } from "lucide-react"

export function TempSchematicUpload() {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md flex items-center space-x-2">
      <Plus className="w-4 h-4" />
      <Link
        href="https://drive.google.com/drive/u/0/folders/1XUrSFkjh8wvqizTHwZK7ly7JZyZXDHLp"
        className="underline font-medium hover:text-yellow-600 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="font-bold">!TEMPORARY!</span> If you want to contribute schematics, please upload them here. They will be added to this page soon.
      </Link>
    </div>
  )
}
