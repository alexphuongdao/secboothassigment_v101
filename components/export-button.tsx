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

    // New CSV header to match SEC format
    let csv = "COMPANY,DAYS REGISTERED,ASSIGNMENT\n"

    companies.forEach((company) => {
      const assignments = companyAssignments.get(company.id) || []
      // Simplify slot IDs: e.g., J-bottom-25 -> J25
      const assignmentStr = assignments
        .map(slotId => {
          const match = slotId.match(/^([A-Z])-(?:top|bottom)-(\d+)$/)
          return match ? `${match[1]}${match[2]}` : slotId
        })
        .join(", ")
      let daysRegistered = ""
      if (company.wedBooths && company.thurBooths) daysRegistered = "Wednesday Thursday"
      else if (company.wedBooths) daysRegistered = "Wednesday"
      else if (company.thurBooths) daysRegistered = "Thursday"

      csv += `"${company.name}","${daysRegistered}","${assignmentStr}"\n`
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


