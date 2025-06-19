import type { SlotAssignment } from "./types"

export function generateInitialSlotData(): SlotAssignment[] {
  const slotAssignments: SlotAssignment[] = []

  // Create an array of section IDs from A to N
  const sectionIds = Array.from({ length: 14 }, (_, i) => String.fromCharCode(65 + i))

  sectionIds.forEach((sectionId) => {
    const isWallSection = sectionId === "A" || sectionId === "N"

    if (isWallSection) {
      // Wall sections (A and N) have only 1 column with 15 slots total
      // Top row: 8 slots
      for (let i = 1; i <= 8; i++) {
        slotAssignments.push({
          slotId: `${sectionId}-top-${i}`,
          companyId: null,
        })
      }

      // Bottom row: 7 slots
      for (let i = 9; i <= 15; i++) {
        slotAssignments.push({
          slotId: `${sectionId}-bottom-${i}`,
          companyId: null,
        })
      }
    } else {
      // Middle sections (B through M) have 2 columns with 30 slots total

      // First column, top row: 8 slots (1-8)
      for (let i = 1; i <= 8; i++) {
        slotAssignments.push({
          slotId: `${sectionId}-top-${i}`,
          companyId: null,
        })
      }

      // First column, bottom row: 7 slots (9-15)
      for (let i = 9; i <= 15; i++) {
        slotAssignments.push({
          slotId: `${sectionId}-bottom-${i}`,
          companyId: null,
        })
      }

      // Second column, top row: 8 slots (16-23)
      for (let i = 16; i <= 23; i++) {
        slotAssignments.push({
          slotId: `${sectionId}-top-${i}`,
          companyId: null,
        })
      }

      // Second column, bottom row: 7 slots (24-30)
      for (let i = 24; i <= 30; i++) {
        slotAssignments.push({
          slotId: `${sectionId}-bottom-${i}`,
          companyId: null,
        })
      }
    }
  })

  return slotAssignments
}
