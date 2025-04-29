import { BookOpen, Users, Briefcase } from "lucide-react";

const StatsSection = () => {
  return (
    <div className="bg-brand-purple-light dark:bg-gray-800 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-50 mb-10">InterviewLog: Your Interview Preparation Hub</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 rounded-md text-blue-600 dark:text-blue-300 mr-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">3,000+</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Interview logs in the database</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 rounded-md text-purple-600 dark:text-purple-300 mr-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">500+</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Top tech companies represented in our database</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-md text-green-600 dark:text-green-300 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">Join early.</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Be part of the first wave shaping the interview journey</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
