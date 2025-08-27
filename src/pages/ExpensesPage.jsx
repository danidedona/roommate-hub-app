import React from "react";
import { TrashIcon, EditIcon } from "../components/Icons.jsx";

const ExpensesPage = ({ expenses, handleExpenseModalOpen, deleteExpense }) => {
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
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <div className="flex-grow">
                    <div className="font-bold text-lg">{exp.description}</div>
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
                  </div>
                  <div className="flex items-center gap-2">
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
                  </div>
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
