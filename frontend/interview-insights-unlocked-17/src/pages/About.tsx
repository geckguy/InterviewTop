
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">About InterviewInsights</h1>
              <p className="text-gray-600">
                Helping candidates prepare with real interview experiences since 2023.
              </p>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-lg mb-6">
                InterviewInsights was founded with a simple mission: to provide transparency and real-world insights into the interview processes at top companies around the world.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
              <p>
                We believe that interview preparation shouldn't be shrouded in mystery. By collecting and sharing real interview experiences, we help candidates:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Understand what to expect in interviews at specific companies</li>
                <li>Learn from both successful and unsuccessful interview experiences</li>
                <li>Identify patterns in interview questions and formats</li>
                <li>Better prepare for their own interviews</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Community</h2>
              <p>
                InterviewInsights is powered by a community of professionals who generously share their experiences to help others. Our platform brings together:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Job seekers preparing for interviews</li>
                <li>Professionals who have gone through interview processes</li>
                <li>Career advisors and mentors</li>
                <li>Company representatives who want to improve their hiring processes</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Join Us</h2>
              <p>
                Whether you're preparing for an upcoming interview or have experiences to share, we invite you to join our community. Together, we can make the interview process more transparent and accessible for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
