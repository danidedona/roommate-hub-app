import React, { useState } from "react";
import { TrashIcon, EditIcon } from "../components/Icons.jsx";

const ExpensesPage = ({
  expenses,
  handleExpenseModalOpen,
  deleteExpense,
  addOrUpdateExpense, // ✅ use the Firestore updater from your hook
}) => {
  const [noteEditingId, setNoteEditingId] = useState(null);
  const [tempNote, setTempNote] = useState("");

  // Filter out invalid expenses
  const validExpenses = expenses.filter(
    (exp) =>
      exp && (exp.totalAmount != null || (exp.items && exp.items.length > 0))
  );

  // Compute totalAmount if missing but items exist
  validExpenses.forEach((exp) => {
    if (!exp.totalAmount && exp.items) {
      exp.totalAmount = exp.items.reduce(
        (sum, item) => sum + (parseFloat(item.cost) || 0),
        0
      );
    }
  });

  // Function to get participants string
  const getParticipantsString = (exp) => {
    if (exp.splitType === "Itemized" && exp.items) {
      const allParticipants = new Set();
      exp.items.forEach((item) => {
        item.participants.forEach((p) => allParticipants.add(p));
      });
      return Array.from(allParticipants).join(", ");
    } else if (exp.participants) {
      return exp.participants.join(", ");
    }
    return "N/A";
  };

  const handleNoteSave = async (expId) => {
    try {
      // find the existing expense
      const exp = expenses.find((e) => e.id === expId);
      if (!exp) return;

      // update in Firestore
      await addOrUpdateExpense({ ...exp, notes: tempNote }, expId);

      // reset local state
      setNoteEditingId(null);
      setTempNote("");
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Expense Tracker</h2>

      <button
        onClick={() => handleExpenseModalOpen({})}
        className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md mb-6"
      >
        Add New Expense
      </button>

      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Expense History</h3>
        <ul className="space-y-3">
          {validExpenses.length > 0 ? (
            validExpenses
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((exp) => (
                <li
                  key={exp.id}
                  className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <div className="flex-grow">
                    <div className="font-bold text-lg flex items-center gap-1">
                      {exp.description}
                      {exp.notes && (
                        <span title="Has note" className="text-yellow-500">
                          📌
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Paid by {exp.paidBy} on{" "}
                      {exp.date
                        ? new Date(exp.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "No date"}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Split: {exp.splitType}, Total: $
                      {exp.totalAmount.toFixed(2)}, Participants:{" "}
                      {getParticipantsString(exp)}
                    </div>
                    {/* Always show notes if they exist */}
                    {exp.notes && noteEditingId !== exp.id && (
                      <div className="mt-1 text-sm text-purple-700 dark:text-purple-300 italic">
                        {exp.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => handleExpenseModalOpen(exp)}
                      className="text-purple-500 hover:text-purple-600 transition-colors"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setNoteEditingId(exp.id); // ✅ fixed (was pay.id)
                        setTempNote(exp.notes || "");
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      {exp.notes ? "Edit Note" : "Add Note"}
                    </button>
                  </div>

                  {/* Inline note editor */}
                  {noteEditingId === exp.id && (
                    <div className="mt-2 w-full">
                      <textarea
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-900"
                        rows="2"
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleNoteSave(exp.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setNoteEditingId(null)}
                          className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No expenses added yet.
            </p>
          )}
        </ul>
      </div>
    </section>
  );
};

export default ExpensesPage;
