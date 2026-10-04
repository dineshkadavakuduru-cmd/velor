import type { Match, League, Team, Sport, Standing, MatchEvent, MatchStatistics, MatchLineup, LineupPlayer, Player, PlayerMatchStats } from "@/lib/types/sports";

export const FOOTBALL: Sport = {
  id: "football",
  name: "Football",
  shortName: "Football",
  slug: "football",
  category: "team",
};

export const BASKETBALL: Sport = {
  id: "basketball",
  name: "Basketball",
  shortName: "Basketball",
  slug: "basketball",
  category: "team",
};

export const CRICKET: Sport = {
  id: "cricket",
  name: "Cricket",
  shortName: "Cricket",
  slug: "cricket",
  category: "team",
};

export const TENNIS: Sport = {
  id: "tennis",
  name: "Tennis",
  shortName: "Tennis",
  slug: "tennis",
  category: "individual",
};

export const PREMIER_LEAGUE: League = {
  id: "premier-league",
  sportId: "football",
  name: "Premier League",
  country: "England",
  logo: "/logos/premier-league.png",
};

export const LA_LIGA: League = {
  id: "la-liga",
  sportId: "football",
  name: "La Liga",
  country: "Spain",
  logo: "/logos/la-liga.png",
};

export const SERIE_A: League = {
  id: "serie-a",
  sportId: "football",
  name: "Serie A",
  country: "Italy",
  logo: "/logos/serie-a.png",
};

export const LIGUE_1: League = {
  id: "ligue-1",
  sportId: "football",
  name: "Ligue 1",
  country: "France",
  logo: "/logos/ligue-1.png",
};

export const NBA_LEAGUE: League = {
  id: "nba",
  sportId: "basketball",
  name: "NBA",
  country: "USA",
  logo: "/logos/nba.png",
};

export const ICC_WORLD_CUP: League = {
  id: "icc-world-cup",
  sportId: "cricket",
  name: "ICC Cricket World Cup",
  country: "International",
  logo: "/logos/icc-world-cup.png",
};

export const IPL: League = {
  id: "ipl",
  sportId: "cricket",
  name: "Indian Premier League",
  country: "India",
  logo: "/logos/ipl.png",
};

export const WIMBLEDON: League = {
  id: "wimbledon",
  sportId: "tennis",
  name: "Wimbledon",
  country: "England",
  logo: "/logos/wimbledon.png",
};

export const ATP_FINALS: League = {
  id: "atp-finals",
  sportId: "tennis",
  name: "ATP Finals",
  country: "International",
  logo: "/logos/atp-finals.png",
};

export const ARSENAL: Team = {
  id: "arsenal",
  name: "Arsenal",
  shortName: "ARS",
  logo: "/logos/arsenal.png",
  colors: { primary: "#EF0107", secondary: "#FFFFFF" },
  venue: "Emirates Stadium",
  country: "England",
  sportId: "football",
};

export const CHELSEA: Team = {
  id: "chelsea",
  name: "Chelsea",
  shortName: "CHE",
  logo: "/logos/chelsea.png",
  colors: { primary: "#034694", secondary: "#FFFFFF" },
  venue: "Stamford Bridge",
  country: "England",
  sportId: "football",
};

export const REAL_MADRID: Team = {
  id: "real-madrid",
  name: "Real Madrid",
  shortName: "RMA",
  logo: "/logos/real-madrid.png",
  colors: { primary: "#FFFFFF", secondary: "#FEBE10" },
  venue: "Santiago Bernabéu",
  country: "Spain",
  sportId: "football",
};

export const BARCELONA: Team = {
  id: "barcelona",
  name: "Barcelona",
  shortName: "BAR",
  logo: "/logos/barcelona.png",
  colors: { primary: "#A50044", secondary: "#004D98" },
  venue: "Camp Nou",
  country: "Spain",
  sportId: "football",
};

export const INTER: Team = {
  id: "inter",
  name: "Inter",
  shortName: "INT",
  logo: "/logos/inter.png",
  colors: { primary: "#0068A8", secondary: "#000000" },
  venue: "San Siro",
  country: "Italy",
  sportId: "football",
};

export const MILAN: Team = {
  id: "milan",
  name: "AC Milan",
  shortName: "MIL",
  logo: "/logos/milan.png",
  colors: { primary: "#FB090B", secondary: "#000000" },
  venue: "San Siro",
  country: "Italy",
  sportId: "football",
};

export const PSG: Team = {
  id: "psg",
  name: "Paris Saint-Germain",
  shortName: "PSG",
  logo: "/logos/psg.png",
  colors: { primary: "#004170", secondary: "#DA291C" },
  venue: "Parc des Princes",
  country: "France",
  sportId: "football",
};

export const LYON: Team = {
  id: "lyon",
  name: "Olympique Lyonnais",
  shortName: "OL",
  logo: "/logos/lyon.png",
  colors: { primary: "#1A3C7A", secondary: "#D2B48C" },
  venue: "Groupama Stadium",
  country: "France",
  sportId: "football",
};

export const BOSTON: Team = {
  id: "boston-celtics",
  name: "Boston Celtics",
  shortName: "BOS",
  logo: "/logos/celtics.png",
  colors: { primary: "#007A33", secondary: "#BA9653" },
  venue: "TD Garden",
  country: "USA",
  sportId: "basketball",
};

export const LA_LAKERS: Team = {
  id: "la-lakers",
  name: "Los Angeles Lakers",
  shortName: "LAL",
  logo: "/logos/lakers.png",
  colors: { primary: "#552583", secondary: "#FDB927" },
  venue: "Crypto.com Arena",
  country: "USA",
  sportId: "basketball",
};

export const CHICAGO: Team = {
  id: "chicago-bulls",
  name: "Chicago Bulls",
  shortName: "CHI",
  logo: "/logos/bulls.png",
  colors: { primary: "#CE1141", secondary: "#000000" },
  venue: "United Center",
  country: "USA",
  sportId: "basketball",
};

export const GOLDEN_STATE: Team = {
  id: "golden-state-warriors",
  name: "Golden State Warriors",
  shortName: "GSW",
  logo: "/logos/warriors.png",
  colors: { primary: "#1D428A", secondary: "#FFC72C" },
  venue: "Chase Center",
  country: "USA",
  sportId: "basketball",
};

export const MAN_CITY: Team = {
  id: "man-city",
  name: "Manchester City",
  shortName: "MCI",
  logo: "/logos/man-city.png",
  colors: { primary: "#6CABDD", secondary: "#1C2C5B" },
  venue: "Etihad Stadium",
  country: "England",
  sportId: "football",
};

export const LIVERPOOL: Team = {
  id: "liverpool",
  name: "Liverpool",
  shortName: "LIV",
  logo: "/logos/liverpool.png",
  colors: { primary: "#C8102E", secondary: "#00B2A9" },
  venue: "Anfield",
  country: "England",
  sportId: "football",
};

export const JUVENTUS: Team = {
  id: "juventus",
  name: "Juventus",
  shortName: "JUV",
  logo: "/logos/juventus.png",
  colors: { primary: "#000000", secondary: "#FFFFFF" },
  venue: "Allianz Stadium",
  country: "Italy",
  sportId: "football",
};

export const BAYERN: Team = {
  id: "bayern",
  name: "Bayern Munich",
  shortName: "BAY",
  logo: "/logos/bayern.png",
  colors: { primary: "#DC052D", secondary: "#FFFFFF" },
  venue: "Allianz Arena",
  country: "Germany",
  sportId: "football",
};

export const DORTMUND: Team = {
  id: "dortmund",
  name: "Borussia Dortmund",
  shortName: "BVB",
  logo: "/logos/dortmund.png",
  colors: { primary: "#FDE100", secondary: "#000000" },
  venue: "Signal Iduna Park",
  country: "Germany",
  sportId: "football",
};

export const INDIA: Team = {
  id: "india",
  name: "India",
  shortName: "IND",
  logo: "/logos/india.png",
  colors: { primary: "#138808", secondary: "#FF9933" },
  country: "India",
  sportId: "cricket",
};

export const AUSTRALIA: Team = {
  id: "australia",
  name: "Australia",
  shortName: "AUS",
  logo: "/logos/australia.png",
  colors: { primary: "#FFCD00", secondary: "#00843D" },
  country: "Australia",
  sportId: "cricket",
};

export const ENGLAND_CRICKET: Team = {
  id: "england-cricket",
  name: "England",
  shortName: "ENG",
  logo: "/logos/england-cricket.png",
  colors: { primary: "#003399", secondary: "#FFFFFF" },
  country: "England",
  sportId: "cricket",
};

export const PAKISTAN: Team = {
  id: "pakistan",
  name: "Pakistan",
  shortName: "PAK",
  logo: "/logos/pakistan.png",
  colors: { primary: "#01411C", secondary: "#FFFFFF" },
  country: "Pakistan",
  sportId: "cricket",
};

export const DJOKOVIC: Team = {
  id: "djokovic",
  name: "Novak Djokovic",
  shortName: "DJO",
  logo: "/logos/djokovic.png",
  country: "Serbia",
  sportId: "tennis",
};

export const ALCARAZ: Team = {
  id: "alcaraz",
  name: "Carlos Alcaraz",
  shortName: "ALC",
  logo: "/logos/alcaraz.png",
  country: "Spain",
  sportId: "tennis",
};

export const SINNER: Team = {
  id: "sinner",
  name: "Jannik Sinner",
  shortName: "SIN",
  logo: "/logos/sinner.png",
  country: "Italy",
  sportId: "tennis",
};

export const MEDVEDEV: Team = {
  id: "medvedev",
  name: "Daniil Medvedev",
  shortName: "MED",
  logo: "/logos/medvedev.png",
  country: "Russia",
  sportId: "tennis",
};

export const mockLiveMatches: Match[] = [
  {
    id: "match-1",
    sport: FOOTBALL,
    league: PREMIER_LEAGUE,
    homeTeam: ARSENAL,
    awayTeam: CHELSEA,
    score: { home: 2, away: 1 },
    status: "live",
    startTime: "2026-08-22T19:45:00Z",
    venue: "Emirates Stadium",
    period: "67'",
  },
  {
    id: "match-2",
    sport: BASKETBALL,
    league: NBA_LEAGUE,
    homeTeam: BOSTON,
    awayTeam: LA_LAKERS,
    score: { home: 108, away: 104 },
    status: "live",
    startTime: "2026-08-22T23:30:00Z",
    venue: "TD Garden",
    period: "Q4 5:32",
  },
  {
    id: "match-3",
    sport: CRICKET,
    league: ICC_WORLD_CUP,
    homeTeam: INDIA,
    awayTeam: AUSTRALIA,
    score: { home: 178, away: 6 },
    status: "live",
    startTime: "2026-08-22T14:00:00Z",
    venue: "Melbourne Cricket Ground",
    period: "42.3 ov",
  },
  {
    id: "match-4",
    sport: TENNIS,
    league: WIMBLEDON,
    homeTeam: DJOKOVIC,
    awayTeam: ALCARAZ,
    score: { home: 2, away: 1 },
    status: "live",
    startTime: "2026-08-22T13:00:00Z",
    venue: "Centre Court",
    period: "Set 4",
  },
  {
    id: "match-5",
    sport: FOOTBALL,
    league: SERIE_A,
    homeTeam: INTER,
    awayTeam: MILAN,
    score: { home: 0, away: 0 },
    status: "halftime",
    startTime: "2026-08-22T18:00:00Z",
    venue: "San Siro",
    period: "HT",
  },
  {
    id: "match-6",
    sport: BASKETBALL,
    league: NBA_LEAGUE,
    homeTeam: CHICAGO,
    awayTeam: GOLDEN_STATE,
    score: { home: 95, away: 102 },
    status: "live",
    startTime: "2026-08-22T20:00:00Z",
    venue: "United Center",
    period: "Q3 8:15",
  },
  {
    id: "match-7",
    sport: CRICKET,
    league: IPL,
    homeTeam: INDIA,
    awayTeam: PAKISTAN,
    score: { home: 210, away: 4 },
    status: "finished",
    startTime: "2026-08-21T10:00:00Z",
    venue: "Eden Gardens",
    period: "50.0 ov",
  },
  {
    id: "match-8",
    sport: TENNIS,
    league: ATP_FINALS,
    homeTeam: SINNER,
    awayTeam: MEDVEDEV,
    score: { home: 3, away: 0 },
    status: "finished",
    startTime: "2026-08-21T15:00:00Z",
    venue: "Pala Alpitour",
    period: "FT",
  },
];

export const mockFinishedMatches: Match[] = [
  {
    id: "match-7",
    sport: CRICKET,
    league: IPL,
    homeTeam: INDIA,
    awayTeam: PAKISTAN,
    score: { home: 210, away: 4 },
    status: "finished",
    startTime: "2026-08-21T10:00:00Z",
    venue: "Eden Gardens",
    period: "50.0 ov",
  },
  {
    id: "match-8",
    sport: TENNIS,
    league: ATP_FINALS,
    homeTeam: SINNER,
    awayTeam: MEDVEDEV,
    score: { home: 3, away: 0 },
    status: "finished",
    startTime: "2026-08-21T15:00:00Z",
    venue: "Pala Alpitour",
    period: "FT",
  },
];

export const mockScheduledMatches: Match[] = [
  {
    id: "match-9",
    sport: FOOTBALL,
    league: LA_LIGA,
    homeTeam: REAL_MADRID,
    awayTeam: BARCELONA,
    score: { home: 0, away: 0 },
    status: "scheduled",
    startTime: "2026-08-23T21:00:00Z",
    venue: "Santiago Bernabéu",
  },
  {
    id: "match-10",
    sport: BASKETBALL,
    league: NBA_LEAGUE,
    homeTeam: BOSTON,
    awayTeam: CHICAGO,
    score: { home: 0, away: 0 },
    status: "scheduled",
    startTime: "2026-08-23T19:00:00Z",
    venue: "TD Garden",
  },
  {
    id: "match-11",
    sport: CRICKET,
    league: ICC_WORLD_CUP,
    homeTeam: ENGLAND_CRICKET,
    awayTeam: PAKISTAN,
    score: { home: 0, away: 0 },
    status: "scheduled",
    startTime: "2026-08-24T10:00:00Z",
    venue: "Lord's",
  },
];

export const mockStandings: Standing[] = [
  { teamId: "arsenal", position: 1, points: 25, played: 8, won: 8, drawn: 1, lost: 0, goalsFor: 22, goalsAgainst: 5 },
  { teamId: "chelsea", position: 2, points: 20, played: 8, won: 6, drawn: 2, lost: 1, goalsFor: 18, goalsAgainst: 8 },
  { teamId: "man-city", position: 3, points: 18, played: 8, won: 5, drawn: 3, lost: 1, goalsFor: 16, goalsAgainst: 7 },
  { teamId: "liverpool", position: 4, points: 15, played: 8, won: 4, drawn: 3, lost: 2, goalsFor: 14, goalsAgainst: 10 },
  { teamId: "juventus", position: 1, points: 22, played: 8, won: 7, drawn: 1, lost: 0, goalsFor: 20, goalsAgainst: 6 },
  { teamId: "inter", position: 2, points: 19, played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 17, goalsAgainst: 7 },
];

export const mockMatchEvents: Record<string, MatchEvent[]> = {
  "match-1": [
    { id: "evt-1-1", matchId: "match-1", type: "goal", minute: 12, teamId: "arsenal", playerName: "Bukayo Saka", playerId: "player-1", detail: "Right-footed shot from the box" },
    { id: "evt-1-2", matchId: "match-1", type: "goal", minute: 35, teamId: "arsenal", playerName: "Gabriel Martinelli", playerId: "player-2", assistPlayerName: "Bukayo Saka", assistPlayerId: "player-1", detail: "Right-footed shot from the box" },
    { id: "evt-1-3", matchId: "match-1", type: "card", minute: 42, teamId: "chelsea", playerName: "Enzo Fernandez", playerId: "player-8", detail: "Yellow Card" },
    { id: "evt-1-4", matchId: "match-1", type: "goal", minute: 55, teamId: "chelsea", playerName: "Cole Palmer", playerId: "player-7", assistPlayerName: "Christopher Nkunku", assistPlayerId: "player-10", detail: "Right-footed shot from the box" },
    { id: "evt-1-5", matchId: "match-1", type: "substitution", minute: 62, teamId: "arsenal", playerName: "Gabriel Jesus", detail: "Substituted: Gabriel Martinelli" },
    { id: "evt-1-6", matchId: "match-1", type: "goal", minute: 69, teamId: "arsenal", playerName: "Bukayo Saka", playerId: "player-1", assistPlayerName: "Martin Odegaard", assistPlayerId: "player-3", detail: "Right-footed shot from the box" },
    { id: "evt-1-7", matchId: "match-1", type: "card", minute: 74, teamId: "arsenal", playerName: "William Saliba", playerId: "player-4", detail: "Yellow Card" },
    { id: "evt-1-8", matchId: "match-1", type: "substitution", minute: 78, teamId: "chelsea", playerName: "Nicolas Jackson", assistPlayerId: "player-10", detail: "Substituted: Christopher Nkunku" },
  ],
  "match-2": [
    { id: "evt-2-1", matchId: "match-2", type: "period_start", minute: 0, teamId: "boston-celtics", playerName: "Tip-off" },
    { id: "evt-2-2", matchId: "match-2", type: "goal", minute: 14, teamId: "boston-celtics", playerName: "Jayson Tatum", playerId: "player-12", detail: "3-point jump shot" },
    { id: "evt-2-3", matchId: "match-2", type: "goal", minute: 28, teamId: "la-lakers", playerName: "LeBron James", playerId: "player-15", detail: "Slam dunk" },
    { id: "evt-2-4", matchId: "match-2", type: "goal", minute: 36, teamId: "la-lakers", playerName: "Anthony Davis", playerId: "player-16", assistPlayerName: "LeBron James", assistPlayerId: "player-15", detail: "Hook shot" },
    { id: "evt-2-5", matchId: "match-2", type: "goal", minute: 52, teamId: "boston-celtics", playerName: "Jaylen Brown", playerId: "player-13", assistPlayerName: "Derrick White", detail: "3-point jump shot" },
  ],
  "match-3": [
    { id: "evt-3-1", matchId: "match-3", type: "boundary", minute: 5, teamId: "india", playerName: "Rohit Sharma", playerId: "player-21", detail: "FOUR" },
    { id: "evt-3-2", matchId: "match-3", type: "wicket", minute: 12, teamId: "australia", playerName: "Pat Cummins", assistPlayerName: "Ravindra Jadeja", detail: "Bowled" },
    { id: "evt-3-3", matchId: "match-3", type: "boundary", minute: 25, teamId: "india", playerName: "Virat Kohli", playerId: "player-20", detail: "FOUR" },
    { id: "evt-3-4", matchId: "match-3", type: "milestone", minute: 38, teamId: "india", playerName: "Virat Kohli", playerId: "player-20", detail: "50 runs" },
    { id: "evt-3-5", matchId: "match-3", type: "wicket", minute: 42, teamId: "india", playerName: "Steve Smith", assistPlayerName: "Jasprit Bumrah", detail: "Caught" },
  ],
  "match-4": [
    { id: "evt-4-1", matchId: "match-4", type: "ace", minute: 0, teamId: "djokovic", playerName: "Novak Djokovic", playerId: "player-23", detail: "Ace - 1st serve" },
    { id: "evt-4-2", matchId: "match-4", type: "break_point", minute: 0, teamId: "alcaraz", playerName: "Carlos Alcaraz", playerId: "player-24", detail: "Break point saved" },
    { id: "evt-4-3", matchId: "match-4", type: "double_fault", minute: 0, teamId: "alcaraz", playerName: "Carlos Alcaraz", playerId: "player-24", detail: "Double fault" },
    { id: "evt-4-4", matchId: "match-4", type: "service_winner", minute: 0, teamId: "djokovic", playerName: "Novak Djokovic", playerId: "player-23", detail: "Service winner" },
  ],
  "match-5": [],
  "match-6": [
    { id: "evt-6-1", matchId: "match-6", type: "period_start", minute: 0, teamId: "chicago-bulls", playerName: "Tip-off" },
    { id: "evt-6-2", matchId: "match-6", type: "goal", minute: 18, teamId: "golden-state-warriors", playerName: "Stephen Curry", playerId: "player-18", detail: "3-point jump shot" },
    { id: "evt-6-3", matchId: "match-6", type: "goal", minute: 22, teamId: "chicago-bulls", playerName: "Zach LaVine", detail: "Pull-up jump shot" },
    { id: "evt-6-4", matchId: "match-6", type: "goal", minute: 35, teamId: "golden-state-warriors", playerName: "Andrew Wiggins", assistPlayerName: "Stephen Curry", assistPlayerId: "player-18", detail: "Fast break dunk" },
  ],
  "match-7": [
    { id: "evt-7-1", matchId: "match-7", type: "period_start", minute: 0, teamId: "india", playerName: "Toss won by India", detail: "1st Innings" },
    { id: "evt-7-2", matchId: "match-7", type: "boundary", minute: 3, teamId: "india", playerName: "Rohit Sharma", playerId: "player-21", detail: "SIX" },
    { id: "evt-7-3", matchId: "match-7", type: "wicket", minute: 8, teamId: "india", playerName: "KL Rahul", assistPlayerName: "Pat Cummins", detail: "Caught" },
    { id: "evt-7-4", matchId: "match-7", type: "boundary", minute: 35, teamId: "india", playerName: "Virat Kohli", playerId: "player-20", detail: "FOUR" },
  ],
  "match-8": [],
};

export const mockMatchStatistics: Record<string, MatchStatistics[]> = {
  "match-1": [
    {
      matchId: "match-1",
      teamId: "arsenal",
      teamName: "Arsenal",
      stats: [
        { type: "possession", value: 58, opponentValue: 42 },
        { type: "total shots", value: 14, opponentValue: 9 },
        { type: "shots on target", value: 7, opponentValue: 4 },
        { type: "passes", value: 421, opponentValue: 312 },
        { type: "fouls", value: 11, opponentValue: 13 },
        { type: "corners", value: 6, opponentValue: 3 },
        { type: "offsides", value: 2, opponentValue: 1 },
      ],
    },
    {
      matchId: "match-1",
      teamId: "chelsea",
      teamName: "Chelsea",
      stats: [
        { type: "possession", value: 42, opponentValue: 58 },
        { type: "total shots", value: 9, opponentValue: 14 },
        { type: "shots on target", value: 4, opponentValue: 7 },
        { type: "passes", value: 312, opponentValue: 421 },
        { type: "fouls", value: 13, opponentValue: 11 },
        { type: "corners", value: 3, opponentValue: 6 },
        { type: "offsides", value: 1, opponentValue: 2 },
      ],
    },
  ],
  "match-2": [
    {
      matchId: "match-2",
      teamId: "boston-celtics",
      teamName: "Boston Celtics",
      stats: [
        { type: "field goals", value: 44, opponentValue: 41 },
        { type: "field goal %", value: 48.9, opponentValue: 44.2 },
        { type: "3-pointers", value: 12, opponentValue: 8 },
        { type: "3-point %", value: 42.9, opponentValue: 36.4 },
        { type: "rebounds", value: 38, opponentValue: 35 },
        { type: "assists", value: 22, opponentValue: 18 },
        { type: "turnovers", value: 8, opponentValue: 11 },
      ],
    },
    {
      matchId: "match-2",
      teamId: "la-lakers",
      teamName: "Los Angeles Lakers",
      stats: [
        { type: "field goals", value: 41, opponentValue: 44 },
        { type: "field goal %", value: 44.2, opponentValue: 48.9 },
        { type: "3-pointers", value: 8, opponentValue: 12 },
        { type: "3-point %", value: 36.4, opponentValue: 42.9 },
        { type: "rebounds", value: 35, opponentValue: 38 },
        { type: "assists", value: 18, opponentValue: 22 },
        { type: "turnovers", value: 11, opponentValue: 8 },
      ],
    },
  ],
  "match-4":[
    {
      matchId: "match-4",
      teamId: "djokovic",
      teamName: "Novak Djokovic",
      stats: [
        { type: "aces", value: 7, opponentValue: 4 },
        { type: "double faults", value: 1, opponentValue: 3 },
        { type: "1st serve %", value: 64, opponentValue: 59 },
        { type: "break points saved", value: "3/4", opponentValue: "2/3" },
        { type: "winners", value: 22, opponentValue: 16 },
      ],
    },
    {
      matchId: "match-4",
      teamId: "alcaraz",
      teamName: "Carlos Alcaraz",
      stats: [
        { type: "aces", value: 4, opponentValue: 7 },
        { type: "double faults", value: 3, opponentValue: 1 },
        { type: "1st serve %", value: 59, opponentValue: 64 },
        { type: "break points saved", value: "2/3", opponentValue: "3/4" },
        { type: "winners", value: 16, opponentValue: 22 },
      ],
    },
  ],
};

export const mockMatchLineups: Record<string, MatchLineup[]> = {
  "match-1": [
    {
      matchId: "match-1",
      teamId: "arsenal",
      teamName: "Arsenal",
      formation: "4-3-3",
      startXI: [
        { id: "player-1", name: "Aaron Ramsdale", position: "GK", number: 1, teamId: "arsenal" },
        { id: "player-2", name: "Gabriel", position: "LB", number: 2, teamId: "arsenal" },
        { id: "player-3", name: "William Saliba", position: "CB", number: 3, teamId: "arsenal" },
        { id: "player-4", name: "Jurrien Timber", position: "CB", number: 4, teamId: "arsenal" },
        { id: "player-5", name: "Oleksandr Zinchenko", position: "RB", number: 5, teamId: "arsenal" },
        { id: "player-6", name: "Thomas Partey", position: "CM", number: 6, teamId: "arsenal" },
        { id: "player-7", name: "Declan Rice", position: "CM", number: 8, teamId: "arsenal" },
        { id: "player-8", name: "Martin Odegaard", position: "CM", number: 10, teamId: "arsenal" },
        { id: "player-9", name: "Gabriel Martinelli", position: "LW", number: 11, teamId: "arsenal" },
        { id: "player-10", name: "Bukayo Saka", position: "RW", number: 7, teamId: "arsenal" },
        { id: "player-11", name: "Gabriel Jesus", position: "ST", number: 9, teamId: "arsenal" },
      ],
      substitutes: [
        { id: "player-12", name: "Aaron Ramsdale", position: "GK", number: 12, teamId: "arsenal", isSubstitute: true },
        { id: "player-13", name: "Takehiro Tomiyasu", position: "DEF", number: 13, teamId: "arsenal", isSubstitute: true },
        { id: "player-14", name: "Jorginho", position: "CM", number: 14, teamId: "arsenal", isSubstitute: true },
        { id: "player-15", name: "Krepin Yannick", position: "CM", number: 15, teamId: "arsenal", isSubstitute: true },
        { id: "player-16", name: "Eddie Nketiah", position: "ST", number: 16, teamId: "arsenal", isSubstitute: true },
        { id: "player-17", name: "Reiss Nelson", position: "RW", number: 17, teamId: "arsenal", isSubstitute: true },
      ],
    },
    {
      matchId: "match-1",
      teamId: "chelsea",
      teamName: "Chelsea",
      formation: "4-2-3-1",
      startXI: [
        { id: "player-18", name: "Robert Sanchez", position: "GK", number: 1, teamId: "chelsea" },
        { id: "player-19", name: "Marc Cucurella", position: "LB", number: 3, teamId: "chelsea" },
        { id: "player-20", name: "William Disasi", position: "CB", number: 4, teamId: "chelsea" },
        { id: "player-21", name: "Benoit Badiashile", position: "CB", number: 5, teamId: "chelsea" },
        { id: "player-22", name: "Reece James", position: "RB", number: 2, teamId: "chelsea" },
        { id: "player-23", name: "Enzo Fernandez", position: "CM", number: 8, teamId: "chelsea" },
        { id: "player-24", name: "Moises Caicedo", position: "CM", number: 6, teamId: "chelsea" },
        { id: "player-25", name: "Noni Madueke", position: "LW", number: 11, teamId: "chelsea" },
        { id: "player-26", name: "Cole Palmer", position: "RW", number: 10, teamId: "chelsea" },
        { id: "player-27", name: "Christopher Nkunku", position: "ST", number: 9, teamId: "chelsea" },
        { id: "player-28", name: "Nicolas Jackson", position: "ST", number: 7, teamId: "chelsea" },
      ],
      substitutes: [
        { id: "player-29", name: "Djordje Petrovic", position: "GK", number: 12, teamId: "chelsea", isSubstitute: true },
        { id: "player-30", name: "Ben Chilwell", position: "LB", number: 21, teamId: "chelsea", isSubstitute: true },
        { id: "player-31", name: "Tino Livramento", position: "CB", number: 15, teamId: "chelsea", isSubstitute: true },
        { id: "player-32", name: "Conor Gallagher", position: "CM", number: 17, teamId: "chelsea", isSubstitute: true },
        { id: "player-33", name: "Mykhailo Mudryk", position: "LW", number: 18, teamId: "chelsea", isSubstitute: true },
      ],
    },
  ],
  "match-2": [
    {
      matchId: "match-2",
      teamId: "boston-celtics",
      teamName: "Boston Celtics",
      formation: "5-3",
      startXI: [
        { id: "player-92", name: " Kristen Dunk", position: "C", number: 13, teamId: "boston-celtics" },
        { id: "player-93", name: "Al Horford", position: "PF", number: 42, teamId: "boston-celtics" },
        { id: "player-94", name: "Derrick White", position: "SG", number: 7, teamId: "boston-celtics" },
        { id: "player-95", name: "Jayson Tatum", position: "PF", number: 0, teamId: "boston-celtics" },
        { id: "player-96", name: "Jaylen Brown", position: "SF", number: 11, teamId: "boston-celtics" },
      ],
      substitutes: [
        { id: "player-97", name: "Payton Pritchard", position: "PG", number: 1, teamId: "boston-celtics", isSubstitute: true },
        { id: "player-98", name: "Oshae Brissett", position: "C", number: 15, teamId: "boston-celtics", isSubstitute: true },
        { id: "player-98a", name: "Al Horford", position: "C", number: 42, teamId: "boston-celtics", isSubstitute: true },
      ],
    },
    {
      matchId: "match-2",
      teamId: "la-lakers",
      teamName: "Los Angeles Lakers",
      formation: "5-3",
      startXI: [
        { id: "player-99", name: "D'Angelo Russell", position: "PG", number: 0, teamId: "la-lakers" },
        { id: "player-100", name: "Gabe Vincent", position: "SG", number: 2, teamId: "la-lakers" },
        { id: "player-101", name: "LeBron James", position: "SF", number: 23, teamId: "la-lakers" },
        { id: "player-102", name: "Rui Hachimura", position: "PF", number: 26, teamId: "la-lakers" },
        { id: "player-103", name: "Anthony Davis", position: "C", number: 3, teamId: "la-lakers" },
      ],
      substitutes: [
        { id: "player-104", name: "Cam Reddish", position: "SG", number: 5, teamId: "la-lakers", isSubstitute: true },
        { id: "player-105", name: "D'Angelo Russell", position: "PG", number: 0, teamId: "la-lakers", isSubstitute: true },
      ],
    },
  ],
  "match-5": [
    {
      matchId: "match-5",
      teamId: "inter",
      teamName: "Inter",
      formation: "3-5-2",
      startXI: [
        { id: "player-34", name: "Yann Sommer", position: "GK", number: 1, teamId: "inter" },
        { id: "player-35", name: "Milan Skriniar", position: "CB", number: 3, teamId: "inter" },
        { id: "player-36", name: "Alessandro Bastoni", position: "CB", number: 3, teamId: "inter" },
        { id: "player-37", name: "Stefan de Vrij", position: "CB", number: 4, teamId: "inter" },
        { id: "player-38", name: "Federico Dimarco", position: "LWB", number: 39, teamId: "inter" },
        { id: "player-39", name: "Nicolo Barella", position: "CM", number: 88, teamId: "inter" },
        { id: "player-40", name: "Marcelo Brozovic", position: "CM", number: 77, teamId: "inter" },
        { id: "player-41", name: "Hakan Calhanoglu", position: "CM", number: 10, teamId: "inter" },
        { id: "player-42", name: "Lautaro Martinez", position: "ST", number: 9, teamId: "inter" },
        { id: "player-43", name: "Romelu Lukaku", position: "ST", number: 99, teamId: "inter" },
        { id: "player-44", name: "Denzel Dumfries", position: "RWB", number: 22, teamId: "inter" },
      ],
      substitutes: [
        { id: "player-45", name: "Onana", position: "GK", number: 16, teamId: "inter", isSubstitute: true },
        { id: "player-46", name: "Matteo Lovato", position: "CB", number: 24, teamId: "inter", isSubstitute: true },
        { id: "player-47", name: "Davide Frattesi", position: "CM", number: 28, teamId: "inter", isSubstitute: true },
        { id: "player-48", name: "Marcus Thuram", position: "ST", number: 99, teamId: "inter", isSubstitute: true },
      ],
    },
    {
      matchId: "match-5",
      teamId: "milan",
      teamName: "AC Milan",
      formation: "4-2-3-1",
      startXI: [
        { id: "player-49", name: "Mike Maignan", position: "GK", number: 1, teamId: "milan" },
        { id: "player-50", name: "Theo Hernandez", position: "LB", number: 19, teamId: "milan" },
        { id: "player-51", name: "Alessandro Florenzi", position: "CB", number: 4, teamId: "milan" },
        { id: "player-52", name: "Fikayo Tomori", position: "CB", number: 44, teamId: "milan" },
        { id: "player-53", name: "Davide Calabria", position: "RB", number: 5, teamId: "milan" },
        { id: "player-54", name: "Ismael Bennacer", position: "CM", number: 8, teamId: "milan" },
        { id: "player-55", name: "Sandro Tonali", position: "CM", number: 6, teamId: "milan" },
        { id: "player-56", name: "Rafael Leao", position: "LW", number: 11, teamId: "milan" },
        { id: "player-57", name: "Ruben Dias", position: "AM", number: 22, teamId: "milan" },
        { id: "player-58", name: "Luka Jovic", position: "RW", number: 9, teamId: "milan" },
        { id: "player-59", name: "Olivier Giroud", position: "ST", number: 93, teamId: "milan" },
      ],
      substitutes: [
        { id: "player-60", name: "Antonio Donnarumma", position: "GK", number: 12, teamId: "milan", isSubstitute: true },
        { id: "player-61", name: "Sergio Kalulu", position: "CB", number: 22, teamId: "milan", isSubstitute: true },
        { id: "player-62", name: "Yunus Musah", position: "CM", number: 23, teamId: "milan", isSubstitute: true },
        { id: "player-63", name: "Ademola Lookman", position: "AM", number: 24, teamId: "milan", isSubstitute: true },
      ],
    },
  ],
  "match-7": [
    {
      matchId: "match-7",
      teamId: "india",
      teamName: "India",
      formation: "4-2-3-1",
      startXI: [
        { id: "player-64", name: "KL Rahul", position: "WK", number: 1, teamId: "india" },
        { id: "player-65", name: "Rohit Sharma", position: "OP", number: 2, teamId: "india" },
        { id: "player-66", name: "Shubman Gill", position: "OP", number: 3, teamId: "india" },
        { id: "player-67", name: "Virat Kohli", position: "OP", number: 4, teamId: "india" },
        { id: "player-68", name: "Shreyas Iyer", position: "OP", number: 5, teamId: "india" },
        { id: "player-69", name: "Rishab Pant", position: "WK", number: 6, teamId: "india" },
        { id: "player-70", name: "Hardik Pandya", position: "AR", number: 7, teamId: "india" },
        { id: "player-71", name: "Ravindra Jadeja", position: "AR", number: 8, teamId: "india" },
        { id: "player-72", name: "Ravichandran Ashwin", position: "BO", number: 9, teamId: "india" },
        { id: "player-73", name: "Jasprit Bumrah", position: "BO", number: 10, teamId: "india" },
        { id: "player-74", name: "Mohammed Shami", position: "BO", number: 11, teamId: "india" },
      ],
      substitutes: [
        { id: "player-75", name: "Ishan Kishan", position: "WK", number: 12, teamId: "india", isSubstitute: true },
        { id: "player-76", name: "Axar Patel", position: "AR", number: 13, teamId: "india", isSubstitute: true },
        { id: "player-77", name: "Kuldeep Yadav", position: "BO", number: 14, teamId: "india", isSubstitute: true },
      ],
    },
    {
      matchId: "match-7",
      teamId: "pakistan",
      teamName: "Pakistan",
      formation: "4-2-3-1",
      startXI: [
        { id: "player-78", name: "Mohammad Rizwan", position: "WK", number: 1, teamId: "pakistan" },
        { id: "player-79", name: "Babar Azam", position: "OP", number: 2, teamId: "pakistan" },
        { id: "player-80", name: "Fakhar Zaman", position: "OP", number: 3, teamId: "pakistan" },
        { id: "player-81", name: "Mohammad Hafeez", position: "OP", number: 4, teamId: "pakistan" },
        { id: "player-82", name: "Shadab Khan", position: "WK", number: 5, teamId: "pakistan" },
        { id: "player-83", name: "Imad Wasim", position: "AR", number: 6, teamId: "pakistan" },
        { id: "player-84", name: "Shoaib Malik", position: "AR", number: 7, teamId: "pakistan" },
        { id: "player-85", name: "Wahab Riaz", position: "BO", number: 8, teamId: "pakistan" },
        { id: "player-86", name: "Hasan Ali", position: "BO", number: 9, teamId: "pakistan" },
        { id: "player-87", name: "Junaid Khan", position: "BO", number: 10, teamId: "pakistan" },
        { id: "player-88", name: "Mohammad Abbas", position: "BO", number: 11, teamId: "pakistan" },
      ],
       substitutes: [
        { id: "player-89", name: "Sarfaraz Ahmed", position: "WK", number: 12, teamId: "pakistan", isSubstitute: true },
        { id: "player-90", name: "Faheem Ashraf", position: "AR", number: 13, teamId: "pakistan", isSubstitute: true },
        { id: "player-91", name: "Usman Shinwari", position: "BO", number: 14, teamId: "pakistan", isSubstitute: true },
      ],
    },
  ],
};

export const mockPlayers: Player[] = [
  { id: "player-1", name: "Bukayo Saka", position: "Forward", teamId: "arsenal", sportId: "football", nationality: "England", dateOfBirth: "2003-09-26", stats: { appearances: 42, goals: 15, assists: 8, minutes: 3400 } },
  { id: "player-2", name: "Gabriel Martinelli", position: "Forward", teamId: "arsenal", sportId: "football", nationality: "Brazil", dateOfBirth: "2001-06-18", stats: { appearances: 38, goals: 9, assists: 6, minutes: 2800 } },
  { id: "player-3", name: "Martin Odegaard", position: "Midfielder", teamId: "arsenal", sportId: "football", nationality: "Norway", dateOfBirth: "1998-12-17", stats: { appearances: 45, goals: 11, assists: 12, minutes: 3800 } },
  { id: "player-4", name: "William Saliba", position: "Defender", teamId: "arsenal", sportId: "football", nationality: "France", dateOfBirth: "2002-03-24", stats: { appearances: 41, goals: 3, assists: 2, minutes: 3500 } },
  { id: "player-5", name: "Aaron Ramsdale", position: "Goalkeeper", teamId: "arsenal", sportId: "football", nationality: "England", dateOfBirth: "1998-05-14", stats: { appearances: 39, goals: 0, assists: 1, minutes: 3300, cleanSheets: 12 } },
  { id: "player-6", name: "Declan Rice", position: "Midfielder", teamId: "arsenal", sportId: "football", nationality: "England", dateOfBirth: "1997-07-14", stats: { appearances: 38, goals: 4, assists: 5, minutes: 3200, tackles: 89 } },
  { id: "player-7", name: "Cole Palmer", position: "Forward", teamId: "chelsea", sportId: "football", nationality: "England", dateOfBirth: "2002-01-06", stats: { appearances: 44, goals: 23, assists: 10, minutes: 3600 } },
  { id: "player-8", name: "Enzo Fernandez", position: "Midfielder", teamId: "chelsea", sportId: "football", nationality: "Argentina", dateOfBirth: "2000-02-29", stats: { appearances: 39, goals: 7, assists: 8, minutes: 3100 } },
  { id: "player-9", name: "Reece James", position: "Defender", teamId: "chelsea", sportId: "football", nationality: "England", dateOfBirth: "1999-10-08", stats: { appearances: 35, goals: 5, assists: 7, minutes: 2900 } },
  { id: "player-10", name: "Christopher Nkunku", position: "Forward", teamId: "chelsea", sportId: "football", nationality: "France", dateOfBirth: "2002-11-10", stats: { appearances: 32, goals: 14, assists: 9, minutes: 2600 } },
  { id: "player-11", name: "Thiago Silva", position: "Defender", teamId: "chelsea", sportId: "football", nationality: "Brazil", dateOfBirth: "1992-09-22", stats: { appearances: 34, goals: 2, assists: 1, minutes: 2700, cleanSheets: 8 } },
  { id: "player-12", name: "Jayson Tatum", position: "Forward", teamId: "boston-celtics", sportId: "basketball", nationality: "USA", dateOfBirth: "2003-03-03", stats: { appearances: 74, points: 2184, rebounds: 621, assists: 417, minutes: 2480 } },
  { id: "player-13", name: "Jaylen Brown", position: "Forward", teamId: "boston-celtics", sportId: "basketball", nationality: "USA", dateOfBirth: "1996-05-30", stats: { appearances: 69, points: 1926, rebounds: 578, assists: 331, minutes: 2280 } },
  { id: "player-14", name: "Al Horford", position: "Center", teamId: "boston-celtics", sportId: "basketball", nationality: "Puerto Rico", dateOfBirth: "1986-06-13", stats: { appearances: 68, points: 824, rebounds: 631, assists: 381, minutes: 2050 } },
  { id: "player-15", name: "LeBron James", position: "Forward", teamId: "la-lakers", sportId: "basketball", nationality: "USA", dateOfBirth: "1984-12-30", stats: { appearances: 67, points: 1847, rebounds: 642, assists: 612, minutes: 2250 } },
  { id: "player-16", name: "Anthony Davis", position: "Center", teamId: "la-lakers", sportId: "basketball", nationality: "USA", dateOfBirth: "1995-03-11", stats: { appearances: 63, points: 1654, rebounds: 781, assists: 215, minutes: 1980 } },
  { id: "player-17", name: "D'Angelo Russell", position: "Guard", teamId: "la-lakers", sportId: "basketball", nationality: "USA", dateOfBirth: "1996-08-26", stats: { appearances: 66, points: 1489, rebounds: 311, assists: 509, minutes: 2020 } },
  { id: "player-18", name: "Stephen Curry", position: "Guard", teamId: "golden-state-warriors", sportId: "basketball", nationality: "USA", dateOfBirth: "1988-03-14", stats: { appearances: 64, points: 1910, rebounds: 411, assists: 422, minutes: 2010 } },
  { id: "player-19", name: "Luka Doncic", position: "Forward", teamId: "golden-state-warriors", sportId: "basketball", nationality: "Slovenia", dateOfBirth: "1999-02-28", stats: { appearances: 62, points: 2085, rebounds: 710, assists: 589, minutes: 2050 } },
  { id: "player-20", name: "Virat Kohli", position: "Batsman", teamId: "india", sportId: "cricket", nationality: "India", dateOfBirth: "1988-11-05", stats: { appearances: 48, runs: 1745, average: 43.6, fifties: 12, centuries: 5, minutes: 8200 } },
  { id: "player-21", name: "Rohit Sharma", position: "Batsman", teamId: "india", sportId: "cricket", nationality: "India", dateOfBirth: "1987-05-08", stats: { appearances: 45, runs: 1620, average: 40.5, fifties: 10, centuries: 4, minutes: 7800 } },
  { id: "player-22", name: "Jasprit Bumrah", position: "Bowler", teamId: "india", sportId: "cricket", nationality: "India", dateOfBirth: "1993-02-22", stats: { appearances: 38, wickets: 67, average: 22.1, economy: 7.8, maidens: 2, minutes: 1560 } },
  { id: "player-23", name: "Novak Djokovic", position: "Tennis Player", teamId: "djokovic", sportId: "tennis", nationality: "Serbia", dateOfBirth: "1987-05-22", stats: { appearances: 12, titles: 3, wins: 15, aces: 98, doubleFaults: 14, minutes: 960 } },
  { id: "player-24", name: "Carlos Alcaraz", position: "Tennis Player", teamId: "alcaraz", sportId: "tennis", nationality: "Spain", dateOfBirth: "2003-05-05", stats: { appearances: 10, titles: 2, wins: 12, aces: 78, doubleFaults: 18, minutes: 780 } },
  { id: "player-25", name: "Lautaro Martinez", position: "Forward", teamId: "inter", sportId: "football", nationality: "Argentina", dateOfBirth: "1997-08-25", stats: { appearances: 41, goals: 21, assists: 7, minutes: 3400 } },
  { id: "player-26", name: "Romelu Lukaku", position: "Forward", teamId: "inter", sportId: "football", nationality: "Belgium", dateOfBirth: "1993-05-09", stats: { appearances: 38, goals: 16, assists: 8, minutes: 3000 } },
  { id: "player-27", name: "Nicolo Barella", position: "Midfielder", teamId: "inter", sportId: "football", nationality: "Italy", dateOfBirth: "1997-02-01", stats: { appearances: 43, goals: 6, assists: 8, minutes: 3600 } },
  { id: "player-28", name: "Hakan Calhanoglu", position: "Midfielder", teamId: "inter", sportId: "football", nationality: "Turkey", dateOfBirth: "1994-02-08", stats: { appearances: 40, goals: 9, assists: 11, minutes: 3300 } },
  { id: "player-29", name: "Rafael Leao", position: "Forward", teamId: "milan", sportId: "football", nationality: "Italy", dateOfBirth: "1998-02-06", stats: { appearances: 42, goals: 15, assists: 10, minutes: 3400 } },
  { id: "player-30", name: "Olivier Giroud", position: "Forward", teamId: "milan", sportId: "football", nationality: "France", dateOfBirth: "1986-09-30", stats: { appearances: 36, goals: 12, assists: 5, minutes: 2600 } },
  { id: "player-31", name: "Mike Maignan", position: "Goalkeeper", teamId: "milan", sportId: "football", nationality: "France", dateOfBirth: "1995-07-16", stats: { appearances: 38, goals: 0, assists: 1, minutes: 3200, cleanSheets: 10 } },
  { id: "player-32", name: "Frenkie de Jong", position: "Midfielder", teamId: "barcelona", sportId: "football", nationality: "Netherlands", dateOfBirth: "1997-05-12", stats: { appearances: 39, goals: 5, assists: 12, minutes: 3300 } },
];

export const mockPlayerStats: Record<string, PlayerMatchStats[]> = {
  "match-1": [
    { playerId: "player-1", matchId: "match-1", teamId: "arsenal", playerName: "Bukayo Saka", position: "FW", stats: { goals: 1, assists: 1, shots: 4, shotsOnTarget: 2, passes: 34, touches: 67, rating: 7.8 } },
    { playerId: "player-3", matchId: "match-1", teamId: "arsenal", playerName: "Martin Odegaard", position: "MF", stats: { goals: 0, assists: 1, shots: 3, passes: 72, touches: 89, rating: 8.1 } },
    { playerId: "player-2", matchId: "match-1", teamId: "arsenal", playerName: "Gabriel Martinelli", position: "FW", stats: { goals: 1, assists: 0, shots: 3, shotsOnTarget: 2, passes: 28, touches: 55, rating: 7.4 } },
    { playerId: "player-4", matchId: "match-1", teamId: "arsenal", playerName: "William Saliba", position: "DF", stats: { goals: 0, assists: 0, shots: 1, tackles: 3, aerialDuels: 11, rating: 7.2 } },
    { playerId: "player-7", matchId: "match-1", teamId: "chelsea", playerName: "Cole Palmer", position: "FW", stats: { goals: 1, assists: 1, shots: 5, shotsOnTarget: 3, passes: 42, touches: 71, rating: 7.9 } },
    { playerId: "player-8", matchId: "match-1", teamId: "chelsea", playerName: "Enzo Fernandez", position: "MF", stats: { goals: 0, assists: 0, shots: 2, passes: 58, tackles: 4, rating: 6.8 } },
    { playerId: "player-9", matchId: "match-1", teamId: "chelsea", playerName: "Reece James", position: "DF", stats: { goals: 0, assists: 0, shots: 2, crosses: 5, tackles: 3, rating: 6.6 } },
  ],
};