import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ThumbsUp, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-br from-brand-purple-light to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-4">
              Real Interview Experiences. <span className="text-brand-purple dark:text-[#7E69AB]">Real Logs.</span>
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md">
              Learn from thousands of shared interview logs across top companies to ace your next interview.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/search">
                <Button
                  size="lg"
                  className="bg-brand-purple hover:bg-brand-purple-dark text-white dark:bg-[#7E69AB] dark:text-white dark:hover:bg-[#6d5a95]"
                >
                  <Search className="mr-2 h-4 w-4" /> Search Experiences
                </Button>
              </Link>
              <Link to="/share-experience">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-brand-purple text-brand-purple hover:bg-brand-purple-light/20 dark:border-[#7E69AB] dark:text-[#7E69AB] dark:hover:bg-gray-800 dark:hover:border-[#6d5a95]"
                >
                  Share Your Experience <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="bg-white dark:bg-gray-900 dark:border-gray-800 rounded-lg shadow-xl p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <CompanyIllustration company="Google" />
                <div className="ml-4">
                  <h3 className="font-semibold dark:text-gray-50">Google</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Senior Software Engineer</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded dark:bg-green-900 dark:bg-opacity-30 dark:text-green-200 dark:border dark:border-green-800">Offer</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                "The interview process consisted of 5 rounds. First was a phone screen with a recruiter, followed by a technical phone interview..."
              </p>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Posted 2 days ago</span>
                <div className="flex space-x-3">
                  <span className="flex items-center">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    42
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    18
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-900 dark:border-gray-800 rounded-lg shadow-xl p-6 border border-gray-100 w-2/3 hidden md:block">
              <div className="flex items-center mb-4">
                <CompanyIllustration company="Meta" />
                <div className="ml-4">
                  <h3 className="font-semibold dark:text-gray-50">Meta</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Product Manager</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded dark:bg-red-900 dark:bg-opacity-30 dark:text-red-200 dark:border dark:border-red-800">Rejected</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                "The process was intense but fair. Started with an initial screening..."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple company logo illustration component
const CompanyIllustration = ({ company }: { company: string }) => {
  const colors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
    Google: { 
      bg: "bg-blue-100", text: "text-blue-600", 
      darkBg: "dark:bg-blue-900 dark:bg-opacity-30", darkText: "dark:text-blue-200" 
    },
    Meta: { 
      bg: "bg-indigo-100", text: "text-indigo-600", 
      darkBg: "dark:bg-indigo-900 dark:bg-opacity-30", darkText: "dark:text-indigo-200" 
    },
    Amazon: { 
      bg: "bg-yellow-100", text: "text-yellow-600", 
      darkBg: "dark:bg-yellow-900 dark:bg-opacity-30", darkText: "dark:text-yellow-200" 
    },
    Microsoft: { 
      bg: "bg-green-100", text: "text-green-600", 
      darkBg: "dark:bg-green-900 dark:bg-opacity-30", darkText: "dark:text-green-200" 
    },
    Apple: { 
      bg: "bg-gray-100", text: "text-gray-600", 
      darkBg: "dark:bg-gray-700", darkText: "dark:text-gray-200" 
    },
    Netflix: { 
      bg: "bg-red-100", text: "text-red-600", 
      darkBg: "dark:bg-red-900 dark:bg-opacity-30", darkText: "dark:text-red-200" 
    }
  };

  const { bg, text, darkBg, darkText } = colors[company] || { 
    bg: "bg-purple-100", text: "text-purple-600", 
    darkBg: "dark:bg-purple-900 dark:bg-opacity-30", darkText: "dark:text-purple-200" 
  };
  
  return (
    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${bg} ${text} ${darkBg} ${darkText} font-bold`}>
      {company.charAt(0)}
    </div>
  );
};

export default HeroSection;
