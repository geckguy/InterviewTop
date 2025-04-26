import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import CompanyBadge from "./CompanyBadge";

interface CompanyFilterProps {
  companies: string[];
  selectedCompanies: string[];
  onSelectCompany: (company: string) => void;
  onClearCompany: (company: string) => void;
  onClearAll: () => void;
}

const CompanyFilter = ({ 
  companies, 
  selectedCompanies, 
  onSelectCompany, 
  onClearCompany,
  onClearAll
}: CompanyFilterProps) => {
  const [showAll, setShowAll] = useState(false);
  const [stableCompanies, setStableCompanies] = useState<string[]>([]);
  
  // Use a separate effect to update stableCompanies only when needed
  useEffect(() => {
    // Only update if we have real companies to show and they're different
    if (companies.length > 0 && JSON.stringify(companies) !== JSON.stringify(stableCompanies)) {
      setStableCompanies([...companies]);
    }
  }, [companies, stableCompanies]);
  
  // Create sorted companies list with selected companies at the top
  const sortedCompanies = useMemo(() => {
    // First add all selected companies
    const result: string[] = [...selectedCompanies];
    
    // Then add all other companies that aren't already in the list
    stableCompanies.forEach(company => {
      if (!selectedCompanies.includes(company)) {
        result.push(company);
      }
    });
    
    return result;
  }, [selectedCompanies, stableCompanies]);
  
  // Display first 8 companies, and show all if showAll is true
  const displayedCompanies = showAll ? sortedCompanies : sortedCompanies.slice(0, 8);
  
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3 dark:text-gray-50">Filter by Company</h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onClearAll}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            selectedCompanies.length === 0
              ? "bg-brand-purple text-white dark:bg-[#7E69AB] dark:text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          )}
        >
          All
        </button>
        
        {displayedCompanies.map((company) => {
          const isSelected = selectedCompanies.includes(company);
          return (
            <button
              key={`company-${company}`}
              onClick={() => {
                if (isSelected) {
                  onClearCompany(company);
                } else {
                  onSelectCompany(company);
                }
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1.5",
                isSelected
                  ? "bg-brand-purple text-white dark:bg-[#7E69AB] dark:text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <CompanyBadge 
                name={company} 
                size="sm" 
                className={isSelected ? "bg-white bg-opacity-20 dark:bg-gray-900 dark:bg-opacity-20" : ""} 
              />
              <span>{company}</span>
            </button>
          );
        })}
        
        {sortedCompanies.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-white text-brand-purple border border-brand-purple hover:bg-brand-purple-light transition-colors dark:bg-gray-900 dark:text-brand-purple-light dark:border-brand-purple-light dark:hover:bg-gray-800"
          >
            {showAll ? "Show Less" : `+${sortedCompanies.length - 8} more`}
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyFilter;
