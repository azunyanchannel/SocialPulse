import React, { useState, useEffect, useMemo } from "react";
import type { AppState, Person, Interaction, StructuredImportPayload } from "./models/types";
import { loadState, saveState } from "./storage/localStorage";
import { generateId } from "./utils/id";
import { PeopleList } from "./components/PeopleList";
import { PersonDetail } from "./components/PersonDetail";
import { AddPersonModal } from "./components/AddPersonModal";
import { EditPersonModal } from "./components/EditPersonModal";
import { ImportMemoryModal } from "./components/ImportMemoryModal";
import { ExportDataModal } from "./components/ExportDataModal";

const THEME_STORAGE_KEY = "socialpulse_theme";

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => loadState());
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(() => {
    const initial = loadState();
    return initial.people.length > 0 ? initial.people[0].id : null;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Theme state (persisted to localStorage)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  // Apply theme to document root & persist
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Sync state to localStorage whenever appState changes
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  // Filtered people based on search query
  const filteredPeople = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return appState.people;

    return appState.people.filter((person) => {
      const matchName = person.name.toLowerCase().includes(q);
      const matchOrg = person.organization?.toLowerCase().includes(q);
      const matchRole = person.role?.toLowerCase().includes(q);
      const matchLoc = person.location?.toLowerCase().includes(q);
      const matchTags = person.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchSummary = person.summary?.toLowerCase().includes(q);
      return matchName || matchOrg || matchRole || matchLoc || matchTags || matchSummary;
    });
  }, [appState.people, searchQuery]);

  // Selected person object
  const selectedPerson = useMemo(() => {
    if (!selectedPersonId) return null;
    return appState.people.find((p) => p.id === selectedPersonId) || null;
  }, [appState.people, selectedPersonId]);

  // Interactions for the selected person
  const selectedPersonInteractions = useMemo(() => {
    if (!selectedPersonId) return [];
    return appState.interactions.filter((i) => i.personId === selectedPersonId);
  }, [appState.interactions, selectedPersonId]);

  // Handler for adding a person manually
  const handleAddPerson = (newPerson: Person) => {
    setAppState((prev) => ({
      ...prev,
      people: [newPerson, ...prev.people]
    }));
    setSelectedPersonId(newPerson.id);
  };

  // Handler for opening edit modal
  const handleOpenEditModal = (person: Person) => {
    setEditingPerson(person);
    setIsEditModalOpen(true);
  };

  // Handler for saving edited person
  const handleSaveEditedPerson = (updatedPerson: Person) => {
    setAppState((prev) => ({
      ...prev,
      people: prev.people.map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
    }));
  };

  // Handler for deleting a person
  const handleDeletePerson = (personId: string) => {
    setAppState((prev) => {
      const updatedPeople = prev.people.filter((p) => p.id !== personId);
      const updatedInteractions = prev.interactions.filter((i) => i.personId !== personId);

      // If deleted person was selected, switch to first remaining person
      if (selectedPersonId === personId) {
        setSelectedPersonId(updatedPeople.length > 0 ? updatedPeople[0].id : null);
      }

      return {
        people: updatedPeople,
        interactions: updatedInteractions
      };
    });
  };

  // Handler for structured import
  const handleConfirmImport = (
    payload: StructuredImportPayload,
    existingPerson: Person | null
  ) => {
    const now = new Date().toISOString();

    if (existingPerson) {
      // Attach interaction to existing person
      const newInteraction: Interaction = {
        id: generateId("int"),
        personId: existingPerson.id,
        occurredAt: payload.interaction.occurredAt,
        type: payload.interaction.type,
        notes: payload.interaction.notes,
        extractedFacts: payload.interaction.extractedFacts,
        createdAt: now
      };

      // Merge any new facts into existing person's list without duplicates
      const updatedPeople = appState.people.map((p) => {
        if (p.id === existingPerson.id) {
          const currentFacts = [...p.importantFacts];
          if (payload.person.importantFacts) {
            for (const fact of payload.person.importantFacts) {
              if (!currentFacts.includes(fact)) {
                currentFacts.push(fact);
              }
            }
          }
          return {
            ...p,
            importantFacts: currentFacts,
            updatedAt: now
          };
        }
        return p;
      });

      setAppState((prev) => ({
        people: updatedPeople,
        interactions: [newInteraction, ...prev.interactions]
      }));

      setSelectedPersonId(existingPerson.id);
    } else {
      // Create new Person and new Interaction
      const newPersonId = generateId("person");

      const newPerson: Person = {
        id: newPersonId,
        name: payload.person.name,
        organization: payload.person.organization,
        role: payload.person.role,
        location: payload.person.location,
        tags: payload.person.tags || [],
        summary: payload.person.summary,
        importantFacts: payload.person.importantFacts || [],
        createdAt: now,
        updatedAt: now
      };

      const newInteraction: Interaction = {
        id: generateId("int"),
        personId: newPersonId,
        occurredAt: payload.interaction.occurredAt,
        type: payload.interaction.type,
        notes: payload.interaction.notes,
        extractedFacts: payload.interaction.extractedFacts,
        createdAt: now
      };

      setAppState((prev) => ({
        people: [newPerson, ...prev.people],
        interactions: [newInteraction, ...prev.interactions]
      }));

      setSelectedPersonId(newPersonId);
    }
  };

  return (
    <div className="app-container" data-theme={theme}>
      <PeopleList
        people={filteredPeople}
        selectedPersonId={selectedPersonId}
        onSelectPerson={setSelectedPersonId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <PersonDetail
        person={selectedPerson}
        interactions={selectedPersonInteractions}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenEditModal={handleOpenEditModal}
        onDeletePerson={handleDeletePerson}
      />

      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPerson={handleAddPerson}
      />

      <EditPersonModal
        isOpen={isEditModalOpen}
        person={editingPerson}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPerson(null);
        }}
        onSavePerson={handleSaveEditedPerson}
      />

      <ImportMemoryModal
        isOpen={isImportModalOpen}
        existingPeople={appState.people}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={handleConfirmImport}
      />

      <ExportDataModal
        isOpen={isExportModalOpen}
        appState={appState}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default App;
