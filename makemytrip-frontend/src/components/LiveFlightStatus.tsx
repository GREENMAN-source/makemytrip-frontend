import { useEffect, useMemo, useState } from "react";
import { Bell, Clock, Plane } from "lucide-react";

const STATUSES = [
  {
    label: "On Time",
    reason: "Weather is clear and aircraft turnaround is complete.",
    departureShift: "No change",
    arrival: "Estimated arrival unchanged",
  },
  {
    label: "Boarding",
    reason: "Gate is open for priority and group boarding.",
    departureShift: "Boarding now",
    arrival: "Arrival remains on schedule",
  },
  {
    label: "Delayed by 1h",
    reason: "Late inbound aircraft and runway traffic at the origin airport.",
    departureShift: "+60 minutes",
    arrival: "Estimated arrival revised by 55 minutes",
  },
];

export default function LiveFlightStatus({
  flightName = "Tracked Flight",
  compact = false,
}: {
  flightName?: string;
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const trackedFlights = useMemo(() => [flightName, "AI-302", "MT-118"].filter(Boolean), [flightName]);
  const status = STATUSES[index % STATUSES.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % STATUSES.length;
        setNotifications((items) => [
          `${flightName}: ${STATUSES[next].label}. ${STATUSES[next].arrival}`,
          ...items,
        ].slice(0, 3));
        return next;
      });
    }, 7000);

    return () => window.clearInterval(timer);
  }, [flightName]);

  return (
    <section className={`rounded-xl bg-white p-4 shadow-lg sm:p-6 ${compact ? "" : "mt-6"}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
            <Plane size={20} className="text-blue-600" />
            Live Flight Status
          </h3>
          <p className="mt-1 text-sm text-gray-500">Mock API simulates professional real-time flight tracking.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{status.label}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trackedFlights.map((flight, flightIndex) => (
          <div key={flight} className="rounded-lg bg-gray-50 p-3">
            <p className="font-bold text-gray-900">{flight}</p>
            <p className="mt-1 text-sm text-gray-500">{STATUSES[(index + flightIndex) % STATUSES.length].label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <Clock size={18} />
          {status.reason} Revised schedule: {status.departureShift}.
        </p>
        <p className="flex gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Bell size={18} />
          {status.arrival}
        </p>
      </div>

      {notifications.length > 0 && (
        <div className="mt-4 space-y-2">
          {notifications.map((message, messageIndex) => (
            <p key={`${message}-${messageIndex}`} className="rounded-lg border border-gray-200 p-3 text-sm text-gray-600">
              {message}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
