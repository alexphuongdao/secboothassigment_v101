"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import MapSection from "./map-section"
import CompanyList from "./company-list"
import ExportButton from "./export-button"
import ImportButton from "./import-button"
import type { Company, SlotAssignment } from "@/lib/types"
import { generateInitialSlotData } from "@/lib/map-utils"
import { Button } from "@/components/ui/button"
import { Save, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SlotAssignmentMap() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [slotAssignments, setSlotAssignments] = useState<SlotAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/companies")
      if (!response.ok) {
        throw new Error("Failed to fetch companies")
      }
      const companiesData = await response.json()
      setCompanies(companiesData)
      setSlotAssignments(generateInitialSlotData())
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies from Google Sheets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveToGoogleSheets = async () => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companies,
          assignments: slotAssignments,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save to Google Sheets")
      }

      toast({
        title: "Success",
        description: "Data saved to Google Sheets successfully",
      })
    } catch (error) {
      console.error("Error saving to Google Sheets:", error)
      toast({
        title: "Error",
        description: "Failed to save data to Google Sheets",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleSlotAssignment = (companyId: string, slotId: string) => {
    // Find if company is already assigned to slots
    const existingAssignments = slotAssignments.filter((assignment) => assignment.companyId === companyId)

    // Get company to check how many booths they're allowed (Wed + Thu booths)
    const company = companies.find((c) => c.id === companyId)
    const maxBooths = company ? company.wedBooths + company.thurBooths : 0

    if (company && existingAssignments.length >= maxBooths) {
      // If company already has max booths, remove oldest assignment
      const oldestAssignment = existingAssignments[0]
      setSlotAssignments((prev) =>
        prev.map((assignment) =>
          assignment.slotId === oldestAssignment.slotId ? { ...assignment, companyId: null } : assignment,
        ),
      )
    }

    // Update the slot with the new company
    setSlotAssignments((prev) =>
      prev.map((assignment) => (assignment.slotId === slotId ? { ...assignment, companyId } : assignment)),
    )
  }

  const handleRemoveAssignment = (slotId: string) => {
    setSlotAssignments((prev) =>
      prev.map((assignment) => (assignment.slotId === slotId ? { ...assignment, companyId: null } : assignment)),
    )
  }

  const updateCompanyDays = (
    companyId: string,
    daysRegistered: "Both days" | "Only Wednesday" | "Only Thursday" | "",
  ) => {
    setCompanies((prev) => prev.map((company) => (company.id === companyId ? { ...company, daysRegistered } : company)))
  }

  const handleImport = (
    importedCompanies: Partial<Company>[],
    importedAssignments: { companyName: string; slotIds: string[] }[],
  ) => {
    // Update companies with imported data
    const updatedCompanies = [...companies]

    importedCompanies.forEach((importedCompany) => {
      const existingCompany = updatedCompanies.find((c) => c.name === importedCompany.name)

      if (existingCompany) {
        // Update existing company
        if (importedCompany.daysRegistered) {
          existingCompany.daysRegistered = importedCompany.daysRegistered
        }
      }
    })

    setCompanies(updatedCompanies)

    // Reset all slot assignments
    const resetAssignments = slotAssignments.map((assignment) => ({
      ...assignment,
      companyId: null,
    }))

    // Apply new assignments
    let newAssignments = [...resetAssignments]

    importedAssignments.forEach(({ companyName, slotIds }) => {
      const company = updatedCompanies.find((c) => c.name === companyName)

      if (company) {
        slotIds.forEach((slotId) => {
          newAssignments = newAssignments.map((assignment) =>
            assignment.slotId === slotId ? { ...assignment, companyId: company.id } : assignment,
          )
        })
      }
    })

    setSlotAssignments(newAssignments)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading companies from Google Sheets...</div>
  }

  // Create an array of section IDs from A to N
  const sectionIds = Array.from({ length: 14 }, (_, i) => String.fromCharCode(65 + i))

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-6 w-full">
        <div className="w-full overflow-auto">
          <div className="border rounded-lg p-4 bg-white shadow-md">
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Floor Map</h2>
              <div className="flex gap-2">
                <Button onClick={fetchCompanies} size="sm" variant="outline" className="flex items-center gap-1">
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </Button>
                <Button
                  onClick={saveToGoogleSheets}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  disabled={isSaving}
                >
                  <Save size={16} />
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </Button>
                <ExportButton companies={companies} slotAssignments={slotAssignments} />
                <ImportButton onImport={handleImport} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Drag companies to assign them to slots</p>

            {/* Single row with all sections */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full">
              {sectionIds.map((sectionId) => (
                <MapSection
                  key={sectionId}
                  sectionId={sectionId}
                  isWallSection={sectionId === "A" || sectionId === "N"}
                  slotAssignments={slotAssignments.filter((assignment) => assignment.slotId.startsWith(sectionId))}
                  companies={companies}
                  onSlotAssignment={handleSlotAssignment}
                  onRemoveAssignment={handleRemoveAssignment}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full">
          <CompanyList companies={companies} slotAssignments={slotAssignments} onUpdateDays={updateCompanyDays} />
        </div>
      </div>
    </DndProvider>
  )
}
