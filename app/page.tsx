import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow">
        {/* SECTION A — HERO */}
        <section className="relative h-[600px] flex items-center justify-center bg-gray-900 text-white">
          {/* Background image placeholder */}
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="relative z-20 text-center max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Find Your Next Home in Ghana</h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">Browse verified apartment listings across all regions — no agents, no stress.</p>

            {/* Main Search Bar Placeholder */}
            <div className="bg-white p-2 rounded-2xl shadow-lg flex flex-col md:flex-row gap-2 max-w-4xl mx-auto">
              <div className="flex-grow p-2 text-left">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Region</label>
                <select className="w-full text-text-primary focus:outline-none">
                  <option>Select Region</option>
                </select>
              </div>
              <div className="flex-grow p-2 text-left md:border-l border-border">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City or Town</label>
                <input type="text" placeholder="e.g. Accra" className="w-full text-text-primary focus:outline-none" />
              </div>
              <div className="flex-grow p-2 text-left md:border-l border-border">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <select className="w-full text-text-primary focus:outline-none">
                  <option>Any Type</option>
                </select>
              </div>
              <div className="flex-grow p-2 text-left md:border-l border-border">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget Max (GH₵)</label>
                <input type="number" placeholder="e.g. 2000" className="w-full text-text-primary focus:outline-none" />
              </div>
              <button className="bg-primary hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-all">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* SECTION B — LATEST LISTINGS */}
        <section className="max-w-1280 mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8">Recently Added Apartments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Placeholder cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-border">
                <div className="h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Verified Landlord</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Modern 2-Bedroom Apartment</h3>
                  <p className="text-primary font-bold text-lg mb-2">GH₵ 2,500 / month</p>
                  <p className="text-gray-500 text-sm">East Legon, Greater Accra</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION C — BROWSE BY REGION */}
        <section className="bg-white py-16">
          <div className="max-w-1280 mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Search by Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {["Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Volta"].map((region) => (
                <div key={region} className="aspect-square bg-background rounded-2xl flex flex-col items-center justify-center border border-border hover:border-primary cursor-pointer transition-all">
                  <span className="font-bold text-center px-2">{region}</span>
                  <span className="text-xs text-gray-500 mt-2">Browse listings</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION D — HOW IT WORKS */}
        <section className="max-w-1280 mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">How Hiredan Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-4">Search your location</h3>
              <p className="text-gray-600">Enter your region, city, and budget to find apartments near you.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-4">Browse and compare</h3>
              <p className="text-gray-600">View photos, read full details, and compare apartments side by side.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-4">Contact the landlord directly</h3>
              <p className="text-gray-600">Reach out by phone or WhatsApp with one tap. No middlemen.</p>
            </div>
          </div>
        </section>

        {/* SECTION E — WHY HIREDAN? */}
        <section className="bg-primary text-white py-16">
          <div className="max-w-1280 mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-white">Why Thousands of Ghanaians Choose Hiredan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Verified Landlords Only", desc: "Every landlord is identity-verified before they can post." },
                { title: "Real Photos Required", desc: "Minimum 3 photos per listing so you know what you are getting." },
                { title: "Free to Browse", desc: "No registration needed to search. Just open and explore." },
                { title: "Built for Ghana", desc: "Designed specifically for Ghanaian renters, landlords, and agents." }
              ].map((point) => (
                <div key={point.title} className="bg-white/10 p-6 rounded-2xl border border-white/20">
                  <h3 className="text-xl font-bold mb-4 text-white">{point.title}</h3>
                  <p className="text-gray-300">{point.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
