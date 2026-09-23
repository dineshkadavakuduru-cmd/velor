export type SportCategory = "team" | "individual" | "dual";

export interface SportDefinition {
  id: string;
  name: string;
  shortName: string;
  category: SportCategory;
  enabled: boolean;
}

export const SPORTS: Record<string, SportDefinition> = {
  football: {
    id: "football",
    name: "Football",
    shortName: "FTB",
    category: "team",
    enabled: true,
  },
  basketball: {
    id: "basketball",
    name: "Basketball",
    shortName: "BB",
    category: "team",
    enabled: true,
  },
  cricket: {
    id: "cricket",
    name: "Cricket",
    shortName: "CRI",
    category: "team",
    enabled: true,
  },
  tennis: {
    id: "tennis",
    name: "Tennis",
    shortName: "TEN",
    category: "individual",
    enabled: true,
  },
  baseball: {
    id: "baseball",
    name: "Baseball",
    shortName: "BSB",
    category: "team",
    enabled: false,
  },
  hockey: {
    id: "hockey",
    name: "Ice Hockey",
    shortName: "HKY",
    category: "team",
    enabled: false,
  },
  "american-football": {
    id: "american-football",
    name: "American Football",
    shortName: "AMF",
    category: "team",
    enabled: false,
  },
  volleyball: {
    id: "volleyball",
    name: "Volleyball",
    shortName: "VBL",
    category: "team",
    enabled: false,
  },
};

export function getSport(id: string): SportDefinition | undefined {
  return SPORTS[id];
}

export function isSportEnabled(id: string): boolean {
  return SPORTS[id]?.enabled ?? false;
}

export function getEnabledSports(): SportDefinition[] {
  return Object.values(SPORTS).filter((s) => s.enabled);
}

export function getSportDisplayName(id: string): string {
  return SPORTS[id]?.name ?? id;
}
