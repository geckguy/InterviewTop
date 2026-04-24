// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, UserPlus, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <nav className="bg-white shadow-sm fixed w-full z-50 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none dark:border-b transition-colors"> {/* Added dark mode styling */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl font-bold text-brand-purple dark:text-[#977ECE]">
          InterviewLog
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`transition-colors text-sm ${isActive('/') ? 'text-brand-purple dark:text-[#977ECE] font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE]'}`}>
            Home
          </Link>
          <Link
            to="/companies"
            className={`transition-colors text-sm ${isActive('/companies') ? 'text-brand-purple dark:text-[#977ECE] font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE]'}`}>
            Companies
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`transition-colors text-sm ${isActive('/dashboard') ? 'text-brand-purple dark:text-[#977ECE] font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE]'}`}>
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
                className={`transition-colors text-sm ${isActive('/search') ? 'text-brand-purple dark:text-[#977ECE] font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE]'}`}>
                Search
              </Link>
            </>
          )}

          <Link
            to="/about"
            className={`transition-colors text-sm ${isActive('/about') ? 'text-brand-purple dark:text-[#977ECE] font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE]'}`}>
            About
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm" // Smaller button
              className="ml-4 dark:text-gray-300 dark:border-gray-700"
              onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" /> {/* Adjusted margin */}
              Sign Out
            </Button>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" size="sm" className="ml-4 dark:text-gray-300 dark:border-gray-700">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="ml-2 bg-brand-purple hover:bg-brand-purple-dark dark:bg-[#634B93] dark:text-gray-100 dark:hover:bg-[#543F7E]">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Theme Toggle - Mobile */}
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="dark:text-gray-300">
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
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg dark:shadow-none border-t border-gray-100 dark:border-gray-800 py-4 px-4 absolute w-full left-0 animate-fade-in"> {/* Added dark mode styling */}
          <div className="flex flex-col space-y-2"> {/* Reduced spacing */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${isActive('/') ? 'text-brand-purple dark:text-[#977ECE] font-medium bg-brand-purple-light dark:bg-opacity-10' : 'text-gray-700 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              Home
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${isActive('/companies') ? 'text-brand-purple dark:text-[#977ECE] font-medium bg-brand-purple-light dark:bg-opacity-10' : 'text-gray-700 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              Companies
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base ${isActive('/dashboard') ? 'text-brand-purple dark:text-[#977ECE] font-medium bg-brand-purple-light dark:bg-opacity-10' : 'text-gray-700 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
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
                  className={`block px-3 py-2 rounded-md text-base ${isActive('/search') ? 'text-brand-purple dark:text-[#977ECE] font-medium bg-brand-purple-light dark:bg-opacity-10' : 'text-gray-700 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  Search
                </Link>
              </>
            )}

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${isActive('/about') ? 'text-brand-purple dark:text-[#977ECE] font-medium bg-brand-purple-light dark:bg-opacity-10' : 'text-gray-700 dark:text-gray-300 hover:text-brand-purple dark:hover:text-[#977ECE] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              About
            </Link>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-2 flex flex-col space-y-2">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full justify-center dark:border-gray-700 dark:text-gray-300" // Center text
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
                    <Button variant="outline" className="justify-center w-full dark:border-gray-700 dark:text-gray-300">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full">
                    <Button className="bg-brand-purple hover:bg-brand-purple-dark dark:bg-[#634B93] dark:text-gray-100 dark:hover:bg-[#543F7E] w-full justify-center">
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