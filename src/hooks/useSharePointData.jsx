import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import * as graphService from '../lib/graphService';
import { logAuditEvent, getRecordDiff } from '../lib/auditService';

/**
 * Custom hook for SharePoint list data with CRUD operations.
 *
 * Key behaviors:
 * - When authenticated: starts with loading state (null data), fetches from SharePoint
 * - On error: keeps last-known-good data instead of reverting to mock
 * - Optional auto-refresh polling via refreshInterval (ms)
 * - Returns dataSource: 'live' | 'cached' | 'offline' so UI can show freshness
 *
 * Usage:
 *   const { data, loading, dataSource, lastRefreshed, refresh, create, update, remove }
 *     = useSharePointData('Standards', mockStandards, { refreshInterval: 60000 });
 */
// Stable empty array to avoid infinite re-render when callers pass [] literal
const EMPTY = [];

export function useSharePointData(listName, fallbackData = EMPTY, { refreshInterval = 0 } = {}) {
  const { isAuthenticated, user } = useAuth();

  // Stabilize fallbackData reference so it doesn't trigger re-renders
  const fallbackRef = useRef(fallbackData);

  // When authenticated, start with null (loading state) — never flash mock data
  const [data, setData] = useState(isAuthenticated ? null : fallbackRef.current);
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(isAuthenticated ? 'loading' : 'offline');
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Track last successful fetch so we never revert to mock on transient errors
  const lastGoodData = useRef(null);

  // Legacy compat: isLive derived from dataSource
  const isLive = dataSource === 'live';

  // Fetch data from SharePoint
  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setData(fallbackRef.current);
      setDataSource('offline');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await graphService.getListItems(listName);
      lastGoodData.current = items;
      setData(items);
      setDataSource('live');
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(`Error fetching ${listName}:`, err);
      setError(err.message);

      // Keep last-known-good data — NEVER revert to mock on transient errors
      if (lastGoodData.current) {
        setData(lastGoodData.current);
        setDataSource('cached');
      } else {
        // First fetch ever failed — use fallback as last resort
        setData(fallbackRef.current);
        setDataSource('offline');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, listName]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh polling (only when authenticated and interval > 0)
  useEffect(() => {
    if (!refreshInterval || !isAuthenticated) return;
    const id = setInterval(refresh, refreshInterval);
    return () => clearInterval(id);
  }, [refresh, refreshInterval, isAuthenticated]);

  // Create a new item (with audit logging)
  const create = useCallback(async (fields) => {
    let newItem;

    if (dataSource === 'offline') {
      newItem = { id: `local-${Date.now()}`, ...fields };
      setData(prev => [...(prev || []), newItem]);
    } else {
      try {
        newItem = await graphService.createListItem(listName, fields);
        setData(prev => [...(prev || []), newItem]);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }

    // Audit trail
    logAuditEvent({
      action: 'Create',
      entity: listName,
      recordId: newItem.id,
      recordName: fields.name || fields.title || fields.code || fields.course || fields.employee || `${listName} record`,
      user,
      changes: fields,
      isLive: dataSource === 'live',
    });

    return newItem;
  }, [dataSource, listName, user]);

  // Update an existing item (with audit logging)
  const update = useCallback(async (itemId, fields) => {
    const currentData = data || [];
    const oldRecord = currentData.find(item => item.id === itemId) || {};
    const diff = getRecordDiff(oldRecord, fields);

    if (dataSource === 'offline') {
      setData(prev => (prev || []).map(item =>
        item.id === itemId ? { ...item, ...fields } : item
      ));
    } else {
      try {
        await graphService.updateListItem(listName, itemId, fields);
        setData(prev => (prev || []).map(item =>
          item.id === itemId ? { ...item, ...fields } : item
        ));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }

    // Audit trail (only if actual changes)
    if (Object.keys(diff).length > 0) {
      logAuditEvent({
        action: 'Update',
        entity: listName,
        recordId: itemId,
        recordName: oldRecord.name || oldRecord.title || oldRecord.code || oldRecord.course || oldRecord.employee || `${listName} record`,
        user,
        changes: diff,
        isLive: dataSource === 'live',
      });
    }

    return { id: itemId, ...fields };
  }, [dataSource, listName, user, data]);

  // Delete an item (with audit logging)
  const remove = useCallback(async (itemId) => {
    const currentData = data || [];
    const oldRecord = currentData.find(item => item.id === itemId) || {};

    if (dataSource === 'offline') {
      setData(prev => (prev || []).filter(item => item.id !== itemId));
    } else {
      try {
        await graphService.deleteListItem(listName, itemId);
        setData(prev => (prev || []).filter(item => item.id !== itemId));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }

    // Audit trail
    logAuditEvent({
      action: 'Delete',
      entity: listName,
      recordId: itemId,
      recordName: oldRecord.name || oldRecord.title || oldRecord.code || oldRecord.course || oldRecord.employee || `${listName} record`,
      user,
      changes: { deletedRecord: oldRecord.name || oldRecord.title || oldRecord.code || itemId },
      isLive: dataSource === 'live',
    });
  }, [dataSource, listName, user, data]);

  return {
    data: data ?? EMPTY,   // Always return array (never null) for safe .map/.filter
    loading,
    error,
    isLive,                // Legacy compat
    dataSource,            // 'live' | 'cached' | 'offline' | 'loading'
    lastRefreshed,         // Date or null
    create,
    update,
    remove,
    refresh,
  };
}
