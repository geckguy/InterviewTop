
import { BookOpen, Users, Briefcase } from "lucide-react";

const StatsSection = () => {
  return (
    <div className="bg-brand-purple-light py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-10">The Knowledge Hub for Interview Preparation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-md text-blue-600 mr-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">5,000+</h3>
            </div>
            <p className="text-gray-700">Interview experiences shared by the community</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-md text-purple-600 mr-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">500+</h3>
            </div>
            <p className="text-gray-700">Top tech companies represented in our database</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-md text-green-600 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Join early.</h3>
            </div>
            <p className="text-gray-700">Be part of the first wave shaping the interview journey</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
