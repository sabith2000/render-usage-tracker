import { useState, useMemo, useCallback } from 'react';
import { useEntries } from './hooks/useEntries.js';
import { computeMonthlyStats } from './utils/calculations.js';
import { MONTH_NAMES } from './utils/dateHelpers.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AddEntryForm from './components/AddEntryForm.jsx';
import MonthSelector from './components/MonthSelector.jsx';
import EntriesTable from './components/EntriesTable.jsx';
import MonthlyStatsCard from './components/MonthlyStatsCard.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorFallback from './components/ErrorFallback.jsx';
import EmptyState from './components/EmptyState.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';

function App() {
  const {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAll,
    refetch,
  } = useEntries();

  // Selected month/year
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Editing state
  const [editingEntry, setEditingEntry] = useState(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => { },
    danger: false,
  });

  // Compute monthly stats
  const stats = useMemo(
    () => computeMonthlyStats(entries, selectedMonth, selectedYear),
    [entries, selectedMonth, selectedYear]
  );

  const monthLabel = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  // Handlers
  const handleSubmit = useCallback(
    async (entry) => {
      if (editingEntry) {
        const success = await updateEntry(editingEntry._id, entry);
        if (success) setEditingEntry(null);
        return success;
      }
      return addEntry(entry);
    },
    [editingEntry, updateEntry, addEntry]
  );

  const handleEdit = useCallback((entry) => {
    setEditingEntry(entry);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDelete = useCallback(
    (id) => {
      const entry = entries.find((e) => e._id === id);
      setConfirmDialog({
        isOpen: true,
        title: 'Delete Entry',
        message: `Are you sure you want to delete the entry for ${entry?.date || 'this date'}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await deleteEntry(id);
          // If we were editing this entry, cancel edit
          if (editingEntry?._id === id) setEditingEntry(null);
        },
      });
    },
    [entries, deleteEntry, editingEntry]
  );

  const handleClearAll = useCallback(() => {
    if (entries.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Entries',
      message: `This will permanently delete all ${entries.length} entries. This action cannot be undone.`,
      confirmLabel: 'Clear All',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await clearAll();
        setEditingEntry(null);
      },
    });
  }, [entries, clearAll]);

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null);
  }, []);

  const handleMonthSelect = useCallback((month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const closeDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error && entries.length === 0) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <ErrorFallback error={error} onRetry={refetch} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Add/Edit Entry Form */}
        <AddEntryForm
          onSubmit={handleSubmit}
          entries={entries}
          editingEntry={editingEntry}
          onCancelEdit={handleCancelEdit}
        />

        {/* Month Selector & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <MonthSelector
            entries={entries}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSelect={handleMonthSelect}
          />

          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="btn-ghost text-sm text-danger-400 hover:text-danger-300"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {/* Monthly Statistics */}
        <MonthlyStatsCard stats={stats} monthLabel={monthLabel} />

        {/* Entries Table or Empty State */}
        {stats.entriesWithIncrease.length > 0 ? (
          <EntriesTable
            entriesWithIncrease={stats.entriesWithIncrease}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState monthLabel={monthLabel} />
        )}
      </main>

      <Footer />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeDialog}
        danger={confirmDialog.danger}
      />
    </div>
  );
}

export default App;
