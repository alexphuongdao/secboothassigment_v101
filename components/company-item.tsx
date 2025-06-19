"use client"

import { useDrag } from "react-dnd"
import type { Company } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CompanyItemProps {
  company: Company
  assignedCount: number
  maxBooths: number
  onUpdateDays: (companyId: string, daysRegistered: "Both days" | "Only Wednesday" | "Only Thursday" | "") => void
}

export default function CompanyItem({ company, assignedCount, maxBooths, onUpdateDays }: CompanyItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "company",
    item: { id: company.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  // Calculate if company has reached its booth limit
  const isAtLimit = assignedCount >= maxBooths

  // Calculate total booths from Wed + Thur
  const totalBooths = company.wedBooths + company.thurBooths

  return (
    <div
      ref={drag}
      className={`
        p-3 border rounded-md cursor-move
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isAtLimit ? "bg-gray-100" : "bg-white hover:bg-blue-50"}
        transition-all duration-200
      `}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{company.name}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <Badge variant="outline">{company.primaryMajor}</Badge>
            <span className="text-xs">
              Wed: {company.wedBooths} | Thu: {company.thurBooths}
            </span>
            <span className={isAtLimit ? "text-red-500 font-bold" : ""}>
              {assignedCount}/{totalBooths} booths
            </span>
          </div>
        </div>
        <div className="text-sm">
          <Select value={company.daysRegistered} onValueChange={(value) => onUpdateDays(company.id, value as any)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select days</SelectItem>
              <SelectItem value="Both days">Both days</SelectItem>
              <SelectItem value="Only Wednesday">Only Wednesday</SelectItem>
              <SelectItem value="Only Thursday">Only Thursday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
