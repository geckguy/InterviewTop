import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InterviewCard from "@/components/InterviewCard";
import CompanyFilter from "@/components/CompanyFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

import { fetchInterviews } from "@/api/interviews";
import { toCard } from "@/utils/mapInterview";
import { InterviewCardProps } from "@/components/InterviewCard";

function useSearchParams() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // —— local state —————————————————————————
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [results, setResults] = useState<InterviewCardProps[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(0);
  const TAKE = 20;

  // —— effect: search on mount / param change ————————————————
  useEffect(() => {
    (async () => {
      setLoading(true);

      const { experiences } = await fetchInterviews({
        search_term: searchQuery || undefined,
        company: selectedCompany || undefined,
        sort_by: sortBy === "recent" ? "date_desc" : "date_asc",
        skip: page * TAKE,
        limit: TAKE,
      });

      // first page → replace, next pages → concat
      setResults(p => (page === 0 ? experiences.map(toCard) : [...p, ...experiences.map(toCard)]));

      // gather company list once per query (only when page 0)
      if (page === 0) {
        setCompanies(
          Array.from(
            new Set(experiences.map(e => e.company).filter(Boolean))
          ) as string[]
        );
      }

      setLoading(false);
    })();
  }, [searchQuery, selectedCompany, sortBy, page]);

  // —— helpers ——————————————————————————————————
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);                                      // reset pagination
    navigate({ search: `?q=${encodeURIComponent(searchQuery)}` }, { replace: true });
  };

  const sortedResults = useMemo(() => {
    switch (sortBy) {
      case "popularity":
        return [...results].sort((a, b) => b.likes - a.likes);
      case "comments":
        return [...results].sort((a, b) => b.comments - a.comments);
      default:
        return results;
    }
  }, [results, sortBy]);

  // —— render ———————————————————————————————————
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Search Interview Experiences</h1>

          {/* search bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-8">
            <Input
              placeholder="Search by company, role, keyword…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 py-6"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-purple">
              Search
            </Button>
          </form>

          {/* filter toggle (mobile) */}
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex justify-between"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </span>
              {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* sidebar */}
            <aside className={`md:w-1/4 space-y-4 ${showFilters ? "block" : "hidden md:block"}`}>
              <CompanyFilter
                companies={companies}
                selectedCompany={selectedCompany}
                onSelectCompany={c => {
                  setSelectedCompany(c);
                  setPage(0);
                }}
              />
              {/* extra filters can be added here */}
            </aside>

            {/* results */}
            <section className="md:w-3/4">
              <Card className="mb-6">
                <CardContent className="p-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {loading ? "Loading…" : `${results.length} results`}
                  </p>
                  <Tabs value={sortBy} onValueChange={v => setSortBy(v)} className="w-auto">
                    <TabsList className="h-8 bg-gray-100">
                      <TabsTrigger value="recent" className="text-xs h-6 px-2">
                        Recent
                      </TabsTrigger>
                      <TabsTrigger value="popularity" className="text-xs h-6 px-2">
                        Likes
                      </TabsTrigger>
                      <TabsTrigger value="comments" className="text-xs h-6 px-2">
                        Comments
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {sortedResults.length ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {sortedResults.map((i) => (
                      <InterviewCard key={i.id} {...i} />
                    ))}
                  </div>

                  {/* pagination */}
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      disabled={loading}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Load more
                    </Button>
                  </div>
                </>
              ) : (
                !loading && (
                  <Card className="p-8 text-center">
                    <h3 className="font-semibold">No results</h3>
                    <p className="text-gray-600 mt-1">Try a different query or company filter.</p>
                  </Card>
                )
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
