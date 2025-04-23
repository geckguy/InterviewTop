// src/components/Navbar.tsx
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
    setMobileMenuOpen(false); // Close menu on sign out
  };
  const isActive = (path: string) => location.pathname === path || (path === '/search' && location.pathname.startsWith('/interview/')); // Keep search active on post page

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50"> {/* Increased z-index */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl font-bold text-brand-purple">
          InterviewInsights
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`transition-colors text-sm ${isActive('/') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            Home
          </Link>
          <Link
            to="/companies"
            className={`transition-colors text-sm ${isActive('/companies') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            Companies
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`transition-colors text-sm ${isActive('/dashboard') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
                Dashboard
              </Link>
              {/* --- REMOVE EXPLORE LINK --- */}
              {/*
              <Link
                to="/explore"
                className={`transition-colors text-sm ${isActive('/explore') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
                Explore
              </Link>
               */}
               {/* --- END REMOVE EXPLORE LINK --- */}
              <Link
                to="/search"
                className={`transition-colors text-sm ${isActive('/search') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
                Search
              </Link>
            </>
          )}

          <Link
            to="/about"
            className={`transition-colors text-sm ${isActive('/about') ? 'text-brand-purple font-medium' : 'text-gray-600 hover:text-brand-purple'}`}>
            About
          </Link>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm" // Smaller button
              className="ml-4"
              onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> {/* Adjusted margin */}
              Sign Out
            </Button>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" size="sm" className="ml-4">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="ml-2 bg-brand-purple hover:bg-brand-purple-dark">
                  <UserPlus className="mr-1.5 h-4 w-4" />
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
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100 py-4 px-4 absolute w-full left-0 animate-fade-in"> {/* Added absolute positioning */}
          <div className="flex flex-col space-y-2"> {/* Reduced spacing */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${isActive('/') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-700 hover:text-brand-purple hover:bg-gray-50'}`}>
              Home
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${isActive('/companies') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-700 hover:text-brand-purple hover:bg-gray-50'}`}>
              Companies
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base ${isActive('/dashboard') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-700 hover:text-brand-purple hover:bg-gray-50'}`}>
                  Dashboard
                </Link>
                {/* --- REMOVE EXPLORE LINK --- */}
                {/*
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base ${isActive('/explore') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-700 hover:text-brand-purple hover:bg-gray-50'}`}>
                  Explore
                </Link>
                 */}
                 {/* --- END REMOVE EXPLORE LINK --- */}
                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base ${isActive('/search') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-700 hover:text-brand-purple hover:bg-gray-50'}`}>
                  Search
                </Link>
              </>
            )}

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${isActive('/about') ? 'text-brand-purple font-medium bg-brand-purple-light' : 'text-gray-700 hover:text-brand-purple hover:bg-gray-50'}`}>
              About
            </Link>

            <div className="pt-4 border-t border-gray-100 mt-2 flex flex-col space-y-2">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full justify-center" // Center text
                  onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full">
                    <Button variant="outline" className="justify-center w-full">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full">
                    <Button className="bg-brand-purple hover:bg-brand-purple-dark w-full justify-center">
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