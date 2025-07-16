"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Company } from "@/lib/types"

interface ImportButtonProps {
  onImport: (companies: Partial<Company>[], assignments: { companyName: string; slotIds: string[] }[]) => void
}

export default function ImportButton({ onImport }: ImportButtonProps) {
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)

  // Purpose of this is to handle the map change inhandleFileChange, basically help it change the slot ID format
  // from J-bottom-25 to J25, J-top-1 to J1,
  const mapSlotId = (id: string): string => {
      const match = id.match(/^([A-Z])(\d+)$/)
      if (!match) return id
      const letter = match[1]
      const num = Number(match[2])
      // Top slots: 1-8, 16-23; Bottom slots: 9-15, 24-30
      const isTop = (
        (num >= 1 && num <= 8) ||
        (num >= 16 && num <= 23)
      )
      const position = isTop ? "top" : "bottom"
      return `${letter}-${position}-${num}`
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        if (!csvText) throw new Error("Failed to read file")

        // Parse CSV
        const lines = csvText.split("\n").filter(line => line.trim().length > 0)
        if (lines.length < 2) throw new Error("CSV file is empty or invalid")

        // Check header - must match new format
        const header = lines[0].split(",").map(h => h.trim())
        const expectedHeaders = [
          "COMPANY",
          "DAYS REGISTERED",
          "ASSIGNMENT",
        ]

        if (!expectedHeaders.every((expectedHeader, index) => header[index] === expectedHeader)) {
          throw new Error(
            "CSV format is invalid. Expected headers: COMPANY, DAYS REGISTERED, ASSIGNMENT"
          )
        }

        const importedCompanies: Partial<Company>[] = []
        const importedAssignments: { companyName: string; slotIds: string[] }[] = []
        const mapDaysRegistered = (days: string): "" | "Both days" | "Only Wednesday" | "Only Thursday" => {
            if (days === "Wednesday Thursday") return "Both days"
            if (days === "Wednesday") return "Only Wednesday"
            if (days === "Thursday") return "Only Thursday"
            return ""
          }
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i])
          if (row.length < 3) continue

          const companyName = row[0].trim()
          const daysRegistered = row[1].trim()
          const assignmentStr = row[2].trim()

          importedCompanies.push({
                name: companyName,
                daysRegistered: mapDaysRegistered(daysRegistered),
          })

          if (assignmentStr) {
            const slotIds = assignmentStr
              .split(",")
              .map(id => id.trim())
              .filter(Boolean)
              .map(mapSlotId) // <-- map to internal format, look the mapSlotId function above
            importedAssignments.push({
              companyName,
              slotIds,
            })
          }
        }

        onImport(importedCompanies, importedAssignments)

        toast({
          title: "Import successful",
          description: `Imported ${importedCompanies.length} companies with assignments`,
        })
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
        event.target.value = ""
      }
    }

    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "Failed to read the file",
        variant: "destructive",
      })
      setIsImporting(false)
      event.target.value = ""
    }

    reader.readAsText(file)
  }

  // Helper function to parse CSV line handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }
    result.push(current)
    return result.map((field) => field.replace(/^"|"$/g, ""))
  }

  return (
    <div className="relative">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isImporting}
      />
      <Button size="sm" className="flex items-center gap-1" disabled={isImporting}>
        <Upload size={16} />
        <span>{isImporting ? "Importing..." : "Import CSV"}</span>
      </Button>
    </div>
  )
}