"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface Schedule {
  id: string;
  departureDate: string;
  returnDate: string;
  package: { name: string; type: string };
  availableQuota: number;
}

interface ManifestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ManifestForm({ onSuccess, onCancel }: ManifestFormProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [form, setForm] = useState({
    scheduleId: "",
    name: "",
    leaderName: "",
    notes: "",
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const res = await fetch("/api/schedules?status=OPEN&pageSize=100");
      const json = await res.json();
      if (json.success) {
        setSchedules(json.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scheduleId || !form.name) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/manifests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create manifest");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create manifest");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSchedule = schedules.find((s) => s.id === form.scheduleId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Schedule <span className="text-red-500">*</span>
        </label>
        {isLoadingSchedules ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading schedules...
          </div>
        ) : (
          <select
            value={form.scheduleId}
            onChange={(e) => {
              const schedule = schedules.find((s) => s.id === e.target.value);
              setForm({
                ...form,
                scheduleId: e.target.value,
                name: schedule
                  ? `${schedule.package.name} - ${new Date(schedule.departureDate).toLocaleDateString("id-ID")}`
                  : "",
              });
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            required
          >
            <option value="">Select a schedule</option>
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.package.name} - {new Date(schedule.departureDate).toLocaleDateString("id-ID")} ({schedule.availableQuota} seats)
              </option>
            ))}
          </select>
        )}
        {schedules.length === 0 && !isLoadingSchedules && (
          <p className="text-sm text-amber-600 mt-1">
            No open schedules available. Please create a schedule first.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Manifest Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., Umroh Reguler - Dec 2024"
          required
        />
      </div>

      {selectedSchedule && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <p className="font-medium">{selectedSchedule.package.name}</p>
          <p className="text-gray-500">
            {new Date(selectedSchedule.departureDate).toLocaleDateString("id-ID")} - {new Date(selectedSchedule.returnDate).toLocaleDateString("id-ID")}
          </p>
          <p className="text-gray-500">Type: {selectedSchedule.package.type}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tour Leader Name
        </label>
        <Input
          value={form.leaderName}
          onChange={(e) => setForm({ ...form, leaderName: e.target.value })}
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[80px]"
          placeholder="Optional notes..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !form.scheduleId || !form.name}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Manifest"
          )}
        </Button>
      </div>
    </form>
  );
}
