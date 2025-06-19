import SlotAssignmentMap from "@/components/slot-assignment-map"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-2">
      <h1 className="text-2xl font-bold mb-4">SEC BOOTH ASSIGNMENT</h1>
      <div className="w-full overflow-x-auto">
        <SlotAssignmentMap />
      </div>
    </main>
  )
}
