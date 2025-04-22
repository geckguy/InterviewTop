import { useState, useMemo } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { fetchCompaniesSummary, CompanyInfo } from '@/api/interviews'; // Import the API call and type
import CompanyBadge from '@/components/CompanyBadge'; // Import CompanyBadge

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data using react-query
  const { data: companiesData, isLoading, error } = useQuery<CompanyInfo[], Error>({
    queryKey: ['companiesSummary'], // Unique key for this query
    queryFn: fetchCompaniesSummary   // The function to call
  });

  // Memoize the filtering logic
  const filteredCompanies = useMemo(() => {
    if (!companiesData) return []; // Guard clause if data isn't loaded yet
    return companiesData.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companiesData, searchTerm]); // Correctly closed useMemo hook

  return (
    <>
      <Navbar />
      {/* Outer wrapper with padding */}
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4"> {/* Inner container */}

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Browse Companies</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore interview experiences from top companies across the industry. Filter and find insights that matter to you.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10 pr-4 py-6 bg-white"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-10">Loading companies...</div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-10 text-red-600">
              Error fetching companies: {error.message}
            </div>
          )}

          {/* Data Display Area */}
          {!isLoading && !error && (
            <> {/* Fragment to group grid and no-results message */}
              {filteredCompanies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredCompanies.map((company, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">{company.name}</CardTitle>
                        <CompanyBadge name={company.name} size="md" />
                      </CardHeader>
                      <CardContent>
                        {/* Removed duplicate CardTitle from here */}
                        <CardDescription className="text-sm">
                          {company.interview_count} interview experiences
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                 /* No Results Found (after filtering) */
                <div className="text-center py-10 text-gray-500">No companies found matching your search.</div>
              )}
            </>
          )}
        </div> {/* Close inner container */}
      </div> {/* Close outer wrapper */}
      <Footer />
    </>
  );
};

export default Companies;