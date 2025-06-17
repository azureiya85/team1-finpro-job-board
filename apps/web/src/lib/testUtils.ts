export function calculateTestScore(answers: Record<string, string>, correctAnswers: Record<string, string>): number {
    const totalQuestions = Object.keys(correctAnswers).length;
    const correctCount = Object.entries(answers).reduce((count, [questionId, answer]) => {
      return count + (answer === correctAnswers[questionId] ? 1 : 0);
    }, 0);
  
    return Math.round((correctCount / totalQuestions) * 100);
  }
  
  export function formatTimeLeft(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }