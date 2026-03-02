import { useState, useMemo, useCallback } from 'react';
import { Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEntries } from './hooks/useEntries.js';
import { computeMonthlyStats } from './utils/calculations.js';
import { MONTH_NAMES } from './utils/dateHelpers.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AddEntryForm from './components/AddEntryForm.jsx';
import MonthSelector from './components/MonthSelector.jsx';
import EntriesTable from './components/EntriesTable.jsx';
import MonthlyStatsCard from './components/MonthlyStatsCard.jsx';
import SkeletonLoader from './components/LoadingSpinner.jsx';
import MonthTransitionBanner from './components/MonthTransitionBanner.jsx';
import ErrorFallback from './components/ErrorFallback.jsx';
import EmptyState from './components/EmptyState.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import HistoryModal from './components/HistoryModal.jsx';

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

  // History modal state
  const [historyEntry, setHistoryEntry] = useState(null);

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

  const handleViewHistory = useCallback((entry) => {
    setHistoryEntry(entry);
  }, []);

  const handleExport = useCallback(() => {
    if (entries.length === 0) {
      toast.error('No entries to export');
      return;
    }
    try {
      const exportData = entries.map(({ _id, date, totalHours, history, createdAt, updatedAt }) => ({
        date,
        totalHours,
        history: history || [],
        createdAt,
        updatedAt,
      }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `render-usage-export-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${entries.length} entries`);
    } catch (err) {
      toast.error('Failed to export data');
    }
  }, [entries]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <SkeletonLoader />
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
          onAdd={addEntry}
          onUpdate={updateEntry}
          entries={entries}
          editEntry={editingEntry}
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/30 rounded-lg transition-all text-sm font-medium border border-transparent"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-2 bg-danger-600 text-white hover:bg-danger-500 shadow-lg shadow-danger-500/30 rounded-lg transition-all text-sm font-medium border border-transparent"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Entries
              </button>
            </div>
          )}
        </div>

        {/* Month Transition Banner */}
        <MonthTransitionBanner selectedMonth={selectedMonth} selectedYear={selectedYear} entries={entries} />

        {/* Monthly Statistics */}
        <MonthlyStatsCard stats={stats} monthLabel={monthLabel} entries={entries} selectedMonth={selectedMonth} selectedYear={selectedYear} />

        {/* Entries Table or Empty State */}
        {stats.entriesWithIncrease.length > 0 ? (
          <EntriesTable
            entriesWithIncrease={stats.entriesWithIncrease}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewHistory={handleViewHistory}
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

      {/* History Modal */}
      <HistoryModal
        isOpen={!!historyEntry}
        entry={historyEntry}
        onClose={() => setHistoryEntry(null)}
      />
    </div>
  );
}

export default App;
