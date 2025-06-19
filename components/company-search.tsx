"use client"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CompanySearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  totalCompanies: number
  filteredCount: number
}

export default function CompanySearch({
  searchTerm,
  onSearchChange,
  totalCompanies,
  filteredCount,
}: CompanySearchProps) {
  const handleClear = () => {
    onSearchChange("")
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X size={14} />
          </Button>
        )}
      </div>
      <div className="text-sm text-gray-500">
        {searchTerm ? (
          <>
            Showing {filteredCount} of {totalCompanies} companies
          </>
        ) : (
          <>Total: {totalCompanies} companies</>
        )}
      </div>
    </div>
  )
}
