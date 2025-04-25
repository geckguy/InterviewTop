// --- START OF FILE About.tsx ---

import Navbar from "../components/Navbar";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-16 flex items-center"> {/* Centering content vertically */}
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center"> {/* Centered text, slightly narrower */}
            {/* Main Header */}
            <h1 className="text-4xl font-bold mb-4">About InterviewInsights</h1>
            <p className="text-gray-600 mb-8"> {/* Increased bottom margin */}
              Real interview experiences. Real preparation.
            </p>

            {/* Condensed Content */}
            <div className="prose prose-lg max-w-none text-left md:text-center space-y-4"> {/* Larger text, centered on medium screens */}
              <p>
                InterviewInsights aims to demystify the hiring process by providing a platform where individuals share genuine interview experiences from various companies.
              </p>
              <p>
                Our goal is simple: leverage collective knowledge to help everyone prepare more effectively. By learning from the successes and challenges of others, you can gain valuable insights into company processes, question patterns, and expected difficulties.
              </p>
              <p>
                Whether you're gearing up for your next interview or have valuable experiences to contribute, join our community today. Let's make interview preparation more transparent and accessible together.
              </p>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default About;