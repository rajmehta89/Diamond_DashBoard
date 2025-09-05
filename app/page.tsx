import { fetchDiamondData } from "@/lib/google-sheets"
import { DiamondPricingDashboard } from "@/components/diamond-pricing-dashboard"

export default async function HomePage() {
  const diamondData = await fetchDiamondData()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4"> Diamond Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
           diamond pricing data with professional grade clarity and precision  
          </p>
        </header>

        <DiamondPricingDashboard initialData={diamondData} />
      </div>
    </main>
  )
}
