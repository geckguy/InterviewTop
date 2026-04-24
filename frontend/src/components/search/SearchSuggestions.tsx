
import { useState, useEffect } from 'react';
import { X, TrendingUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestionsProps {
  query: string;
  onSelectSuggestion: (suggestion: string) => void;
  onClose: () => void;
}

const SearchSuggestions = ({ query, onSelectSuggestion, onClose }: SearchSuggestionsProps) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trendingSearches] = useState([
    "Software Engineer Google interview",
    "Amazon behavioral questions",
    "Meta system design",
    "Microsoft coding challenge",
    "Apple product manager"
  ]);

  // Simulate fetching suggestions based on query
  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }

    // Simulate API call with mock suggestions based on query
    // In a real app, this would be an API call
    const mockSuggestions = [
      `${query} interview questions`,
      `${query} technical interview`,
      `${query} system design`,
      `${query} behavioral questions`,
      `${query} offer negotiation`
    ];
    
    setSuggestions(mockSuggestions);
  }, [query]);

  const handleSelectSuggestion = (suggestion: string) => {
    onSelectSuggestion(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    onClose();
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-lg border border-gray-200 z-50 mt-1">
      <div className="p-4">
        {query.trim() === '' ? (
          <>
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Trending Searches</h3>
            </div>
            <ul className="space-y-2">
              {trendingSearches.map((search, index) => (
                <li key={index}>
                  <button
                    className="flex items-center w-full text-left px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => handleSelectSuggestion(search)}
                  >
                    <Search className="h-3.5 w-3.5 text-gray-400 mr-2" />
                    {search}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Suggestions</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    className="flex items-center w-full text-left px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <Search className="h-3.5 w-3.5 text-gray-400 mr-2" />
                    <span dangerouslySetInnerHTML={{
                      __html: suggestion.replace(
                        new RegExp(query, 'gi'),
                        match => `<span class="font-semibold text-brand-purple">${match}</span>`
                      )
                    }} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;
