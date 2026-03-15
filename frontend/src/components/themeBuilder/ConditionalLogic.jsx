import React, { useState } from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Plus, X, Eye, EyeOff } from 'lucide-react';

/**
 * ConditionalLogic - Week 9 Implementation
 * Show/hide elements based on rules
 */
const ConditionalLogic = ({ element, updateElement }) => {
  const conditions = element.conditions || [];
  const conditionLogic = element.conditionLogic || 'AND';

  const addCondition = () => {
    const newCondition = {
      id: `condition-${Date.now()}`,
      type: 'device',
      operator: 'is',
      value: 'mobile'
    };
    updateElement(element.id, {
      conditions: [...conditions, newCondition]
    });
  };

  const removeCondition = (conditionId) => {
    updateElement(element.id, {
      conditions: conditions.filter(c => c.id !== conditionId)
    });
  };

  const updateCondition = (conditionId, updates) => {
    updateElement(element.id, {
      conditions: conditions.map(c =>
        c.id === conditionId ? { ...c, ...updates } : c
      )
    });
  };

  const toggleLogic = () => {
    updateElement(element.id, {
      conditionLogic: conditionLogic === 'AND' ? 'OR' : 'AND'
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Visibility Conditions</Label>
        <Button size="sm" variant="outline" onClick={addCondition}>
          <Plus size={14} />
        </Button>
      </div>

      {conditions.length === 0 ? (
        <div className="p-4 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <Eye className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-xs text-gray-500">Always visible</p>
          <p className="text-xs text-gray-400 mt-1">Add conditions to control visibility</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <div key={condition.id}>
                {index > 0 && (
                  <div className="flex justify-center my-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleLogic}
                      className="h-6 text-xs"
                    >
                      {conditionLogic}
                    </Button>
                  </div>
                )}
                <ConditionEditor
                  condition={condition}
                  onUpdate={(updates) => updateCondition(condition.id, updates)}
                  onRemove={() => removeCondition(condition.id)}
                />
              </div>
            ))}
          </div>

          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
            <EyeOff className="inline w-3 h-3 mr-1" />
            Element will be hidden unless {conditionLogic === 'AND' ? 'all' : 'any'} conditions match
          </div>
        </>
      )}
    </div>
  );
};

const ConditionEditor = ({ condition, onUpdate, onRemove }) => {
  return (
    <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <select
          value={condition.type}
          onChange={(e) => onUpdate({ type: e.target.value })}
          className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        >
          <option value="device">Device Type</option>
          <option value="user">User Status</option>
          <option value="date">Date Range</option>
        </select>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <X size={14} />
        </Button>
      </div>

      <div className="flex gap-2">
        <select
          value={condition.operator}
          onChange={(e) => onUpdate({ operator: e.target.value })}
          className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
        >
          <option value="is">is</option>
          <option value="is_not">is not</option>
        </select>

        {condition.type === 'device' && (
          <select
            value={condition.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          >
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="mobile">Mobile</option>
          </select>
        )}

        {condition.type === 'user' && (
          <select
            value={condition.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          >
            <option value="logged_in">Logged In</option>
            <option value="logged_out">Logged Out</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default ConditionalLogic;
