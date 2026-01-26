"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface Associate {
  _id: string;
  fullName: string;
  cedula: string;
  joinDate: string;
  electoralZone: string;
  email: string;
  cellPhone: string;
  isActive: boolean;
}

interface EditAssociateModalProps {
  isOpen: boolean;
  associate: Associate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditAssociateModal({
  isOpen,
  associate,
  onClose,
  onSuccess,
}: EditAssociateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Associate | null>(null);

  useEffect(() => {
    if (associate && isOpen) {
      setFormData({ ...associate });
    }
  }, [associate?._id, isOpen]);

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.checked)
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isActive: e.target.checked,
        };
      });
    },
    []
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value,
        };
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setError("");

    try {

        console.log(formData)

      const response = await fetch("/api/associates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formData._id,
          fullName: formData.fullName,
          cedula: formData.cedula,
          joinDate: formData.joinDate,
          electoralZone: formData.electoralZone,
          email: formData.email,
          cellPhone: formData.cellPhone,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error updating associate");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Edit Associate</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cedula</label>
            <Input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Cell Phone
            </label>
            <Input
              type="tel"
              name="cellPhone"
              value={formData.cellPhone}
              onChange={handleChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Electoral Zone
            </label>
            <select
              name="electoralZone"
              value={formData.electoralZone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Zone 1">Zone 1</option>
              <option value="Zone 2">Zone 2</option>
              <option value="Zone 3">Zone 3</option>
              <option value="Zone 4">Zone 4</option>
              <option value="Zone 5">Zone 5</option>
              <option value="Zone 6">Zone 6</option>
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Status</label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 font-medium">
                {formData.isActive ? "✓ Active" : "✗ Inactive"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-slate-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
