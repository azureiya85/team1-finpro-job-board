import axios from 'axios';

export interface CreateSkillDTO {
  title: string;
  description?: string;
  passingScore: number;
  timeLimit: number;
}

export async function createSkill(data: CreateSkillDTO) {
  const resp = await axios.post('/skills', data);
  return resp.data as { id: string; title: string; /*…*/ };
}

export async function listSkills() {
  const resp = await axios.get('/skills');
  return resp.data as Array<{ id: string; title: string }>;
}
