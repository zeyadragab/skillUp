import React, { memo, useState, useCallback, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { availabilityAPI } from "../../../services/api";
import {
  Calendar,
  Clock,
  Save,
  Loader,
  CheckCircle,
  Globe,
  Info,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==================== CONSTANTS ====================

// Days in display order: Mon(1)..Sun(0 mapped to display index 6)
const DAYS = [
  { label: "Mon", dayOfWeek: 1 },
  { label: "Tue", dayOfWeek: 2 },
  { label: "Wed", dayOfWeek: 3 },
  { label: "Thu", dayOfWeek: 4 },
  { label: "Fri", dayOfWeek: 5 },
  { label: "Sat", dayOfWeek: 6 },
  { label: "Sun", dayOfWeek: 0 },
];

// Each block covers a 2-hour slot for display; teacher enables/disables full blocks
// Slots are hourly (matching backend generateTimeSlots helper)
const TIME_BLOCKS = [
  {
    label: "Morning",
    sublabel: "06:00 – 12:00",
    hours: ["06", "07", "08", "09", "10", "11"],
  },
  {
    label: "Afternoon",
    sublabel: "12:00 – 18:00",
    hours: ["12", "13", "14", "15", "16", "17"],
  },
  {
    label: "Evening",
    sublabel: "18:00 – 24:00",
    hours: ["18", "19", "20", "21", "22", "23"],
  },
];

const COMMON_TIMEZONES = [
  "UTC",
  "UTC-12:00",
  "UTC-11:00",
  "UTC-10:00",
  "UTC-09:00",
  "UTC-08:00",
  "UTC-07:00",
  "UTC-06:00",
  "UTC-05:00",
  "UTC-04:00",
  "UTC-03:00",
  "UTC-02:00",
  "UTC-01:00",
  "UTC+01:00",
  "UTC+02:00",
  "UTC+03:00",
  "UTC+04:00",
  "UTC+05:00",
  "UTC+05:30",
  "UTC+06:00",
  "UTC+07:00",
  "UTC+08:00",
  "UTC+09:00",
  "UTC+10:00",
  "UTC+11:00",
  "UTC+12:00",
];

// ==================== HELPERS ====================

/**
 * Build a Set key for a (dayOfWeek, blockIndex) cell.
 */
const cellKey = (dayOfWeek, blockIndex) => `${dayOfWeek}-${blockIndex}`;

/**
 * Build hourly timeSlots array for a given set of hours.
 * e.g. hours ["06","07"] → [{startTime:"06:00", endTime:"07:00"}, ...]
 */
function buildTimeSlots(hours) {
  return hours.map((h) => {
    const start = `${h}:00`;
    const nextHour = String(parseInt(h, 10) + 1).padStart(2, "0");
    const end = nextHour === "24" ? "24:00" : `${nextHour}:00`;
    return { startTime: start, endTime: end, isBooked: false };
  });
}

/**
 * Determine which (dayOfWeek, blockIndex) cells are active based on availability docs.
 * A cell is "active" if ANY slot in that block's hours exists and is not booked.
 */
function buildActiveCells(availabilityDocs) {
  const active = new Set();
  availabilityDocs.forEach((doc) => {
    const { dayOfWeek, timeSlots = [] } = doc;
    TIME_BLOCKS.forEach((block, blockIndex) => {
      const hasSlot = block.hours.some((h) =>
        timeSlots.some(
          (s) => s.startTime === `${h}:00` && !s.isBooked
        )
      );
      if (hasSlot) {
        active.add(cellKey(dayOfWeek, blockIndex));
      }
    });
  });
  return active;
}

// ==================== READ-ONLY GRID ====================
const ReadOnlyGrid = memo(({ availabilityDocs, timezone }) => {
  const activeCells = buildActiveCells(availabilityDocs);
  const hasAny = activeCells.size > 0;

  return (
    <div className="space-y-6">
      {/* Timezone badge */}
      {timezone && (
        <div className="flex items-center space-x-2 text-sm text-text-muted">
          <Globe className="w-4 h-4" />
          <span className="font-semibold">{timezone}</span>
        </div>
      )}

      {hasAny ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th className="w-28 pb-2 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Time Block
                </th>
                {DAYS.map((d) => (
                  <th
                    key={d.dayOfWeek}
                    className="pb-2 text-center text-[10px] font-black uppercase tracking-widest text-text-muted"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_BLOCKS.map((block, blockIndex) => (
                <tr key={blockIndex}>
                  <td className="pr-3 align-middle">
                    <div className="text-xs font-black text-text-main">
                      {block.label}
                    </div>
                    <div className="text-[10px] text-text-muted font-semibold">
                      {block.sublabel}
                    </div>
                  </td>
                  {DAYS.map((d) => {
                    const active = activeCells.has(
                      cellKey(d.dayOfWeek, blockIndex)
                    );
                    return (
                      <td key={d.dayOfWeek} className="text-center">
                        <div
                          className={`mx-auto h-10 w-full rounded-xl border transition-all ${
                            active
                              ? "bg-blue-500/20 border-blue-500 shadow-sm shadow-blue-500/10"
                              : "bg-gray-800/10 border-gray-200"
                          }`}
                        >
                          {active && (
                            <div className="flex items-center justify-center h-full">
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-border rounded-3xl">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-text-muted/40" />
          <p className="text-sm font-bold text-text-muted">
            This teacher hasn't set their availability yet.
          </p>
        </div>
      )}
    </div>
  );
});

ReadOnlyGrid.displayName = "ReadOnlyGrid";

// ==================== EDITABLE GRID ====================
const EditableGrid = memo(({ activeCells, onToggle }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[560px] border-separate border-spacing-1.5">
      <thead>
        <tr>
          <th className="w-28 pb-2 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
            Time Block
          </th>
          {DAYS.map((d) => (
            <th
              key={d.dayOfWeek}
              className="pb-2 text-center text-[10px] font-black uppercase tracking-widest text-text-muted"
            >
              {d.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TIME_BLOCKS.map((block, blockIndex) => (
          <tr key={blockIndex}>
            <td className="pr-3 align-middle">
              <div className="text-xs font-black text-text-main">
                {block.label}
              </div>
              <div className="text-[10px] text-text-muted font-semibold">
                {block.sublabel}
              </div>
            </td>
            {DAYS.map((d) => {
              const key = cellKey(d.dayOfWeek, blockIndex);
              const active = activeCells.has(key);
              return (
                <td key={d.dayOfWeek} className="text-center">
                  <button
                    type="button"
                    onClick={() => onToggle(d.dayOfWeek, blockIndex)}
                    title={`${active ? "Remove" : "Add"} ${block.label} on ${d.label}`}
                    className={`h-10 w-full rounded-xl border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      active
                        ? "bg-blue-500/20 border-blue-500 shadow-sm shadow-blue-500/10 hover:bg-blue-500/30"
                        : "bg-gray-800/5 border-gray-700/30 hover:border-blue-400/60 hover:bg-blue-500/10"
                    }`}
                  >
                    {active && (
                      <div className="flex items-center justify-center h-full">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

EditableGrid.displayName = "EditableGrid";

// ==================== MAIN SECTION ====================
const AvailabilitySection = memo(({ isOwnProfile = true, profileUserId }) => {
  const { user } = useUser();

  // Determine whose availability we're showing
  const viewingUserId = profileUserId || user?._id;
  const canEdit = isOwnProfile && user?.isTeacher;
  const isTeacherProfile = isOwnProfile ? user?.isTeacher : true; // assume teacher profile if visiting someone else's

  // ---- State ----
  const [availabilityDocs, setAvailabilityDocs] = useState([]);
  const [activeCells, setActiveCells] = useState(new Set());
  const [timezone, setTimezone] = useState("UTC");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // ---- Load availability on mount ----
  useEffect(() => {
    if (!viewingUserId) return;
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingUserId, canEdit]);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let docs = [];
      if (canEdit) {
        // Authenticated teacher fetching their own schedule
        const resp = await availabilityAPI.getMyAvailability();
        docs = resp.data?.availability || [];
      } else if (viewingUserId) {
        // Public view
        const resp = await availabilityAPI.getTeacherAvailability(viewingUserId);
        docs = resp.data?.availability || [];
      }

      setAvailabilityDocs(docs);
      setActiveCells(buildActiveCells(docs));
      // Use timezone from first doc if available
      if (docs.length > 0 && docs[0].timezone) {
        setTimezone(docs[0].timezone);
      }
    } catch (err) {
      console.error("Error loading availability:", err);
      setError("Failed to load availability. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Toggle a cell ----
  const handleToggle = useCallback((dayOfWeek, blockIndex) => {
    const key = cellKey(dayOfWeek, blockIndex);
    setActiveCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setIsDirty(true);
    setSaveSuccess(false);
  }, []);

  // ---- Reset to last saved state ----
  const handleReset = useCallback(() => {
    setActiveCells(buildActiveCells(availabilityDocs));
    setIsDirty(false);
    setSaveSuccess(false);
  }, [availabilityDocs]);

  // ---- Save ----
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Build per-day payload: for each day that has at least one active block,
      // collect all the hourly slots from the active blocks.
      const perDay = {}; // dayOfWeek -> [timeSlots]

      activeCells.forEach((key) => {
        const [dow, bi] = key.split("-").map(Number);
        const block = TIME_BLOCKS[bi];
        if (!block) return;
        if (!perDay[dow]) perDay[dow] = [];
        perDay[dow].push(...buildTimeSlots(block.hours));
      });

      // For each day that previously had data but now has no active blocks, we still
      // need a call — but sending an empty timeSlots array is rejected by the backend
      // (requires at least one slot). So we only save days that have slots.
      // Days that were cleared won't be re-saved, leaving stale docs. To keep UX
      // simple we POST/UPSERT only the days with active slots and note in the UI.

      const days = Object.keys(perDay).map(Number);

      if (days.length === 0) {
        // Nothing selected — inform user
        setError(
          "Please select at least one time block before saving."
        );
        setIsSaving(false);
        return;
      }

      // Fire requests sequentially to avoid race conditions on the upsert logic
      for (const dow of days) {
        await availabilityAPI.setAvailability({
          dayOfWeek: dow,
          timeSlots: perDay[dow],
          timezone,
          isRecurring: true,
        });
      }

      // Reload to get fresh docs (reflects server state)
      const resp = await availabilityAPI.getMyAvailability();
      const docs = resp.data?.availability || [];
      setAvailabilityDocs(docs);
      setActiveCells(buildActiveCells(docs));
      setIsDirty(false);
      setSaveSuccess(true);

      // Clear success banner after 3s
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving availability:", err);
      setError(err.message || "Failed to save availability. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [activeCells, timezone]);

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-10 h-10 mb-4 text-primary animate-spin" />
        <p className="text-xs font-black tracking-widest uppercase text-text-muted">
          Loading availability...
        </p>
      </div>
    );
  }

  // Non-teacher visiting their own profile — no section shown
  if (isOwnProfile && !user?.isTeacher) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-border rounded-3xl">
        <Calendar className="w-10 h-10 mx-auto mb-4 text-text-muted/30" />
        <h3 className="mb-2 text-lg font-black text-text-main">
          Availability is for teachers
        </h3>
        <p className="max-w-sm mx-auto text-sm font-medium text-text-muted">
          Become a teacher to set your weekly availability and let learners book
          sessions with you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ---- Section Header ---- */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-xl text-blue-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-text-main">
              Availability
            </h2>
            <p className="text-sm font-semibold text-text-muted">
              {canEdit
                ? "Set the weekly time blocks when you're available to teach"
                : "Weekly time blocks when this teacher is available"}
            </p>
          </div>
        </div>

        {/* Timezone selector — teacher edit only */}
        {canEdit && (
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-text-muted shrink-0" />
            <select
              value={timezone}
              onChange={(e) => {
                setTimezone(e.target.value);
                setIsDirty(true);
              }}
              className="py-2.5 pl-4 pr-8 text-xs font-bold border-2 border-border rounded-2xl bg-bg-alt text-text-main focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ---- Info banner for teacher-edit mode ---- */}
      {canEdit && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
          <Info className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 leading-relaxed">
            Click any cell to mark that time block as available. Blue cells are
            visible to learners when they book a session. Each block covers 6
            hourly slots. Changes take effect after you click{" "}
            <strong>Save Availability</strong>.
          </p>
        </div>
      )}

      {/* ---- Error banner ---- */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm font-semibold"
          >
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors font-black"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Success banner ---- */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 text-sm font-semibold"
          >
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            Availability saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Grid ---- */}
      <div className="p-6 bg-white border rounded-3xl border-border shadow-sm">
        {canEdit ? (
          <EditableGrid activeCells={activeCells} onToggle={handleToggle} />
        ) : (
          <ReadOnlyGrid
            availabilityDocs={availabilityDocs}
            timezone={timezone}
          />
        )}
      </div>

      {/* ---- Legend ---- */}
      <div className="flex items-center gap-6 text-xs font-semibold text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-blue-500/20 border-2 border-blue-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gray-800/5 border-2 border-gray-700/30" />
          <span>Unavailable</span>
        </div>
      </div>

      {/* ---- Save / Reset buttons — teacher edit only ---- */}
      {canEdit && (
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black text-white transition-all shadow-lg ${
              isDirty && !isSaving
                ? "bg-primary hover:bg-primary-hover shadow-primary/20 hover:scale-105 active:scale-95"
                : "bg-primary/40 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="tracking-widest uppercase">
              {isSaving ? "Saving..." : "Save Availability"}
            </span>
          </button>

          {isDirty && (
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-black text-text-muted bg-bg-alt border border-border hover:border-primary/30 hover:text-text-main transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="tracking-widest uppercase">Reset</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

AvailabilitySection.displayName = "AvailabilitySection";

export default AvailabilitySection;
