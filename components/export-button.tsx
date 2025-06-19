"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Company, SlotAssignment } from "@/lib/types"

interface ExportButtonProps {
  companies: Company[]
  slotAssignments: SlotAssignment[]
}

export default function ExportButton({ companies, slotAssignments }: ExportButtonProps) {
  const handleExport = () => {
    // Create a map of company IDs to their assigned slots
    const companyAssignments = new Map<string, string[]>()

    slotAssignments.forEach((assignment) => {
      if (assignment.companyId) {
        if (!companyAssignments.has(assignment.companyId)) {
          companyAssignments.set(assignment.companyId, [])
        }
        companyAssignments.get(assignment.companyId)?.push(assignment.slotId)
      }
    })

    // Create CSV header matching the new format
    let csv = "COMPANY,PRIMARY MAJOR,WED BOOTHS,THUR BOOTHS,DAYS REGISTERED,ASSIGNMENT\n"

    // Add data for each company
    companies.forEach((company) => {
      const assignments = companyAssignments.get(company.id) || []
      if (assignments.length > 0) {
        // Format the assignments as a comma-separated list
        const assignmentStr = assignments.join(", ")

        // Add the company data to the CSV
        csv += `"${company.name}","${company.primaryMajor}","${company.wedBooths}","${company.thurBooths}","${company.daysRegistered}","${assignmentStr}"\n`
      }
    })

    // Create a blob and download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "slot_assignments.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={handleExport} size="sm" className="flex items-center gap-1">
      <Download size={16} />
      <span>Export to CSV</span>
    </Button>
  )
}
