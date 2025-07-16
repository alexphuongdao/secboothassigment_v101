import { NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import type { Company } from "@/lib/types"

//  using the Google Sheets ID (secret in environment variables, ask me (Alex) to provide for you)
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID
const sheetsService = new GoogleSheetsService(SPREADSHEET_ID)

export async function GET() {
  try {
    const googleCompanies = await sheetsService.getCompanies()

    // Transform Google Sheets data to our Company format
    const companies: Company[] = googleCompanies.map((gCompany, index) => {
      // Determine days registered based on Wed/Thur booth counts
      let daysRegistered: "Both days" | "Only Wednesday" | "Only Thursday" | "" = ""

      const hasWednesday = gCompany.wedBooths > 0
      const hasThursday = gCompany.thurBooths > 0

      if (hasWednesday && hasThursday) {
        daysRegistered = "Both days"
      } else if (hasWednesday) {
        daysRegistered = "Only Wednesday"
      } else if (hasThursday) {
        daysRegistered = "Only Thursday"
      }

      // Generate company symbol from first letters of company name
      const symbol = gCompany.company
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2)

      // Total booths is the sum of Wed and Thur booths
      const totalBooths = gCompany.wedBooths + gCompany.thurBooths

      return {
        id: (index + 1).toString(),
        name: gCompany.company,
        primaryMajor: gCompany.primaryMajor || "General",
        wedBooths: gCompany.wedBooths,
        thurBooths: gCompany.thurBooths,
        symbol: symbol || "XX",
        daysRegistered,
      }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { companies, assignments } = await request.json()

    // Transform back to Google Sheets format
    const googleCompanies = companies.map((company: Company) => {
      return {
        company: company.name,
        primaryMajor: company.primaryMajor,
        wedBooths: company.wedBooths,
        thurBooths: company.thurBooths,
      }
    })

    await sheetsService.updateCompanies(googleCompanies)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating companies:", error)
    return NextResponse.json({ error: "Failed to update companies" }, { status: 500 })
  }
}
