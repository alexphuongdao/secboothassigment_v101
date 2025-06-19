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
        const lines = csvText.split("\n")
        if (lines.length < 2) throw new Error("CSV file is empty or invalid")

        // Check header - updated to match new format
        const header = lines[0].split(",")
        const expectedHeaders = [
          "COMPANY",
          "PRIMARY MAJOR",
          "WED BOOTHS",
          "THUR BOOTHS",
          "DAYS REGISTERED",
          "ASSIGNMENT",
        ]

        if (!expectedHeaders.every((expectedHeader, index) => header[index] === expectedHeader)) {
          throw new Error(
            "CSV format is invalid. Expected headers: COMPANY, PRIMARY MAJOR, WED BOOTHS, THUR BOOTHS, DAYS REGISTERED, ASSIGNMENT",
          )
        }

        const importedCompanies: Partial<Company>[] = []
        const importedAssignments: { companyName: string; slotIds: string[] }[] = []

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue // Skip empty lines

          // Handle quoted CSV values properly
          const row = parseCSVLine(lines[i])
          if (row.length < 6) continue

          const companyName = row[0].trim()
          const primaryMajor = row[1].trim()
          const wedBooths = Number.parseInt(row[2].trim()) || 0
          const thurBooths = Number.parseInt(row[3].trim()) || 0
          const daysRegistered = row[4].trim() as "Both days" | "Only Wednesday" | "Only Thursday" | ""
          const assignmentStr = row[5].trim()

          // Add company info
          importedCompanies.push({
            name: companyName,
            primaryMajor,
            wedBooths,
            thurBooths,
            daysRegistered,
          })

          // Parse assignments
          if (assignmentStr) {
            const slotIds = assignmentStr.split(",").map((id) => id.trim())
            importedAssignments.push({
              companyName,
              slotIds,
            })
          }
        }

        // Call the import handler
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
        // Reset the file input
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
      // Reset the file input
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

    // Add the last field
    result.push(current)

    // Clean up quotes
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
