import React from "react";
import { Category } from "../types";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSubmit?: () => void;
  children?: React.ReactNode;
  submitText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitText = "Save",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        {title && <h3 className="mb-4 text-xl font-semibold">{title}</h3>}
        <div className="space-y-3">{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-xl border px-3 py-1.5" onClick={onClose}>
            Cancel
          </button>
          {onSubmit && (
            <button
              className="rounded-xl bg-black px-3 py-1.5 text-white"
              onClick={onSubmit}
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CategorySelect: React.FC<{
  value: Category;
  onChange: (c: Category) => void;
}> = ({ value, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-sm text-gray-600">Category</span>
    <select
      className="w-full rounded-xl border px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value as Category)}
    >
      {(["To Do", "In Progress", "Review", "Completed"] as Category[]).map(
        (c) => (
          <option key={c} value={c}>
            {c}
          </option>
        )
      )}
    </select>
  </label>
);
