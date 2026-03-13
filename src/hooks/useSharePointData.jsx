import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as graphService from '../lib/graphService';
import { logAuditEvent, getRecordDiff } from '../lib/auditService';

/**
 * Custom hook for SharePoint list data with CRUD operations.
 * Falls back to mock data when not authenticated or on error.
 * All mutations are automatically logged to the audit trail.
 *
 * Usage:
 *   const { data, loading, error, create, update, remove, refresh } = useSharePointData('Standards', mockStandards);
 */
export function useSharePointData(listName, fallbackData = []) {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // Fetch data from SharePoint
  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setData(fallbackData);
      setIsLive(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await graphService.getListItems(listName);
      setData(items);
      setIsLive(true);
    } catch (err) {
      console.error(`Error fetching ${listName}:`, err);
      setError(err.message);
      setData(fallbackData);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, listName, fallbackData]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Create a new item (with audit logging)
  const create = useCallback(async (fields) => {
    let newItem;

    if (!isLive) {
      newItem = { id: `local-${Date.now()}`, ...fields };
      setData(prev => [...prev, newItem]);
    } else {
      try {
        newItem = await graphService.createListItem(listName, fields);
        setData(prev => [...prev, newItem]);
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
      isLive,
    });

    return newItem;
  }, [isLive, listName, user]);

  // Update an existing item (with audit logging)
  const update = useCallback(async (itemId, fields) => {
    const oldRecord = data.find(item => item.id === itemId) || {};
    const diff = getRecordDiff(oldRecord, fields);

    if (!isLive) {
      setData(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...fields } : item
      ));
    } else {
      try {
        await graphService.updateListItem(listName, itemId, fields);
        setData(prev => prev.map(item =>
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
        isLive,
      });
    }

    return { id: itemId, ...fields };
  }, [isLive, listName, user, data]);

  // Delete an item (with audit logging)
  const remove = useCallback(async (itemId) => {
    const oldRecord = data.find(item => item.id === itemId) || {};

    if (!isLive) {
      setData(prev => prev.filter(item => item.id !== itemId));
    } else {
      try {
        await graphService.deleteListItem(listName, itemId);
        setData(prev => prev.filter(item => item.id !== itemId));
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
      isLive,
    });
  }, [isLive, listName, user, data]);

  return {
    data,
    loading,
    error,
    isLive,
    create,
    update,
    remove,
    refresh,
  };
}
