
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ThumbsUp, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-br from-brand-purple-light to-white pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Real Interview Experiences. <span className="text-brand-purple">Real Insights.</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-md">
              Learn from thousands of shared interview experiences across top companies to ace your next interview.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/search">
                <Button
                  size="lg"
                  className="bg-brand-purple hover:bg-brand-purple-dark"
                >
                  <Search className="mr-2 h-4 w-4" /> Search Experiences
                </Button>
              </Link>
              <Link to="/share-experience">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-brand-purple text-brand-purple hover:bg-brand-purple-light"
                >
                  Share Your Experience <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                  >
                    {['JD', 'AM', 'TS', 'KL'][i]}
                  </div>
                ))}
              </div>
              <div className="ml-3 text-sm text-gray-600">
                Joined by <span className="font-semibold text-brand-purple">10,000+</span> professionals
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <CompanyIllustration company="Google" />
                <div className="ml-4">
                  <h3 className="font-semibold">Google</h3>
                  <p className="text-sm text-gray-600">Senior Software Engineer</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Offer</span>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-4">
                "The interview process consisted of 5 rounds. First was a phone screen with a recruiter, followed by a technical phone interview..."
              </p>
              <div className="flex justify-between text-xs text-gray-500">
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
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-xl p-6 border border-gray-100 w-2/3 hidden md:block">
              <div className="flex items-center mb-4">
                <CompanyIllustration company="Meta" />
                <div className="ml-4">
                  <h3 className="font-semibold">Meta</h3>
                  <p className="text-sm text-gray-600">Product Manager</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">Rejected</span>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
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
  const colors: Record<string, { bg: string; text: string }> = {
    Google: { bg: "bg-blue-100", text: "text-blue-600" },
    Meta: { bg: "bg-indigo-100", text: "text-indigo-600" },
    Amazon: { bg: "bg-yellow-100", text: "text-yellow-600" },
    Microsoft: { bg: "bg-green-100", text: "text-green-600" },
    Apple: { bg: "bg-gray-100", text: "text-gray-600" },
    Netflix: { bg: "bg-red-100", text: "text-red-600" }
  };

  const { bg, text } = colors[company] || { bg: "bg-purple-100", text: "text-purple-600" };
  
  return (
    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${bg} ${text} font-bold`}>
      {company.charAt(0)}
    </div>
  );
};

export default HeroSection;
