import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, UserPlus, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const handleSignOut = () => {
    logout();
    setMobileMenuOpen(false);
  };
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm fixed w-full z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl font-bold text-brand-purple">
          InterviewInsights
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`transition-colors ${isActive('/') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            Home
          </Link>
          <Link
            to="/companies"
            className={`transition-colors ${isActive('/companies') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            Companies
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`transition-colors ${isActive('/dashboard') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
                Dashboard
              </Link>
              <Link
                to="/explore"
                className={`transition-colors ${isActive('/explore') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
                Explore
              </Link>
              <Link
                to="/search"
                className={`transition-colors ${isActive('/search') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
                Search
              </Link>
            </>
          )}

          <Link
            to="/about"
            className={`transition-colors ${isActive('/about') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            About
          </Link>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <Button
              variant="outline"
              className="ml-4"
              onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" className="ml-4">
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
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md py-4 px-4 animate-fade-in">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-2 py-2 rounded-md ${isActive('/') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}>
              Home
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-2 py-2 rounded-md ${isActive('/companies') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}>
              Companies
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-2 py-2 rounded-md ${isActive('/dashboard') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}>
                  Dashboard
                </Link>
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-2 py-2 rounded-md ${isActive('/explore') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}>
                  Explore
                </Link>
                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-2 py-2 rounded-md ${isActive('/search') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}>
                  Search
                </Link>
              </>
            )}

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-2 py-2 rounded-md ${isActive('/about') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-600 hover:text-brand-purple hover:bg-gray-50'}`}>
              About
            </Link>

            <div className="pt-2 flex flex-col space-y-2">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="justify-start w-full">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}>
                    <Button className="bg-brand-purple hover:bg-brand-purple-dark w-full">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
