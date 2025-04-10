
import { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const topCompanies = [
    { name: "Google", interviews: 324, logo: "G" },
    { name: "Meta", interviews: 287, logo: "M" },
    { name: "Amazon", interviews: 412, logo: "A" },
    { name: "Microsoft", interviews: 301, logo: "M" },
    { name: "Apple", interviews: 256, logo: "A" },
    { name: "Netflix", interviews: 143, logo: "N" },
    { name: "Uber", interviews: 189, logo: "U" },
    { name: "Airbnb", interviews: 154, logo: "A" },
  ];
  
  const filteredCompanies = topCompanies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Browse Companies</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore interview experiences from top companies across the industry. Filter and find insights that matter to you.
            </p>
          </div>
          
          <div className="max-w-md mx-auto mb-10 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10 pr-4 py-6 bg-white"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCompanies.map((company, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-md flex items-center justify-center bg-${company.name === 'Google' ? 'blue' : company.name === 'Meta' ? 'indigo' : company.name === 'Amazon' ? 'yellow' : company.name === 'Microsoft' ? 'green' : company.name === 'Apple' ? 'gray' : company.name === 'Netflix' ? 'red' : 'purple'}-100 text-${company.name === 'Google' ? 'blue' : company.name === 'Meta' ? 'indigo' : company.name === 'Amazon' ? 'yellow' : company.name === 'Microsoft' ? 'green' : company.name === 'Apple' ? 'gray' : company.name === 'Netflix' ? 'red' : 'purple'}-600 font-bold`}>
                      {company.logo}
                    </div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {company.interviews} interview experiences
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Companies;
