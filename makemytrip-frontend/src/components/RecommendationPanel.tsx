import { HelpCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

const RECOMMENDATIONS = [
  {
    title: "Beach escape",
    destination: "Goa",
    reason: "You often view leisure destinations and hotel stays with resort-style amenities.",
  },
  {
    title: "Business saver",
    destination: "Mumbai",
    reason: "Your recent bookings include city routes and shorter stays, so this route may fit your pattern.",
  },
  {
    title: "Hill getaway",
    destination: "Shimla",
    reason: "Travelers with similar searches also explored scenic weekend destinations.",
  },
];

export default function RecommendationPanel() {
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  return (
    <section className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Personalized Recommendations</h3>
      <p className="mt-1 text-sm text-gray-500">Smart suggestions based on booking history and similar travellers.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RECOMMENDATIONS.map((item) => (
          <article key={item.title} className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{item.title}</p>
            <h4 className="mt-1 text-lg font-bold text-gray-900">Try {item.destination}</h4>
            <p className="mt-3 flex gap-2 text-sm text-gray-500" title={item.reason}>
              <HelpCircle size={16} className="mt-0.5 text-blue-600" />
              Why this recommendation?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFeedback({ ...feedback, [item.title]: "helpful" })}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-blue-600"
                aria-label="Helpful recommendation"
              >
                <ThumbsUp size={16} />
              </button>
              <button
                onClick={() => setFeedback({ ...feedback, [item.title]: "irrelevant" })}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-red-600"
                aria-label="Irrelevant recommendation"
              >
                <ThumbsDown size={16} />
              </button>
              {feedback[item.title] && (
                <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                  Marked {feedback[item.title]}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
