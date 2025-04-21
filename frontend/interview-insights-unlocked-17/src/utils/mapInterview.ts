import { InterviewExperience } from "@/types/backend";
import { InterviewCardProps } from "@/components/InterviewCard";

export const toCard = (e: InterviewExperience): InterviewCardProps => ({
  id: e.id!,
  company: e.company ?? "Unknown",
  role: e.position ?? "Unknown role",
  difficulty: (e.difficulty ?? "Medium").replace(/^\w/, x => x.toUpperCase()) as any,
  result: (e.offer_status ?? "Pending").replace(/^\w/, x => x.toUpperCase()) as any,
  date: new Date(e.createdAt ?? Date.now()),
  likes: 0,
  comments: 0,
  excerpt: e.quality_reasoning ?? "",
});
