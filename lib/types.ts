export interface Company {
  id: string
  name: string
  primaryMajor: string
  wedBooths: number
  thurBooths: number
  symbol: string
  daysRegistered: "Both days" | "Only Wednesday" | "Only Thursday" | ""
}

export interface SlotAssignment {
  slotId: string
  companyId: string | null
}
