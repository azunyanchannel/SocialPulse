export type InteractionType =
  | "in-person"
  | "phone"
  | "message"
  | "email"
  | "video-call"
  | "other";

export interface Person {
  id: string;
  name: string;
  organization?: string;
  role?: string;
  location?: string;
  tags: string[];
  summary?: string;
  importantFacts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  personId: string;
  occurredAt: string;
  type: InteractionType;
  notes: string;
  extractedFacts?: string[];
  createdAt: string;
}

export interface StructuredImportPayload {
  schemaVersion: "1.0";
  person: {
    name: string;
    organization?: string;
    role?: string;
    location?: string;
    tags?: string[];
    summary?: string;
    importantFacts?: string[];
  };
  interaction: {
    occurredAt: string;
    type: InteractionType;
    notes: string;
    extractedFacts?: string[];
  };
}

export interface PersonWithInteractions extends Person {
  interactions: Omit<Interaction, "personId">[];
}

export interface ExportNetworkPayload {
  version: "1.0";
  exportedAt: string;
  summary: {
    totalPeople: number;
    totalInteractions: number;
  };
  network: PersonWithInteractions[];
}

export interface AppState {
  people: Person[];
  interactions: Interaction[];
}
