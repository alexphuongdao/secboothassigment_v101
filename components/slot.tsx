"use client"

import { useDrop } from "react-dnd"
import type { Company } from "@/lib/types"
import { X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SlotProps {
  slotId: string
  company: Company | null
  onSlotAssignment: (companyId: string, slotId: string) => void
  onRemoveAssignment: (slotId: string) => void
}

export default function Slot({ slotId, company, onSlotAssignment, onRemoveAssignment }: SlotProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "company",
    drop: (item: { id: string }) => {
      onSlotAssignment(item.id, slotId)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  // Extract slot number from slotId (e.g., "A-top-1" -> "1")
  const slotNumber = slotId.split("-")[2]

  const slotContent = (
    <div
      ref={drop}
      className={`
        w-full h-6 flex items-center justify-center text-[8px] rounded
        ${isOver ? "bg-blue-200" : company ? "bg-blue-500 text-white" : "bg-gray-200"}
        transition-colors duration-200 relative
      `}
    >
      {company ? (
        <>
          <span className="font-bold">{company.symbol}</span>
          <button
            onClick={() => onRemoveAssignment(slotId)}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center"
            aria-label="Remove assignment"
          >
            <X size={6} />
          </button>
        </>
      ) : (
        <span>{slotNumber}</span>
      )}
    </div>
  )

  // If there's a company assigned, wrap with tooltip
  if (company) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{slotContent}</TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{company.name}</p>
            <p className="text-xs text-gray-500">{company.sponsorship} Sponsor</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Otherwise just return the slot
  return slotContent
}
