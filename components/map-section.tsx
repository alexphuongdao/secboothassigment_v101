"use client"
import Slot from "./slot"
import type { Company, SlotAssignment } from "@/lib/types"

interface MapSectionProps {
  sectionId: string
  isWallSection: boolean
  slotAssignments: SlotAssignment[]
  companies: Company[]
  onSlotAssignment: (companyId: string, slotId: string) => void
  onRemoveAssignment: (slotId: string) => void
}

export default function MapSection({
  sectionId,
  isWallSection,
  slotAssignments,
  companies,
  onSlotAssignment,
  onRemoveAssignment,
}: MapSectionProps) {
  // Filter slots for top and bottom sections
  const topSlots = slotAssignments.filter((slot) => slot.slotId.includes("-top-"))
  const bottomSlots = slotAssignments.filter((slot) => slot.slotId.includes("-bottom-"))

  // For middle sections, we need to split the slots into two columns
  const renderMiddleSectionSlots = (slots: SlotAssignment[], position: string) => {
    // First column: slots 1-8 (top) or 9-15 (bottom)
    const firstColumnSlots = slots.filter((slot) => {
      const slotNumber = Number.parseInt(slot.slotId.split("-")[2])
      return position === "top" ? slotNumber <= 8 : slotNumber <= 15
    })

    // Second column: slots 16-23 (top) or 24-30 (bottom)
    const secondColumnSlots = slots.filter((slot) => {
      const slotNumber = Number.parseInt(slot.slotId.split("-")[2])
      return position === "top" ? slotNumber >= 16 : slotNumber >= 24
    })

    return (
      <div className="grid grid-cols-2 gap-0.5">
        <div className="flex flex-col gap-0.5">
          {firstColumnSlots.map((slotAssignment) => {
            const company = slotAssignment.companyId ? companies.find((c) => c.id === slotAssignment.companyId) : null

            return (
              <Slot
                key={slotAssignment.slotId}
                slotId={slotAssignment.slotId}
                company={company}
                onSlotAssignment={onSlotAssignment}
                onRemoveAssignment={onRemoveAssignment}
              />
            )
          })}
        </div>
        <div className="flex flex-col gap-0.5">
          {secondColumnSlots.map((slotAssignment) => {
            const company = slotAssignment.companyId ? companies.find((c) => c.id === slotAssignment.companyId) : null

            return (
              <Slot
                key={slotAssignment.slotId}
                slotId={slotAssignment.slotId}
                company={company}
                onSlotAssignment={onSlotAssignment}
                onRemoveAssignment={onRemoveAssignment}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col border rounded-md p-1 bg-[#630000] min-w-[90px] flex-shrink-0">
      <div className="text-center font-bold mb-1 bg-gray-200 py-0.5 rounded text-xs">{sectionId}</div>

      {/* Top row slots */}
      {isWallSection ? (
        <div className="flex flex-col gap-0.5 mb-1">
          {topSlots.map((slotAssignment) => {
            const company = slotAssignment.companyId ? companies.find((c) => c.id === slotAssignment.companyId) : null

            return (
              <Slot
                key={slotAssignment.slotId}
                slotId={slotAssignment.slotId}
                company={company}
                onSlotAssignment={onSlotAssignment}
                onRemoveAssignment={onRemoveAssignment}
              />
            )
          })}
        </div>
      ) : (
        <div className="mb-1">{renderMiddleSectionSlots(topSlots, "top")}</div>
      )}

      {/* Hallway */}
      <div className="bg-yellow-200 text-center text-[8px] py-0.5 mb-1 rounded">Hallway</div>

      {/* Bottom row slots */}
      {isWallSection ? (
        <div className="flex flex-col gap-0.5">
          {bottomSlots.map((slotAssignment) => {
            const company = slotAssignment.companyId ? companies.find((c) => c.id === slotAssignment.companyId) : null

            return (
              <Slot
                key={slotAssignment.slotId}
                slotId={slotAssignment.slotId}
                company={company}
                onSlotAssignment={onSlotAssignment}
                onRemoveAssignment={onRemoveAssignment}
              />
            )
          })}
        </div>
      ) : (
        <div>{renderMiddleSectionSlots(bottomSlots, "bottom")}</div>
      )}
    </div>
  )
}
