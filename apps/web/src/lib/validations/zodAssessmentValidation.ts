import { z } from 'zod';

export const SkillCategoryCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().optional(),
  icon: z.string().url("Must be a valid URL").optional(),
});
export type SkillCategoryCreateInput = z.infer<typeof SkillCategoryCreateSchema>;

export const SkillCategoryUpdateSchema = SkillCategoryCreateSchema.partial();
export type SkillCategoryUpdateInput = z.infer<typeof SkillCategoryUpdateSchema>;

export const SkillAssessmentCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().optional(),
  passingScore: z.coerce.number().min(0).max(100).default(75),
  timeLimit: z.coerce.number().min(5, "Time limit must be at least 5 minutes").default(30), // minutes
  isActive: z.boolean().default(true),
  categoryId: z.string().cuid("Invalid category ID"),
});
export type SkillAssessmentCreateInput = z.infer<typeof SkillAssessmentCreateSchema>;

export const SkillAssessmentUpdateSchema = SkillAssessmentCreateSchema.partial();
export type SkillAssessmentUpdateInput = z.infer<typeof SkillAssessmentUpdateSchema>;

const QuestionOptionSchema = z.string().min(1, "Option cannot be empty");
export const SkillAssessmentQuestionCreateSchema = z.object({
  question: z.string().min(10, "Question text is too short"),
  optionA: QuestionOptionSchema,
  optionB: QuestionOptionSchema,
  optionC: QuestionOptionSchema,
  optionD: QuestionOptionSchema,
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().optional(),
});
export type SkillAssessmentQuestionCreateInput = z.infer<typeof SkillAssessmentQuestionCreateSchema>;

export const SkillAssessmentQuestionUpdateSchema = SkillAssessmentQuestionCreateSchema.partial();
export type SkillAssessmentQuestionUpdateInput = z.infer<typeof SkillAssessmentQuestionUpdateSchema>;

export const AnswerSchema = z.object({
  questionId: z.string().cuid(),
  selectedOption: z.enum(["A", "B", "C", "D"]),
});
export type AnswerInput = z.infer<typeof AnswerSchema>;

export const AssessmentSubmissionSchema = z.object({
  answers: z.array(AnswerSchema).min(1, "At least one answer must be submitted"), 
  timeSpent: z.coerce.number().positive("Time spent must be positive"), // in minutes
});
export type AssessmentSubmissionInput = z.infer<typeof AssessmentSubmissionSchema>;