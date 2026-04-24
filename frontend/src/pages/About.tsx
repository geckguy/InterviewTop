// --- START OF FILE About.tsx ---

import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Briefcase } from "lucide-react";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">About InterviewLog</h1>
            </div>

            <Card className="my-6 dark:border-gray-700">
              <CardContent className="pt-6 dark:bg-gray-900">
                <div className="space-y-6">
                  <p className="text-brand-purple dark:text-[#977ECE] font-semibold text-lg text-center">
                    Real Interview Experiences. Real Logs.
                  </p>
                  
                  <p className="text-gray-700 dark:text-gray-300">
                    At InterviewLog, we believe great preparation starts with real stories.
                    We're building a platform where candidates openly share their genuine interview experiences—from application to offer (or rejection)—across top companies worldwide.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-brand-purple dark:text-[#977ECE]">Our mission is simple:</span> to make interview preparation more transparent, insightful, and effective by harnessing the power of shared experiences.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300">
                    By learning from others' wins and challenges, you'll gain valuable insights into company processes, interview formats, and common question types—helping you prepare smarter.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300">
                    Whether you're gearing up for your next opportunity or sharing your journey to help others, InterviewLog is your hub.
                    Let's make interview preparation better, together.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 rounded-md text-blue-600 dark:text-blue-300 mr-3">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">5,000+</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">Interview logs shared by the community</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-[#634B93] dark:bg-opacity-30 rounded-md text-purple-600 dark:text-purple-300 mr-3">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">500+</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">Top tech companies represented</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-md text-green-600 dark:text-green-300 mr-3">
                          <Users className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Join early</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">Be part of the first wave shaping the interview journey</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;