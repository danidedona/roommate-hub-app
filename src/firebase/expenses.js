import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

export const addExpense = async (expenseData, editingId = null) => {
  if (!db) return;
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

export const deleteExpense = async (id) => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, "expenses", id));
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
};

export const handleSaveExpense = async (
  onClose,
  expenseDescription,
  expenseDate,
  expensePaidBy,
  expenseSplitType,
  selectedParticipants,
  percentages,
  expenseItems,
  amount,
  setExpenseDescription,
  setExpenseDate,
  setExpensePaidBy,
  setExpenseSplitType,
  setSelectedParticipants,
  setExpenseItems,
  setPercentages,
  setAmount,
  setNewNonRoommate,
  editingId = null
) => {
  // Basic checks
  if (!expenseDescription.trim()) {
    alert("Please enter an expense description.");
    return;
  }
  if (!expensePaidBy) {
    alert("Please select who paid.");
    return;
  }
  if (!expenseDate) {
    alert("Please select a date.");
    return;
  }

  // Split type validation
  let totalAmount = 0;

  if (expenseSplitType === "Equally" || expenseSplitType === "Percentages") {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!selectedParticipants || selectedParticipants.length === 0) {
      alert("Please select at least one participant.");
      return;
    }
    totalAmount = parsedAmount;

    if (expenseSplitType === "Percentages") {
      const totalPercentage = Object.values(percentages).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      if (totalPercentage !== 100) {
        alert("Percentages must sum to 100%.");
        return;
      }
    }
  } else if (expenseSplitType === "Itemized") {
    if (!expenseItems || expenseItems.length === 0) {
      alert("Please add at least one item.");
      return;
    }
    // Validate each item
    for (const item of expenseItems) {
      if (!item.name.trim()) {
        alert("Each item must have a name.");
        return;
      }
      const itemCost = parseFloat(item.cost);
      if (!itemCost || itemCost <= 0) {
        alert(`Item "${item.name}" must have a valid cost.`);
        return;
      }
      if (!item.participants || item.participants.length === 0) {
        alert(`Item "${item.name}" must have at least one participant.`);
        return;
      }
      totalAmount += itemCost;
    }
  }

  // Build expense data
  const expenseData = {
    description: expenseDescription,
    date: expenseDate,
    paidBy: expensePaidBy,
    splitType: expenseSplitType,
    participants:
      expenseSplitType === "Itemized"
        ? [] // optional, itemized stores participants per item
        : selectedParticipants,
    percentages: expenseSplitType === "Percentages" ? percentages : {},
    items: expenseSplitType === "Itemized" ? expenseItems : [],
    totalAmount,
    notes: expenseNotes || "",
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, "expenses", editingId), expenseData);
    } else {
      await addDoc(collection(db, "expenses"), expenseData);
    }

    // Reset modal state
    setExpenseDescription("");
    setExpenseDate("");
    setExpensePaidBy("");
    setExpenseSplitType("Equally");
    setSelectedParticipants([]);
    setExpenseItems([]);
    setPercentages({});
    setAmount("");
    setNewNonRoommate("");

    // Close modal
    onClose();
  } catch (e) {
    console.error("Error saving expense:", e);
    alert("Something went wrong while saving the expense.");
  }
};
