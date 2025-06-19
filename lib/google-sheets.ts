import { google } from "googleapis"

const base64Key = process.env.GCP_CREDENTIALS_BASE64
if (!base64Key) {
  throw new Error("Missing GCP_CREDENTIALS_BASE64 in environment variables")
}
const credentials = JSON.parse(Buffer.from(base64Key, "base64").toString("utf-8"))

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const sheets = google.sheets({ version: "v4", auth })



export interface GoogleSheetsCompany {
  company: string
  primaryMajor: string
  wedBooths: number
  thurBooths: number
}

export class GoogleSheetsService {
  private spreadsheetId: string

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId
  }

  async getCompanies(): Promise<GoogleSheetsCompany[]> {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Sheet1!A:D", // Company, Primary Major, Wed Booths, Thur Booths
      })

      console.log("Google Sheets API response:", response.data) 
      
      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return []
      }

      // Skip header row and map data
      return rows.slice(1).map((row) => ({
        company: row[0] || "",
        primaryMajor: row[1] || "",
        wedBooths: Number.parseInt(row[2]) || 0,
        thurBooths: Number.parseInt(row[3]) || 0,
      }))
    } catch (error) {
      console.error("Error fetching companies from Google Sheets:", error)
      throw error
    }
  }

  async updateCompanies(companies: GoogleSheetsCompany[]): Promise<void> {
    try {
      const values = [
        ["Company", "Primary Major", "Wed Booths", "Thur Booths"],
        ...companies.map((company) => [
          company.company,
          company.primaryMajor,
          company.wedBooths.toString(),
          company.thurBooths.toString(),
        ]),
      ]

      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "Sheet1!A:D",
        valueInputOption: "RAW",
        requestBody: {
          values,
        },
      })
    } catch (error) {
      console.error("Error updating companies in Google Sheets:", error)
      throw error
    }
  }
}
