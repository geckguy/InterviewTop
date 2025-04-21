import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import CompanyFilter from "@/components/CompanyFilter";
import InterviewCard from "@/components/InterviewCard";
import { fetchRecent, fetchInterviews } from "@/api/interviews";
import { toCard } from "@/utils/mapInterview";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const Index = () => {
  /* ---------------------------- state ---------------------------- */
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const [companies,           setCompanies]           = useState<string[]>([]);
  const [featuredInterviews,  setFeaturedInterviews]  = useState<any[]>([]);
  const [filteredInterviews,  setFilteredInterviews]  = useState<any[]>([]);

  /* ------------------------ fetch on mount ----------------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        /* 1. featured block – always latest 3 hard‑coded */
        const recent   = await fetchRecent(3);
        setFeaturedInterviews(recent.map(toCard));

        /* 2. recent + filter block */
        const page = await fetchInterviews({
          company: selectedCompany ?? undefined,
          limit:   12,
        });

        setFilteredInterviews(page.experiences.map(toCard));

        /* build company list for filter sidebar */
        setCompanies(
          Array.from(
            new Set(page.experiences.map(e => e.company).filter(Boolean))
          ) as string[]
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCompany]);

  /* --------------------------- UI --------------------------- */
  if (loading) return <p style={{ padding: 40, textAlign: "center" }}>Loading…</p>;
  if (error)   return <p style={{ padding: 40, textAlign: "center", color: "red" }}>Error: {error}</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <HeroSection />
        <StatsSection />

        {/* ---------- Featured ---------- */}
        {featuredInterviews.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Featured Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredInterviews.map((i) => (
                  <InterviewCard key={i.id} {...i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Recent & filters ---------- */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Experiences</h2>
              <Link to="/explore">
                <Button variant="ghost" className="text-brand-purple">View All</Button>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* sidebar */}
              <aside className="md:w-1/4">
                <CompanyFilter
                  companies={companies}
                  selectedCompany={selectedCompany}
                  onSelectCompany={setSelectedCompany}
                />
              </aside>

              {/* cards */}
              <div className="md:w-3/4">
                {filteredInterviews.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterviews.map((i) => (
                      <InterviewCard key={i.id} {...i} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No interviews found.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
