import { useState, useEffect } from "react";
import React from "react";

const PaymentsPage = ({
  payments,
  expenses,
  newPayment,
  setNewPayment,
  addPayment,
  deletePayment,
  updatePayment,
  roommates,
}) => {
  const [editingId, setEditingId] = useState(null);

  // Set default date to today's date on component mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setNewPayment((prevPayment) => ({ ...prevPayment, date: today }));
  }, [setNewPayment]);

  const capitalizeName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleFromChange = (e) => {
    setNewPayment({
      ...newPayment,
      from: capitalizeName(e.target.value),
    });
  };

  const handleToChange = (e) => {
    setNewPayment({
      ...newPayment,
      to: capitalizeName(e.target.value),
    });
  };

  const handleSubmit = () => {
    if (editingId) {
      updatePayment(editingId, newPayment);
      setEditingId(null);
    } else {
      addPayment(newPayment);
    }
    const today = new Date().toISOString().split("T")[0];
    setNewPayment({
      from: "",
      to: "",
      amount: "",
      date: today,
      notes: "",
    });
  };

  const handleEdit = (pay) => {
    setNewPayment({
      from: pay.from,
      to: pay.to,
      amount: pay.amount,
      date: pay.date,
      notes: pay.notes || "",
    });
    setEditingId(pay.id);
  };

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

  // Compute transactions for "Who Owes Whom"
  const computeNetBalances = (expenses, payments) => {
    const balances = {}; // { "Alice->Bob": amount }

    const addToBalance = (from, to, amount) => {
      const key = `${from}->${to}`;
      const reverseKey = `${to}->${from}`;

      if (balances[reverseKey]) {
        // offset against reverse
        if (balances[reverseKey] > amount) {
          balances[reverseKey] -= amount;
        } else if (balances[reverseKey] < amount) {
          balances[key] = amount - balances[reverseKey];
          delete balances[reverseKey];
        } else {
          // equal amounts cancel
          delete balances[reverseKey];
        }
      } else {
        balances[key] = (balances[key] || 0) + amount;
      }
    };

    // Step 1: Add expenses
    expenses.forEach((exp) => {
      if (!exp.paidBy) return;

      if (exp.splitType === "Itemized" && exp.items?.length) {
        exp.items.forEach((item) => {
          const share = parseFloat(item.cost) / item.participants.length;
          item.participants.forEach((p) => {
            if (p !== exp.paidBy) addToBalance(p, exp.paidBy, share);
          });
        });
      } else if (exp.splitType === "Percentages") {
        Object.entries(exp.percentages || {}).forEach(([participant, pct]) => {
          if (participant !== exp.paidBy) {
            const amt = (parseFloat(pct) / 100) * exp.totalAmount;
            addToBalance(participant, exp.paidBy, amt);
          }
        });
      } else {
        // Equal split
        const share = exp.totalAmount / exp.participants.length;
        exp.participants.forEach((p) => {
          if (p !== exp.paidBy) addToBalance(p, exp.paidBy, share);
        });
      }
    });

    // Step 2: Subtract payments
    payments.forEach((pay) => {
      if (!pay.from || !pay.to || !pay.amount) return;
      addToBalance(pay.to, pay.from, pay.amount); // reverse because it's a payment
    });

    // Convert balances map to array
    return Object.entries(balances).map(([key, amount]) => {
      const [from, to] = key.split("->");
      return { from, to, amount };
    });
  };

  // Filter out invalid payments
  const validPayments = payments.filter(
    (pay) => pay && typeof pay.amount === "number"
  );

  const transactions = computeNetBalances(validExpenses, validPayments);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Payment History</h2>
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Who Owes Whom</h3>
        <ul className="space-y-2">
          {transactions.length > 0 ? (
            transactions.map((t, index) => (
              <li
                key={index}
                className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
              >
                <span className="font-bold">{t.from}</span> owes{" "}
                <span className="font-bold">{t.to}</span>{" "}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  ${t.amount.toFixed(2)}
                </span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 dark:text-gray-400">
              Everything is settled!
            </li>
          )}
        </ul>
      </div>
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Add a New Payment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
            placeholder="From (e.g., Alex)"
            value={newPayment.from}
            onChange={handleFromChange}
            list="payer-names"
          />
          <datalist id="payer-names">
            {roommates.map((r) => (
              <option key={r.name} value={capitalizeName(r.name)} />
            ))}
          </datalist>
          <input
            type="text"
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
            placeholder="To (e.g., Bob)"
            value={newPayment.to}
            onChange={handleToChange}
            list="payer-names"
          />
          <input
            type="number"
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
            placeholder="Amount ($)"
            value={newPayment.amount}
            onChange={(e) =>
              setNewPayment({ ...newPayment, amount: e.target.value })
            }
          />
          <input
            type="date"
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
            value={newPayment.date}
            onChange={(e) =>
              setNewPayment({ ...newPayment, date: e.target.value })
            }
          />
        </div>
        <input
          type="text"
          className="p-3 mt-4 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
          placeholder="Notes (e.g., for last month's rent)"
          value={newPayment.notes}
          onChange={(e) =>
            setNewPayment({ ...newPayment, notes: e.target.value })
          }
        />
        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md"
        >
          {editingId ? "Update Payment" : "Log Payment"}
        </button>
      </div>
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Recent Payments</h3>
        <ul className="space-y-3">
          {validPayments.map((pay) => (
            <li
              key={pay.id}
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 flex justify-between items-center"
            >
              <div>
                <span className="text-green-500">${pay.amount.toFixed(2)}</span>{" "}
                paid by {pay.from} to {pay.to}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(pay)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => deletePayment(pay.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(pay.date).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {validPayments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No payments logged yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default PaymentsPage;
