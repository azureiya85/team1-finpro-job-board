// CreateSkillInput: payload for creating a new skill/assessment
export interface CreateSkillInput {
  title: string;
  description?: string;
  passingScore: number;
  timeLimit: number; // in minutes
}
