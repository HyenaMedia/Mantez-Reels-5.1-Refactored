import React, { useState, useEffect, useCallback } from 'react';
import { Clock, RotateCcw, Trash2, Save, ChevronDown, ChevronRight, Plus, Check } from 'lucide-react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';

/* ── Helpers ──────────────────────────────────────────────────────────── */

// Use same URL pattern as the rest of the app (ThemeEditorContext, etc.)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

async function apiFetch(path, opts = {}) {
  // App stores the token under 'token' key (confirmed in ThemeEditorContext.jsx:184,209)
  const token = localStorage.getItem('token') || '';
  const res = await fetch(`${BACKEND_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...opts,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const body = await res.json(); msg = body.detail || body.message || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json();
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Section head ─────────────────────────────────────────────────────── */
const SectionHead = ({ title, action }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</span>
    {action}
  </div>
);

/* ── Local snapshot row ─────────────────────────────────────────────────  */
const LocalSnapRow = ({ snap, onRestore, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? <ChevronDown size={12} className="text-gray-400 shrink-0" /> : <ChevronRight size={12} className="text-gray-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{snap.label}</p>
          <p className="text-[10px] text-gray-400">{formatTime(snap.timestamp)} · {snap.sectionCount} sections</p>
        </div>
      </div>
      {expanded && (
        <div className="flex items-center gap-2 px-3 pb-2 bg-gray-50 dark:bg-gray-800/30">
          <button
            onClick={() => onRestore(snap.id)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            <RotateCcw size={11} />
            Restore
          </button>
          <button
            onClick={() => onDelete(snap.id)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-transparent text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={11} />
            Delete
          </button>
          <span className="text-[10px] text-gray-400 ml-auto">{new Date(snap.timestamp).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

/* ── Server version row ────────────────────────────────────────────────── */
const ServerVersionRow = ({ version, onRestore, onDelete, pageId }) => {
  const [expanded, setExpanded] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const isOptimistic = version._optimistic;

  const handleRestore = async () => {
    setRestoring(true);
    try { await onRestore(version.id); }
    finally { setRestoring(false); }
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${isOptimistic ? 'border-violet-300 dark:border-violet-700 opacity-60' : 'border-gray-100 dark:border-gray-800'}`}>
      <div
        className={`flex items-center gap-2 px-3 py-2 ${isOptimistic ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
        onClick={() => !isOptimistic && setExpanded(e => !e)}
      >
        {isOptimistic
          ? <span className="text-[10px] animate-pulse text-violet-400 shrink-0">⟳</span>
          : expanded
            ? <ChevronDown size={12} className="text-gray-400 shrink-0" />
            : <ChevronRight size={12} className="text-gray-400 shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
            {version.label}
            {isOptimistic && <span className="ml-1 text-[10px] text-violet-400">(saving…)</span>}
          </p>
          <p className="text-[10px] text-gray-400">
            {formatTime(version.timestamp)}{!isOptimistic && ` · ${version.section_count ?? '?'} sections`}
            {version.saved_by && ` · ${version.saved_by}`}
          </p>
        </div>
      </div>
      {expanded && !isOptimistic && (
        <div className="flex items-center gap-2 px-3 pb-2 bg-gray-50 dark:bg-gray-800/30">
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {restoring ? <span className="animate-spin">⟳</span> : <RotateCcw size={11} />}
            {restoring ? 'Restoring…' : 'Restore'}
          </button>
          <button
            onClick={() => onDelete(version.id)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={11} />
            Delete
          </button>
          <span className="text-[10px] text-gray-400 ml-auto">{new Date(version.timestamp).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

/* ── Main VersionHistory panel ────────────────────────────────────────── */
const VersionHistory = ({ pageId = 'home' }) => {
  const { getSnapshots, saveSnapshot, restoreSnapshot, deleteSnapshot, setPageState, setIsDirty } = useThemeEditor();

  const [localSnaps, setLocalSnaps] = useState([]);
  const [serverVersions, setServerVersions] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverHasMore, setServerHasMore] = useState(false);
  const [serverOffset, setServerOffset] = useState(0);
  const PAGE_SIZE = 20;
  const [loadingServer, setLoadingServer] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  /* Load local snapshots from localStorage */
  const refreshLocal = useCallback(() => {
    setLocalSnaps(getSnapshots());
  }, [getSnapshots]);

  /* Load first page of server versions (resets list) */
  const refreshServer = useCallback(async (signal) => {
    setLoadingServer(true);
    setServerError(null);
    setServerOffset(0);
    try {
      const opts = signal ? { signal } : {};
      const data = await apiFetch(`/pages/${pageId}/versions?limit=${PAGE_SIZE}&offset=0`, opts);
      setServerVersions(data.versions || []);
      setServerTotal(data.total ?? 0);
      setServerHasMore(data.has_more ?? false);
    } catch (e) {
      if (e.name === 'AbortError') return;
      setServerError('Could not load server versions');
    } finally {
      setLoadingServer(false);
    }
  }, [pageId]);

  /* Load next page and append to list */
  const loadMoreServer = useCallback(async () => {
    if (loadingMore || !serverHasMore) return;
    setLoadingMore(true);
    const nextOffset = serverOffset + PAGE_SIZE;
    try {
      const data = await apiFetch(`/pages/${pageId}/versions?limit=${PAGE_SIZE}&offset=${nextOffset}`);
      setServerVersions(prev => [...prev, ...(data.versions || [])]);
      setServerTotal(data.total ?? 0);
      setServerHasMore(data.has_more ?? false);
      setServerOffset(nextOffset);
    } catch (e) {
      setServerError('Could not load more versions');
    } finally {
      setLoadingMore(false);
    }
  }, [pageId, serverOffset, serverHasMore, loadingMore]);

  useEffect(() => {
    const controller = new AbortController();
    refreshLocal();
    refreshServer(controller.signal);
    return () => controller.abort();
  }, [refreshLocal, refreshServer]);

  /* Save a local snapshot (called separately; label cleared by the combined handler) */
  const handleSaveLocal = (label) => {
    saveSnapshot(label || undefined);
    refreshLocal();
  };

  /* Save a server version */
  const handleSaveServer = async () => {
    setSaving(true);
    setSaveOk(false);

    // ── Optimistic update ──────────────────────────────────────────────────
    // Show a placeholder entry immediately so the UI feels instant.
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticLabel = newLabel || `Version ${new Date().toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    const optimisticEntry = {
      id: optimisticId,
      label: optimisticLabel,
      timestamp: new Date().toISOString(),
      section_count: null, // unknown until server responds
      _optimistic: true,   // flag so UI can show pending state
    };
    setServerVersions(prev => [optimisticEntry, ...prev]);
    setServerTotal(prev => prev + 1);

    try {
      await apiFetch(`/pages/${pageId}/versions`, {
        method: 'POST',
        body: JSON.stringify({ label: newLabel || '' }),
      });
      // Only show "Saved!" check if the server call actually succeeded
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2000);
      // Replace optimistic entry with the real data from the server
      await refreshServer();
    } catch (e) {
      // Roll back optimistic entry on failure
      setServerVersions(prev => prev.filter(v => v.id !== optimisticId));
      setServerTotal(prev => Math.max(0, prev - 1));
      // Server save failed — local snapshot still works; show subtle error
      setServerError(`Server save failed: ${e.message}`);
      setTimeout(() => setServerError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  /* Restore local */
  const handleRestoreLocal = (id) => {
    restoreSnapshot(id);
  };

  /* Delete local */
  const handleDeleteLocal = (id) => {
    deleteSnapshot(id);
    refreshLocal();
  };

  /* Restore server version — fetches full state then applies to editor */
  const handleRestoreServer = async (versionId) => {
    try {
      const data = await apiFetch(`/pages/${pageId}/versions/${versionId}`);
      const state = data.version?.state;
      if (state) {
        // Also call the restore API to update server-side current page
        await apiFetch(`/pages/${pageId}/versions/${versionId}/restore`, { method: 'POST' });
        if (typeof setPageState === 'function') {
          setPageState({ page: state });
          if (typeof setIsDirty === 'function') setIsDirty(true);
        }
      }
      await refreshServer();
    } catch (e) {
      // Could show a toast — silently log for now
      console.error('Restore failed:', e);
    }
  };

  /* Delete server version */
  const handleDeleteServer = async (versionId) => {
    try {
      await apiFetch(`/pages/${pageId}/versions/${versionId}`, { method: 'DELETE' });
      await refreshServer();
    } catch (e) { console.error('Failed to delete version:', e); }
  };

  return (
    <div className="p-3 space-y-4">
      {/* Save new version */}
      <div className="space-y-2">
        <SectionHead title="Save Version" />
        <div className="flex gap-2">
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Version label (optional)"
            onKeyDown={e => e.key === 'Enter' && handleSaveLocal()}
            className="flex-1 h-8 px-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-violet-400 text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
          <button
            onClick={() => { handleSaveLocal(newLabel); setNewLabel(''); handleSaveServer(); }}
            disabled={saving}
            title="Save snapshot locally + to server"
            className="flex items-center gap-1 px-3 h-8 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {saveOk ? <Check size={12} /> : saving ? <span className="animate-spin">⟳</span> : <Save size={12} />}
            {saveOk ? 'Saved!' : 'Save'}
          </button>
        </div>
        <p className="text-[10px] text-gray-400">Saves a local + server snapshot you can restore later.</p>
      </div>

      {/* Local snapshots */}
      <div className="space-y-2">
        <SectionHead
          title={`Local Snapshots (${localSnaps.length})`}
          action={
            <button onClick={refreshLocal} className="text-[10px] text-violet-500 hover:underline">
              Refresh
            </button>
          }
        />
        {localSnaps.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-600 py-2 text-center">No local snapshots yet</p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {localSnaps.map(snap => (
              <LocalSnapRow
                key={snap.id}
                snap={snap}
                onRestore={handleRestoreLocal}
                onDelete={handleDeleteLocal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Server versions */}
      <div className="space-y-2">
        <SectionHead
          title={`Server Versions (${serverVersions.length}${serverTotal > serverVersions.length ? ` of ${serverTotal}` : ''})`}
          action={
            <button onClick={refreshServer} className="text-[10px] text-violet-500 hover:underline">
              {loadingServer ? '…' : 'Refresh'}
            </button>
          }
        />
        {serverError && (
          <p className="text-[10px] text-red-500 py-1">{serverError}</p>
        )}
        {!serverError && serverVersions.length === 0 && !loadingServer && (
          <p className="text-xs text-gray-400 dark:text-gray-600 py-2 text-center">No server versions yet</p>
        )}
        {loadingServer && (
          <p className="text-xs text-gray-400 py-2 text-center animate-pulse">Loading…</p>
        )}
        {!loadingServer && serverVersions.length > 0 && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {serverVersions.map(v => (
              <ServerVersionRow
                key={v.id}
                version={v}
                pageId={pageId}
                onRestore={handleRestoreServer}
                onDelete={handleDeleteServer}
              />
            ))}
            {serverHasMore && (
              <button
                onClick={loadMoreServer}
                disabled={loadingMore}
                className="w-full py-1.5 text-[10px] text-violet-500 hover:text-violet-700 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? 'Loading…' : `Load more (${serverTotal - serverVersions.length} remaining)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-2.5 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-200 dark:border-violet-800 text-[10px] text-violet-700 dark:text-violet-300">
        <Clock size={11} className="shrink-0 mt-0.5" />
        <span>
          Local snapshots are stored in browser storage (up to 20). Server versions are persisted in the database (up to 50). Restoring a version creates an auto-backup of the current state first.
        </span>
      </div>
    </div>
  );
};

export default VersionHistory;
