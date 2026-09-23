import type { Match, League, Team, Sport, Standing } from "@/lib/types/sports";

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
