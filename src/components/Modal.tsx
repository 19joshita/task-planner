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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-0">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
        {title && (
          <h3 className="mb-4 text-lg sm:text-xl font-semibold text-gray-800">
            {title}
          </h3>
        )}

        {/* Content */}
        <div className="space-y-3 text-sm sm:text-base">{children}</div>

        {/* Actions */}
        <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button
            className="w-full sm:w-auto rounded-xl border px-4 py-2 text-sm sm:text-base"
            onClick={onClose}
          >
            Cancel
          </button>
          {onSubmit && (
            <button
              className="w-full sm:w-auto rounded-xl bg-black px-4 py-2 text-sm sm:text-base text-white"
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
  <label className="block w-full">
    <span className="mb-1 block text-sm sm:text-base text-gray-600">
      Category
    </span>
    <select
      className="w-full rounded-xl border px-3 py-2 text-sm sm:text-base"
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
