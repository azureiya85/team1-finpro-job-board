import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ApplicationTestResultProps {
  score: number;
}

export default function ApplicationTestResult({ score }: ApplicationTestResultProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">Hasil Test</h3>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Nilai</span>
          <span className="text-lg font-medium">{score}</span>
        </div>
      </CardContent>
    </Card>
  );
}