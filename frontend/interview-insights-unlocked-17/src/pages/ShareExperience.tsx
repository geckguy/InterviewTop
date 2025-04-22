
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"; 
import { Check, Info, Briefcase, Building, FileText, Star, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { shareExperience as shareExperienceApi } from "@/api/interviews"; 
import { InterviewExperience } from "@/types/backend";
const ShareExperience = () => {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formProgress, setFormProgress] = useState(25);
  const { toast } = useToast(); // Initialize toast
  const [isLoading, setIsLoading] = useState(false); // Add loading 
  
  // Form state
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    result: "pending",
    difficulty: "medium",
    interviewProcess: "",
    experience: "",
    tips: "",
    questions: "",
    anonymous: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (formStep === 1) {
      if (!formData.company || !formData.position) {
        toast({
          title: "Missing information",
          description: "Please fill in company name and position before proceeding.",
          variant: "destructive"
        });
        return;
      }
    }
    
    const newStep = formStep + 1;
    setFormStep(newStep);
    setFormProgress(newStep * 25);
  };

  const prevStep = () => {
    const newStep = formStep - 1;
    setFormStep(newStep);
    setFormProgress(newStep * 25);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
     // Add validation for the final step if needed
    if (formStep !== 4) {
          toast({ title: "Incomplete Form", description: "Please review all steps.", variant: "destructive" });
          return;
    }
  
      setIsLoading(true);
      try {
        // Prepare data for the backend
        // NOTE: This is a simplified mapping. A real app might need more complex structuring
        //       especially for nested fields like interview_details, leetcode_questions etc.
        //       The current backend model seems flexible with Optional fields.
        const experienceData: Partial<InterviewExperience> = {
          company: formData.company,
          position: formData.position,
          offer_status: formData.result, // Map frontend 'result' to backend 'offer_status'
        difficulty: formData.difficulty,
          // Map other fields like interviewProcess, experience, tips, questions
          // potentially into quality_reasoning or dedicated fields if backend supports it.
          // For now, let's add experience to quality_reasoning as an example:
          quality_reasoning: `Process: ${formData.interviewProcess}\nExperience: ${formData.experience}\nQuestions: ${formData.questions}\nTips: ${formData.tips}`,
          // anonymous flag needs handling if backend supports it
        };
  
        await shareExperienceApi(experienceData);
  
        toast({
        title: "Experience shared successfully!",
          description: "Thank you for contributing to the community.",
        });
        setFormSubmitted(true); // Show success screen
      } catch (error: any) {
        const errorMessage = error?.response?.data?.detail || "Failed to share experience. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
  };

  if (formSubmitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="my-6">
              <CardContent className="pt-6 px-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Thank You!</h2>
                <p className="text-gray-600 mb-6">
                  Your interview experience has been shared with the community. Your insights will help others prepare for their interviews.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                  <Button variant="outline" onClick={() => setFormSubmitted(false)}>
                    Share Another Experience
                  </Button>
                  <Button onClick={() => navigate("/explore")}>
                    Explore Other Experiences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Share Your Interview Experience</h1>
              <p className="text-gray-600">
                Help others by sharing your interview journey. Your insights are valuable to the community.
              </p>
            </div>
            
            <div className="mb-6">
              <Progress value={formProgress} className="h-2" />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Basic Info</span>
                <span>Interview Details</span>
                <span>Questions & Tips</span>
                <span>Review</span>
              </div>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5 text-brand-purple" />
                        <h2 className="text-xl font-semibold">Company & Position Details</h2>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name*</Label>
                        <Input 
                          id="company" 
                          placeholder="e.g. Google, Amazon, etc." 
                          value={formData.company}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Position Applied For*</Label>
                        <Input 
                          id="position" 
                          placeholder="e.g. Software Engineer, Product Manager" 
                          value={formData.position}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Interview Result</Label>
                        <RadioGroup 
                          value={formData.result} 
                          onValueChange={(value) => handleRadioChange("result", value)}
                        >
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2 bg-green-50 px-4 py-3 rounded-md border border-green-100">
                              <RadioGroupItem value="offer" id="offer" />
                              <Label htmlFor="offer" className="cursor-pointer">Offer</Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-red-50 px-4 py-3 rounded-md border border-red-100">
                              <RadioGroupItem value="rejected" id="rejected" />
                              <Label htmlFor="rejected" className="cursor-pointer">Rejected</Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-3 rounded-md border border-blue-100">
                              <RadioGroupItem value="pending" id="pending" />
                              <Label htmlFor="pending" className="cursor-pointer">Pending</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Interview Difficulty</Label>
                        <Select 
                          value={formData.difficulty}
                          onValueChange={(value) => handleSelectChange("difficulty", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
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
                  
                  {formStep === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-brand-purple" />
                        <h2 className="text-xl font-semibold">Interview Process & Experience</h2>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="interviewProcess">Interview Process Overview*</Label>
                        <Textarea 
                          id="interviewProcess" 
                          placeholder="Describe the interview process (number of rounds, types of interviews, timeline, etc.)" 
                          value={formData.interviewProcess}
                          onChange={handleChange}
                          rows={4} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experience">Your Interview Experience*</Label>
                        <Textarea 
                          id="experience" 
                          placeholder="Share details about your experience, how you felt, what surprised you, etc." 
                          value={formData.experience}
                          onChange={handleChange}
                          rows={6} 
                          required 
                        />
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-md border border-amber-100 flex gap-3">
                        <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Be honest and constructive</p>
                          <p className="mt-1">Your insights help others prepare, but remember to keep your feedback professional and constructive.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-brand-purple" />
                        <h2 className="text-xl font-semibold">Questions & Tips</h2>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="questions">Interview Questions Asked</Label>
                        <Textarea 
                          id="questions" 
                          placeholder="List specific questions you were asked during the interview (technical, behavioral, etc.)" 
                          value={formData.questions}
                          onChange={handleChange}
                          rows={6} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tips">Tips for Future Candidates</Label>
                        <Textarea 
                          id="tips" 
                          placeholder="What would you recommend to others interviewing for similar roles?" 
                          value={formData.tips}
                          onChange={handleChange}
                          rows={4} 
                        />
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Respecting confidentiality</p>
                          <p className="mt-1">Be mindful of sharing interview questions that might be under NDA. When in doubt, provide general topics instead of exact questions.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Check className="h-5 w-5 text-brand-purple" />
                        <h2 className="text-xl font-semibold">Review & Submit</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <Card className="border-gray-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Company & Position</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Company</p>
                                <p className="font-medium">{formData.company}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Position</p>
                                <p className="font-medium">{formData.position}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Result</p>
                                <p className="font-medium capitalize">{formData.result}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Difficulty</p>
                                <p className="font-medium capitalize">{formData.difficulty}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-gray-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Experience Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500">Interview Process</p>
                              <p className="text-sm mt-1">{formData.interviewProcess || "Not provided"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Experience</p>
                              <p className="text-sm mt-1">{formData.experience || "Not provided"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Questions</p>
                              <p className="text-sm mt-1">{formData.questions || "Not provided"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Tips</p>
                              <p className="text-sm mt-1">{formData.tips || "Not provided"}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-md border border-green-100">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-800">Your submission looks good! Ready to help the community?</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4">
                    {formStep > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Back
                      </Button>
                    )}
                    
                    {formStep < 4 ? (
                      <Button type="button" className="ml-auto bg-brand-purple hover:bg-brand-purple-dark" onClick={nextStep}>
                        Continue
                      </Button>
                    ) : (
                      <Button type="submit" className="ml-auto bg-brand-purple hover:bg-brand-purple-dark" disabled={isLoading}>
                        Submit Experience
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Why Share Your Experience?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-brand-purple-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Help Others</h4>
                    <p className="text-sm text-gray-600 mt-1">Your experience can guide others through their interview preparation.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-brand-purple-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <h4 className="font-medium">Improve Transparency</h4>
                    <p className="text-sm text-gray-600 mt-1">Increase transparency in the hiring process for everyone.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShareExperience;
