import { Header } from "@/components/header"
import { SettingsTabs } from "@/components/settings-tab"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Header />
      <main className="container mx-auto px-6 py-6">
        <SettingsTabs />
      </main>
    </div>
  )
}
