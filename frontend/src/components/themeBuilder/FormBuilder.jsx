import React, { useState, useId } from 'react';
import { useThemeEditor } from '../../contexts/ThemeEditorContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, GripVertical, Trash2, Mail } from 'lucide-react';

/**
 * FormBuilder - Week 10 Implementation
 * Drag-and-drop form builder
 */
const FormBuilder = ({ element, updateElement }) => {
  const submitTextId = useId();
  const successMsgId = useId();
  const sendToEmailId = useId();
  const formFields = element.formFields || [];
  const formSettings = element.formSettings || {
    submitText: 'Submit',
    successMessage: 'Thank you! Your submission has been received.',
    sendToEmail: 'admin@example.com'
  };

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' }
  ];

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
      options: [] // for select/radio
    };
    updateElement(element.id, {
      formFields: [...formFields, newField]
    });
  };

  const removeField = (fieldId) => {
    updateElement(element.id, {
      formFields: formFields.filter(f => f.id !== fieldId)
    });
  };

  const updateField = (fieldId, updates) => {
    updateElement(element.id, {
      formFields: formFields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      )
    });
  };

  const updateSettings = (updates) => {
    updateElement(element.id, {
      formSettings: { ...formSettings, ...updates }
    });
  };

  return (
    <div className="space-y-4">
      {/* Form Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Form Fields</Label>
          <Button size="sm" variant="outline" onClick={addField}>
            <Plus size={14} className="mr-1" />
            Add Field
          </Button>
        </div>

        {formFields.length === 0 ? (
          <div className="p-4 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <Mail className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-xs text-gray-500">No fields yet</p>
            <p className="text-xs text-gray-400 mt-1">Add fields to build your form</p>
          </div>
        ) : (
          <div className="space-y-2">
            {formFields.map((field) => (
              <FormFieldEditor
                key={field.id}
                field={field}
                onUpdate={(updates) => updateField(field.id, updates)}
                onRemove={() => removeField(field.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Settings */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <Label className="text-sm font-semibold">Form Settings</Label>

        <div className="space-y-2">
          <Label htmlFor={submitTextId}>Submit Button Text</Label>
          <Input
            id={submitTextId}
            value={formSettings.submitText}
            onChange={(e) => updateSettings({ submitText: e.target.value })}
            placeholder="Submit"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={successMsgId}>Success Message</Label>
          <textarea
            id={successMsgId}
            value={formSettings.successMessage}
            onChange={(e) => updateSettings({ successMessage: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={sendToEmailId}>Send Submissions To</Label>
          <Input
            id={sendToEmailId}
            type="email"
            value={formSettings.sendToEmail}
            onChange={(e) => updateSettings({ sendToEmail: e.target.value })}
            placeholder="admin@example.com"
          />
        </div>
      </div>
    </div>
  );
};

const FormFieldEditor = ({ field, onUpdate, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const fieldTypeId = useId();
  const fieldLabelId = useId();
  const fieldPlaceholderId = useId();

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg">
      <div className="p-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-800">
        <GripVertical size={16} className="text-gray-400 cursor-grab" />
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs font-medium">{field.label || 'Untitled'}</span>
          <span className="text-xs text-gray-500">({field.type})</span>
          {field.required && (
            <span className="text-xs text-red-600">*</span>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? '−' : '+'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 size={14} className="text-red-600" />
        </Button>
      </div>

      {expanded && (
        <div className="p-3 space-y-2 border-t border-gray-200 dark:border-gray-800">
          <div className="space-y-1">
            <Label className="text-xs" htmlFor={fieldTypeId}>Field Type</Label>
            <select
              id={fieldTypeId}
              value={field.type}
              onChange={(e) => onUpdate({ type: e.target.value })}
              className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="textarea">Textarea</option>
              <option value="select">Dropdown</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs" htmlFor={fieldLabelId}>Label</Label>
            <Input
              id={fieldLabelId}
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Field label"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs" htmlFor={fieldPlaceholderId}>Placeholder</Label>
            <Input
              id={fieldPlaceholderId}
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="Placeholder text"
              className="h-8 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded"
            />
            Required field
          </label>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
