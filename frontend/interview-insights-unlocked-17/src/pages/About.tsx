// --- START OF FILE About.tsx ---

import Navbar from "../components/Navbar";
import { Card, CardContent } from "@/components/ui/card";

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
                  <p className="text-brand-purple dark:text-[#7E69AB] font-semibold text-lg text-center">
                    Real Interview Experiences. Real Logs.
                  </p>
                  
                  <p className="text-gray-700 dark:text-gray-300">
                    At InterviewLog, we believe great preparation starts with real stories.
                    We're building a platform where candidates openly share their genuine interview experiences—from application to offer (or rejection)—across top companies worldwide.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-brand-purple dark:text-[#7E69AB]">Our mission is simple:</span> to make interview preparation more transparent, insightful, and effective by harnessing the power of shared experiences.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300">
                    By learning from others' wins and challenges, you'll gain valuable insights into company processes, interview formats, and common question types—helping you prepare smarter.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300">
                    Whether you're gearing up for your next opportunity or sharing your journey to help others, InterviewLog is your hub.
                    Let's make interview preparation better, together.
                  </p>
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