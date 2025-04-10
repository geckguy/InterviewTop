
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-10 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">InterviewInsights</h3>
            <p className="text-gray-600 text-sm">
              Helping candidates prepare with real interview experiences shared by the community.
            </p>
          </div>
          
          <div>
            <h4 className="text-gray-800 font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/companies" className="text-gray-600 text-sm hover:text-brand-purple">Companies</Link></li>
              <li><Link to="/topics" className="text-gray-600 text-sm hover:text-brand-purple">Topics</Link></li>
              <li><Link to="/latest" className="text-gray-600 text-sm hover:text-brand-purple">Latest Insights</Link></li>
              <li><Link to="/popular" className="text-gray-600 text-sm hover:text-brand-purple">Popular Experiences</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-800 font-medium mb-4">Community</h4>
            <ul className="space-y-2">
              <li><Link to="/share" className="text-gray-600 text-sm hover:text-brand-purple">Share Your Experience</Link></li>
              <li><Link to="/guidelines" className="text-gray-600 text-sm hover:text-brand-purple">Community Guidelines</Link></li>
              <li><Link to="/faq" className="text-gray-600 text-sm hover:text-brand-purple">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-600 text-sm hover:text-brand-purple">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-800 font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-600 text-sm hover:text-brand-purple">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 text-sm hover:text-brand-purple">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-gray-600 text-sm hover:text-brand-purple">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} InterviewInsights. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-brand-purple">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-brand-purple">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
