import React, { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

// Interface for EditableCell component props
interface EditableCellProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  type?: 'text' | 'number';
}

// Component for editing a cell in a table
const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, type = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(type === 'number' ? Number(editValue) : editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full px-2 py-1 border rounded-md text-sm"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-800"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:text-red-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group">
      <span>{value}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="invisible group-hover:visible p-1 text-gray-400 hover:text-gray-600"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditableCell;