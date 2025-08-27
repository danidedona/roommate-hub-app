import { useFirestoreCollection } from "./useFirestoreCollection";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useMemo } from "react";

export const useExpenses = (roommates = [], payments = []) => {
  const expenses = useFirestoreCollection(db, "expenses");

  const addOrUpdateExpense = async (expenseData, editingId = null) => {
    try {
      if (editingId) {
        await updateDoc(doc(db, "expenses", editingId), expenseData);
      } else {
        await addDoc(collection(db, "expenses"), expenseData);
      }
    } catch (err) {
      console.error("Error adding/updating expense:", err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await deleteDoc(doc(db, "expenses", id));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const expenseSummary = useMemo(() => {
    const summary = {};
    const allPeople = [
      ...new Set([
        ...roommates.map((r) => r.name.toLowerCase()),
        ...expenses.flatMap((e) =>
          (e.participants || []).map((p) => p.toLowerCase())
        ),
        ...expenses.flatMap((e) => (e.paidBy ? [e.paidBy.toLowerCase()] : [])),
        ...(payments?.flatMap((p) =>
          [p.from, p.to].filter(Boolean).map((n) => n.toLowerCase())
        ) || []),
      ]),
    ];

    allPeople.forEach((name) => (summary[name] = 0));

    // 1️⃣ Build initial pairwise debts from expenses
    const debts = {};
    allPeople.forEach((p) => (debts[p] = {}));
    allPeople.forEach((p1) =>
      allPeople.forEach((p2) => {
        if (p1 !== p2) debts[p1][p2] = 0;
      })
    );

    expenses.forEach((exp) => {
      const total = exp.totalAmount || 0;
      const participants = (exp.participants || []).map((p) => p.toLowerCase());
      const paidBy = (exp.paidBy || "").toLowerCase();

      if (!paidBy || participants.length === 0) return;

      const splits = {};
      if (exp.splitType === "Equally") {
        const perPerson = total / participants.length;
        participants.forEach((p) => (splits[p] = perPerson));
      } else if (exp.splitType === "Percentages") {
        participants.forEach(
          (p) => (splits[p] = ((exp.percentages?.[p] ?? 0) * total) / 100)
        );
      } else if (exp.splitType === "Itemized") {
        (exp.items || []).forEach((item) => {
          const cost = parseFloat(item.cost) || 0;
          const itemParticipants = (item.participants || []).map((p) =>
            p.toLowerCase()
          );
          const perPerson = cost / (itemParticipants.length || 1);
          itemParticipants.forEach((p) => {
            splits[p] = (splits[p] || 0) + perPerson;
          });
        });
      }

      Object.entries(splits).forEach(([p, amount]) => {
        if (p !== paidBy) debts[p][paidBy] += amount; // p owes paidBy
      });
    });

    // 2️⃣ Apply payments (subtract from debts)
    payments?.forEach((pay) => {
      if (!pay.from || !pay.to || !pay.amount) return;
      const from = pay.from.toLowerCase();
      const to = pay.to.toLowerCase();
      if (debts[from] && debts[from][to] != null) {
        debts[from][to] -= pay.amount;
        if (debts[from][to] < 0) {
          debts[to][from] += -debts[from][to];
          debts[from][to] = 0;
        }
      }
    });

    // 3️⃣ Simplify debts pairwise into transactions
    const transactions = [];
    allPeople.forEach((p1) => {
      allPeople.forEach((p2) => {
        if (p1 === p2) return;
        const net = debts[p1][p2] - debts[p2][p1];
        if (net > 0) {
          transactions.push({ from: p1, to: p2, amount: net });
        }
      });
    });

    // 4️⃣ Compute summary balances
    transactions.forEach((t) => {
      summary[t.to] += t.amount;
      summary[t.from] -= t.amount;
    });

    return {
      total: expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0),
      summary,
      transactions,
    };
  }, [expenses, payments, roommates]);

  return { expenses, expenseSummary, addOrUpdateExpense, deleteExpense };
};
