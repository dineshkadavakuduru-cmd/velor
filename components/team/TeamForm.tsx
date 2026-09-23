import type { Team, Match } from "@/lib/types/sports";

interface TeamFormProps {
  team: Team;
  matches: Match[];
}

type FormResult = "W" | "D" | "L";

export default function TeamForm({ team, matches }: TeamFormProps) {
  const form = calculateForm(team, matches.slice(0, 5));

  if (form.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="technical-label">RECENT FORM</span>
        <span className="text-xs text-text-secondary font-mono">NO RECENT MATCHES</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="technical-label">RECENT FORM</span>
      <div className="flex items-center gap-1">
        {form.map((result, i) => (
          <span
            key={i}
            className={`
              inline-flex items-center justify-center h-5 w-5 text-[0.6rem] font-mono font-bold tracking-wider
              ${result === "W"
                ? "bg-success/10 text-success border border-success/30"
                : result === "D"
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "bg-danger/10 text-danger border border-danger/30"
              }
            `}
          >
            {result}
          </span>
        ))}
      </div>
    </div>
  );
}

function calculateForm(team: Team, matches: Match[]): FormResult[] {
  const results: FormResult[] = [];

  for (const match of matches) {
    if (match.status !== "finished") continue;

    const isHome = match.homeTeam.id === team.id;
    const teamScore = isHome ? match.score.home : match.score.away;
    const opponentScore = isHome ? match.score.away : match.score.home;

    if (teamScore == null || opponentScore == null) continue;

    if (teamScore > opponentScore) {
      results.push("W");
    } else if (teamScore === opponentScore) {
      results.push("D");
    } else {
      results.push("L");
    }
  }

  return results;
}
