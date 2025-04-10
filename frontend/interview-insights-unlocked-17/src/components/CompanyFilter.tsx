
import { cn } from "@/lib/utils";
import { useState } from "react";
import CompanyBadge from "./CompanyBadge";

interface CompanyFilterProps {
  companies: string[];
  selectedCompany: string | null;
  onSelectCompany: (company: string | null) => void;
}

const CompanyFilter = ({ companies, selectedCompany, onSelectCompany }: CompanyFilterProps) => {
  const [showAll, setShowAll] = useState(false);
  
  // Display first 8 companies, and show all if showAll is true
  const displayedCompanies = showAll ? companies : companies.slice(0, 8);
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Filter by Company</h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCompany(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            selectedCompany === null
              ? "bg-brand-purple text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          All
        </button>
        
        {displayedCompanies.map((company) => (
          <button
            key={company}
            onClick={() => onSelectCompany(company)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1.5",
              selectedCompany === company
                ? "bg-brand-purple text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <CompanyBadge name={company} size="sm" className={selectedCompany === company ? "bg-white bg-opacity-20" : ""} />
            <span>{company}</span>
          </button>
        ))}
        
        {companies.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-white text-brand-purple border border-brand-purple hover:bg-brand-purple-light transition-colors"
          >
            {showAll ? "Show Less" : `+${companies.length - 8} more`}
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyFilter;
