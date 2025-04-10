
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, Search, X, LogIn, UserPlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold text-brand-purple">
            InterviewInsights
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`transition-colors ${isActive('/') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            Home
          </Link>
          <Link to="/companies" className={`transition-colors ${isActive('/companies') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            Companies
          </Link>
          <Link to="/explore" className={`transition-colors ${isActive('/explore') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            Explore
          </Link>
          <Link to="/search" className={`transition-colors ${isActive('/search') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            Search
          </Link>
          <Link to="/about" className={`transition-colors ${isActive('/about') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            About
          </Link>
          <div className="flex items-center ml-4">
            <Link to="/search">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/signin">
              <Button variant="outline" className="ml-2">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="ml-2 bg-brand-purple hover:bg-brand-purple-dark">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md py-4 px-4 animate-fade-in">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className={`px-2 py-2 rounded-md ${isActive('/') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/companies" 
              className={`px-2 py-2 rounded-md ${isActive('/companies') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Companies
            </Link>
            <Link 
              to="/explore" 
              className={`px-2 py-2 rounded-md ${isActive('/explore') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              to="/search"
              className={`px-2 py-2 rounded-md ${isActive('/search') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <Link 
              to="/about" 
              className={`px-2 py-2 rounded-md ${isActive('/about') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="justify-start w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="justify-start w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="bg-brand-purple hover:bg-brand-purple-dark w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
