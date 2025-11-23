import { Header } from "@/components/header"
import { CarrierManagement } from "@/components/carrier-management"

export default function CarriersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <CarrierManagement />
      </main>
    </div>
  )
}
