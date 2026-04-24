// --- START OF FILE ShareExperience.tsx ---

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
// import Footer from "../components/Footer"; // Removing unused import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Check, Info, Briefcase, Building, FileText, Star, AlertTriangle, Users, Loader2, Link as LinkIcon, ArrowRight } from "lucide-react"; // Added Loader2, LinkIcon, ArrowRight
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Tabs imports as they are not used in the simplified structure
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removed Separator as it might not be needed in the simplified review
// import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { shareExperience as shareExperienceApi } from "@/api/interviews";
import { InterviewExperience } from "@/types/backend"; // Import detailed types if needed later


// Simplified structure for this iteration
interface SimplifiedFormData {
    company: string;
    position: string;
    seniority: string; // Added
    location: string; // Added
    result: string; // Maps to offer_status
    difficulty: string;
    interviewProcessRounds: string; // Text area for rounds
    leetcodeQuestions: string; // Text area for coding questions
    designQuestions: string; // Text area for design questions
    behavioralQuestions: string; // Text area for behavioral/other
    tips: string;
    problemLinks: string; // Comma-separated links
    // anonymous: boolean; // Removed anonymous for now, backend doesn't handle it yet
}

const ShareExperience = () => {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formProgress, setFormProgress] = useState(25); // 4 steps
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state using the simplified structure
  const [formData, setFormData] = useState<SimplifiedFormData>({
    company: "",
    position: "",
    seniority: "", // Added
    location: "", // Added
    result: "pending",
    difficulty: "medium",
    interviewProcessRounds: "",
    leetcodeQuestions: "",
    designQuestions: "",
    behavioralQuestions: "",
    tips: "",
    problemLinks: "",
    // anonymous: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: keyof SimplifiedFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: keyof SimplifiedFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    // --- Step 1 Validation ---
    if (formStep === 1) {
      if (!formData.company || !formData.position) {
        toast({ title: "Missing information", description: "Please fill in Company Name and Position.", variant: "destructive" });
        return;
      }
    }
    // --- Step 2 Validation ---
    if (formStep === 2) {
       if (!formData.interviewProcessRounds) {
          toast({ title: "Missing information", description: "Please provide an overview of the interview rounds.", variant: "destructive" });
          return;
       }
    }
    // --- Step 3 Validation (Optional, less critical) ---
    // if (formStep === 3) { ... }

    const newStep = formStep + 1;
    setFormStep(newStep);
    setFormProgress(Math.min(100, newStep * 25)); // Update progress (4 steps total)
  };

  const prevStep = () => {
    const newStep = formStep - 1;
    setFormStep(newStep);
    setFormProgress(Math.max(25, newStep * 25)); // Update progress
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formStep !== 4) {
      toast({ title: "Incomplete Form", description: "Please review all steps before submitting.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // Map simplified frontend state to the backend InterviewExperience model
      const experienceData: Partial<InterviewExperience> = {
        company: formData.company || null,
        position: formData.position || null,
        seniority: formData.seniority || null,
        location: formData.location || null,
        offer_status: formData.result || null,
        difficulty: formData.difficulty || null,

        // Combine textual descriptions. Backend might parse later or just display.
        // Example: Store round descriptions in interview_details (needs backend adjustment or store as text)
        // For simplicity now, let's combine into quality_reasoning (or a new field)
        // Let's attempt to structure interview_details slightly from the text
        interview_details: formData.interviewProcessRounds
          ? [{ round_number: 1, type: "General Process", questions: [formData.interviewProcessRounds] }] // Simplified structure
          : undefined,

        // Combine questions into quality_reasoning or specific fields if backend supports
        // Option 1: Combine into quality_reasoning
        quality_reasoning: `Coding Questions:\n${formData.leetcodeQuestions || 'N/A'}\n\nDesign Questions:\n${formData.designQuestions || 'N/A'}\n\nBehavioral/Other:\n${formData.behavioralQuestions || 'N/A'}\n\nTips:\n${formData.tips || 'N/A'}`,

        // Option 2: Map to specific fields (if backend model adjusted)
        // leetcode_questions: formData.leetcodeQuestions ? [{ problem_statement: formData.leetcodeQuestions }] : undefined,
        // design_questions: formData.designQuestions ? [{ description: formData.designQuestions }] : undefined,
        // Add behavioral questions if model supports

        // Handle problem links (split comma-separated string)
        problem_link: formData.problemLinks
          ? formData.problemLinks.split(',').map(link => link.trim()).filter(link => link)
          : undefined,
      };

      console.log("Submitting data:", experienceData); // Log before sending

      await shareExperienceApi(experienceData);

      toast({
        title: "Experience shared successfully!",
        description: "Thank you for contributing to the community.",
      });
      setFormSubmitted(true); // Show success screen

    } catch (error: any) {
      console.error("Submission error:", error); // Log detailed error
      const errorMessage = error?.response?.data?.detail || "Failed to share experience. Please try again.";
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  // --- Success Screen (No Changes Needed) ---
  if (formSubmitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="my-6 dark:border-gray-700">
              <CardContent className="pt-6 px-6 text-center dark:bg-gray-900">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3 dark:text-gray-50">Thank You!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your interview experience has been submitted. Your insights will help others prepare.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                  <Button variant="outline" onClick={() => {
                      // Reset form state completely when sharing another
                      setFormData({
                          company: "", position: "", seniority: "", location: "",
                          result: "pending", difficulty: "medium",
                          interviewProcessRounds: "", leetcodeQuestions: "",
                          designQuestions: "", behavioralQuestions: "", tips: "",
                          problemLinks: ""
                      });
                      setFormStep(1);
                      setFormProgress(25);
                      setFormSubmitted(false);
                  }}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Share Another Experience
                  </Button>
                  <Button onClick={() => navigate("/search")}
                  className="bg-brand-purple hover:bg-brand-purple-dark dark:bg-[#7E69AB] dark:text-white dark:hover:bg-[#6d5a95]">
                    Search Experiences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </>
    );
  }

  // --- Form UI ---
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Share Your Interview Experience</h1>
              <p className="text-gray-600">
                Help others by sharing your interview journey. Your insights are valuable.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <Progress value={formProgress} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-gray-500 px-1">
                <span className={formStep >= 1 ? 'font-medium text-brand-purple' : ''}>Basic Info</span>
                <span className={formStep >= 2 ? 'font-medium text-brand-purple' : ''}>Process</span>
                <span className={formStep >= 3 ? 'font-medium text-brand-purple' : ''}>Questions & Tips</span>
                <span className={formStep >= 4 ? 'font-medium text-brand-purple' : ''}>Review</span>
              </div>
            </div>

            <Card className="dark:border-gray-700">
              <CardContent className="pt-6 dark:bg-gray-900">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* --- STEP 1: Basic Info --- */}
                  {formStep === 1 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5 text-brand-purple" />
                        <h2 className="text-xl font-semibold">Company & Role Details</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company Name*</Label>
                          <Input id="company" placeholder="e.g., Google" value={formData.company} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position Applied For*</Label>
                          <Input id="position" placeholder="e.g., Software Engineer" value={formData.position} onChange={handleChange} required />
                        </div>
                      </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="seniority">Seniority Level</Label>
                          <Input id="seniority" placeholder="e.g., Senior, L4, Intern" value={formData.seniority} onChange={handleChange}/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" placeholder="e.g., Remote, London, UK" value={formData.location} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Interview Result*</Label>
                        <RadioGroup value={formData.result} onValueChange={(value) => handleRadioChange("result", value)} className="flex flex-wrap gap-3">
                          {(['offer', 'rejected', 'pending'] as const).map((res) => (
                             <div key={res} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 has-[:checked]:border-brand-purple dark:has-[:checked]:border-brand-purple-light has-[:checked]:bg-brand-purple-light dark:has-[:checked]:bg-brand-purple/20">
                               <RadioGroupItem value={res} id={res} />
                               <Label htmlFor={res} className="cursor-pointer capitalize">{res}</Label>
                             </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Overall Interview Difficulty*</Label>
                        <Select value={formData.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                          <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="very-hard">Very Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* --- STEP 2: Interview Process --- */}
                  {formStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-brand-purple" />
                        <h2 className="text-xl font-semibold">Interview Process</h2>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interviewProcessRounds">Describe the Interview Rounds*</Label>
                        <Textarea
                          id="interviewProcessRounds"
                          placeholder="Explain the stages. e.g.,
Round 1: Recruiter call (30 mins)
Round 2: Technical phone screen (1 hr, coding)
Round 3-5: Onsite loop (coding, system design, behavioral)..."
                          value={formData.interviewProcessRounds}
                          onChange={handleChange}
                          rows={8}
                          required
                        />
                         <p className="text-xs text-gray-500">Include number of rounds, types (coding, design, behavioral), and duration if possible.</p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-md border border-amber-100 dark:border-amber-800 flex gap-3">
                        <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 dark:text-amber-300">Focus on the structure and flow of the interview process here.</p>
                      </div>
                    </div>
                  )}

                  {/* --- STEP 3: Questions & Tips --- */}
                  {formStep === 3 && (
                    <div className="space-y-6 animate-fade-in">
                       <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-brand-purple" />
                        <h2 className="text-xl font-semibold">Questions & Tips</h2>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leetcodeQuestions">Coding Questions</Label>
                        <Textarea
                          id="leetcodeQuestions"
                          placeholder="List specific coding problems or topics. e.g.,
- Two Sum (variation)
- Graph traversal (BFS on a grid)
- Asked about time/space complexity..."
                          value={formData.leetcodeQuestions}
                          onChange={handleChange}
                          rows={5}
                        />
                        <p className="text-xs text-gray-500">Provide problem names (if known), topics, or descriptions.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="designQuestions">System Design Questions</Label>
                        <Textarea
                          id="designQuestions"
                          placeholder="Describe system design tasks. e.g.,
- Design a URL shortener
- Scalability considerations for a social media feed..."
                          value={formData.designQuestions}
                          onChange={handleChange}
                          rows={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="behavioralQuestions">Behavioral / Other Questions</Label>
                        <Textarea
                          id="behavioralQuestions"
                          placeholder="Mention key behavioral questions or discussions. e.g.,
- Tell me about a time you failed.
- Why this company?
- Questions about past projects..."
                          value={formData.behavioralQuestions}
                          onChange={handleChange}
                          rows={5}
                        />
                      </div>

                       <div className="space-y-2">
                          <Label htmlFor="problemLinks">Relevant Links (Optional)</Label>
                          <Input
                              id="problemLinks"
                              placeholder="e.g., LeetCode links, article URLs (comma-separated)"
                              value={formData.problemLinks}
                              onChange={handleChange}
                          />
                          <p className="text-xs text-gray-500">Separate multiple URLs with commas (,).</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tips">Tips for Future Candidates</Label>
                        <Textarea
                          id="tips"
                          placeholder="What advice would you give? e.g.,
- Practice company-specific questions.
- Be prepared to explain your thought process clearly.
- Study system design principles..."
                          value={formData.tips}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>

                       <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border border-blue-100 dark:border-blue-800 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">Please be mindful of NDAs. Share general topics or question types if specific wording is confidential.</p>
                       </div>
                    </div>
                  )}

                   {/* --- STEP 4: Review --- */}
                  {formStep === 4 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center gap-2 mb-4">
                        <Check className="h-5 w-5 text-brand-purple" />
                        <h2 className="text-xl font-semibold">Review & Submit</h2>
                      </div>

                      {/* Review Section - Display collected data */}
                      <Card className="border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-3 pt-4 dark:bg-gray-900"><CardTitle className="text-lg dark:text-gray-50">Basic Info</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm dark:bg-gray-900">
                          <div><span className="text-gray-500 dark:text-gray-400">Company:</span> <span className="dark:text-gray-100">{formData.company}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Position:</span> <span className="dark:text-gray-100">{formData.position}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Seniority:</span> <span className="dark:text-gray-100">{formData.seniority || 'N/A'}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Location:</span> <span className="dark:text-gray-100">{formData.location || 'N/A'}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Result:</span> <span className="capitalize dark:text-gray-100">{formData.result}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Difficulty:</span> <span className="capitalize dark:text-gray-100">{formData.difficulty}</span></div>
                        </CardContent>
                      </Card>

                       <Card className="border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-3 pt-4 dark:bg-gray-900"><CardTitle className="text-lg dark:text-gray-50">Interview Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm dark:bg-gray-900">
                            <ReviewSection title="Interview Rounds" content={formData.interviewProcessRounds} />
                            <ReviewSection title="Coding Questions" content={formData.leetcodeQuestions} />
                            <ReviewSection title="System Design" content={formData.designQuestions} />
                            <ReviewSection title="Behavioral/Other" content={formData.behavioralQuestions} />
                            <ReviewSection title="Tips" content={formData.tips} />
                            <ReviewSection title="Links" content={formData.problemLinks} />
                        </CardContent>
                      </Card>

                       <div className="flex items-center space-x-2 p-4 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-100 dark:border-green-800">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-300">Please review your submission. Click "Submit Experience" when ready.</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                    <Button type="button" variant="outline" onClick={prevStep} disabled={formStep === 1 || isLoading}
                      className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      Back
                    </Button>
                    {formStep < 4 ? (
                      <Button type="button" className="bg-brand-purple hover:bg-brand-purple-dark dark:bg-[#493B65] dark:text-white dark:hover:bg-[#3d3154]" onClick={nextStep} disabled={isLoading}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" className="bg-brand-purple hover:bg-brand-purple-dark dark:bg-[#493B65] dark:text-white dark:hover:bg-[#3d3154] min-w-[150px]" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          "Submit Experience"
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Why Share Section (No Changes Needed) */}
            <div className="mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-gray-50">Why Share Your Experience?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-brand-purple-light dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-brand-purple dark:text-brand-purple-light" />
                  </div>
                  <div>
                    <h4 className="font-medium dark:text-gray-100">Help Others</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Guide others through their interview preparation.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-brand-purple-light dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-brand-purple dark:text-brand-purple-light" />
                  </div>
                  <div>
                    <h4 className="font-medium dark:text-gray-100">Improve Transparency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Make the hiring process clearer for everyone.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

// Helper component for the review step
const ReviewSection = ({ title, content }: { title: string; content?: string }) => {
  if (!content) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">{title}</p>
      <p className="text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-600 dark:text-gray-200">{content}</p>
    </div>
  );
};

export default ShareExperience;