"use client"

import { useMemo, useState } from "react"
import type { Company, SlotAssignment } from "@/lib/types"
import CompanyItem from "./company-item"
import CompanySearch from "./company-search"

interface CompanyListProps {
  companies: Company[]
  slotAssignments: SlotAssignment[]
  onUpdateDays: (companyId: string, daysRegistered: "Both days" | "Only Wednesday" | "Only Thursday" | "") => void
}

export default function CompanyList({ companies, slotAssignments, onUpdateDays }: CompanyListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Calculate how many slots each company has assigned
  const companyAssignments = useMemo(() => {
    return companies.map((company) => {
      const assignedSlots = slotAssignments.filter((assignment) => assignment.companyId === company.id)

      return {
        ...company,
        assignedCount: assignedSlots.length,
        assignedSlots: assignedSlots.map((a) => a.slotId),
      }
    })
  }, [companies, slotAssignments])

  // Filter companies based on search term
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) {
      return companyAssignments
    }

    const term = searchTerm.toLowerCase()
    return companyAssignments.filter(
      (company) =>
        company.name.toLowerCase().includes(term) ||
        company.primaryMajor.toLowerCase().includes(term) ||
        company.symbol.toLowerCase().includes(term),
    )
  }, [companyAssignments, searchTerm])

  return (
    <div className="border rounded-lg p-4 bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">Companies</h2>

      <CompanySearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCompanies={companies.length}
        filteredCount={filteredCompanies.length}
      />

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <CompanyItem
              key={company.id}
              company={company}
              assignedCount={company.assignedCount}
              maxBooths={company.wedBooths + company.thurBooths}
              onUpdateDays={onUpdateDays}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            {searchTerm ? "No companies found matching your search." : "No companies available."}
          </div>
        )}
      </div>
    </div>
  )
}
