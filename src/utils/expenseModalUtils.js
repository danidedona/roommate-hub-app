export const openExpenseModal = ({
  expense = null,
  setEditingExpenseId,
  setExpenseDescription,
  setExpensePaidBy,
  setExpenseSplitType,
  setExpenseItems,
  setPercentages,
  setSelectedParticipants,
  setExpenseDate,
  setExpenseModalErrors,
  setShowExpenseModal,
}) => {
  if (expense && expense.id) {
    setEditingExpenseId(expense.id);
    setExpenseDescription(expense.description || "");
    setExpensePaidBy(expense.paidBy || "");
    setExpenseSplitType(expense.splitType || "Equally");
    setExpenseItems(
      expense.items || [{ name: "", cost: "", participants: [] }]
    );
    setPercentages(expense.percentages || {});
    setSelectedParticipants(
      Object.keys(expense.splits || {}).filter(
        (name) => (expense.splits || {})[name] > 0
      )
    );
    setExpenseDate(
      expense.timestamp
        ? new Date(expense.timestamp).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setExpenseModalErrors({});
  } else {
    setEditingExpenseId(null);
    setExpenseDescription("");
    setExpensePaidBy("");
    setExpenseSplitType("Equally");
    setExpenseItems([{ name: "", cost: "", participants: [] }]);
    setPercentages({});
    setSelectedParticipants([]);
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setExpenseModalErrors({});
  }
  setShowExpenseModal(true);
};
