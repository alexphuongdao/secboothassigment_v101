import { NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import type { Company } from "@/lib/types"

// Replace with your actual Google Sheets ID
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID
const sheetsService = new GoogleSheetsService(SPREADSHEET_ID)

export async function GET() {
  try {
    const googleCompanies = await sheetsService.getCompanies()

    // Transform Google Sheets data to our Company format
    const companies: Company[] = googleCompanies.map((gCompany, index) => {
      // Determine days registered based on Wed/Thur booth counts
      let daysRegistered: "Both days" | "Only Wednesday" | "Only Thursday" | "" = ""

      const gDaysRegistered = gCompany.daysRegistered

      if (gDaysRegistered.includes("Wednesday") && gDaysRegistered.includes("Thursday")) {
        daysRegistered = "Both days"
      } else if (gDaysRegistered.includes("Wednesday")) {
        daysRegistered = "Only Wednesday"
      } else if (gDaysRegistered.includes("Thursday")) {
        daysRegistered = "Only Thursday"
      }

      // Generate company symbol from first letters of company name
      const symbol = gCompany.company
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2)

      return {
        id: (index + 1).toString(),
        name: gCompany.company,
        primaryMajor: gCompany.primaryMajor || "General",
        wedBooths: gCompany.boothsAllotted,
        thurBooths: gCompany.boothsAllotted,
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
      const daysRegistered = company.daysRegistered
      let gDaysRegistered: string[] = []

      if (daysRegistered === "Both days") {
        gDaysRegistered = ["Wednesday", "Thursday"];
      } else if (daysRegistered === "Only Wednesday") {
        gDaysRegistered = ["Wednesday"];
      } else if (daysRegistered === "Only Thursday") {
        gDaysRegistered = ["Thursday"];
      } else {
        gDaysRegistered = [];
      }

      return {
        company: company.name,
        primaryMajor: company.primaryMajor,
        boothsAllotted: company.wedBooths,
        daysAttending: gDaysRegistered,
        assignments: [],
      }
    })

    await sheetsService.updateCompanies(googleCompanies)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating companies:", error)
    return NextResponse.json({ error: "Failed to update companies" }, { status: 500 })
  }
}
