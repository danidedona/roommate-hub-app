import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, XIcon } from "./Icons.jsx";
import Modal from "./Modal.jsx";
import { handleSaveExpense } from "../firebase/expenses.js";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig.js";

const ExpenseModal = ({
  show,
  onClose,
  editingExpenseId,
  roommates,
  expensePaidBy,
  setExpensePaidBy,
  expenseSplitType,
  setExpenseSplitType,
  expenseDate,
  setExpenseDate,
  expenseDescription,
  setExpenseDescription,
  expenseItems,
  setExpenseItems,
  percentages,
  setPercentages,
  selectedParticipants,
  setSelectedParticipants,
  newNonRoommate,
  setNewNonRoommate,
  expenseModalErrors,
}) => {
  const [amount, setAmount] = useState("");

  const capitalizeName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Pre-fill "Paid By" with current user
  useEffect(() => {
    if (!editingExpenseId && show) {
      const currentEmail = auth.currentUser?.email;
      if (currentEmail && roommates.length > 0) {
        const me = roommates.find(
          (r) => r.email.toLowerCase() === currentEmail.toLowerCase()
        );
        if (me) setExpensePaidBy(me.name);
      }
    }
  }, [show, roommates, editingExpenseId, setExpensePaidBy]);

  // Fetch expense if editing
  useEffect(() => {
    const fetchExpense = async () => {
      if (!editingExpenseId) return;
      const docRef = doc(db, "expenses", editingExpenseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setExpenseDescription(data.description || "");
        setExpenseDate(data.date || "");
        setExpensePaidBy(data.paidBy || "");
        setExpenseSplitType(data.splitType || "Equally");
        setSelectedParticipants(data.participants || []);
        setPercentages(data.percentages || {});
        setExpenseItems(data.items || []);
        setAmount(data.totalAmount || "");
      }
    };
    fetchExpense();
  }, [
    editingExpenseId,
    setExpenseDescription,
    setExpenseDate,
    setExpensePaidBy,
    setExpenseSplitType,
    setSelectedParticipants,
    setPercentages,
    setExpenseItems,
    setAmount,
  ]);

  const handleParticipantChange = (name) => {
    setSelectedParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const addNonRoommate = () => {
    const name = capitalizeName(newNonRoommate.trim());
    if (name && !selectedParticipants.includes(name)) {
      setSelectedParticipants((prev) => [...prev, name]);
      setNewNonRoommate("");
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...expenseItems];
    if (field === "cost") newItems[index][field] = parseFloat(value) || 0;
    else newItems[index][field] = value;
    setExpenseItems(newItems);
  };

  const handleItemParticipantChange = (itemIndex, name) => {
    const capitalizedName = capitalizeName(name);
    handleItemChange(
      itemIndex,
      "participants",
      expenseItems[itemIndex].participants.includes(capitalizedName)
        ? expenseItems[itemIndex].participants.filter(
            (p) => p !== capitalizedName
          )
        : [...expenseItems[itemIndex].participants, capitalizedName]
    );
  };

  const participantButtons = (names) =>
    names.map((name) => (
      <button
        key={name}
        onClick={() => handleParticipantChange(name)}
        className={`py-2 px-4 rounded-full text-sm font-medium transition-colors relative group ${
          selectedParticipants.includes(name)
            ? "bg-purple-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        {name}
        {!roommates.some((rm) => rm.name === name) && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setSelectedParticipants((prev) => prev.filter((p) => p !== name));
            }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
          >
            <XIcon className="w-3 h-3" />
          </span>
        )}
      </button>
    ));

  return (
    <Modal show={show} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">
        {editingExpenseId ? "Edit Expense" : "Add a New Expense"}
      </h2>

      <div className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Expense Description
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
            placeholder="e.g., Weekend Groceries"
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
          />
          {expenseModalErrors.general && (
            <p className="text-red-500 text-sm mt-1">
              {expenseModalErrors.general}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
        </div>

        {/* Who Paid */}
        <div>
          <label className="block text-sm font-medium mb-1">Who Paid?</label>
          <div className="flex flex-wrap gap-2">
            {roommates.map((rm) => (
              <button
                key={rm.id}
                onClick={() => setExpensePaidBy(rm.name)}
                className={`py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  expensePaidBy === rm.name
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {rm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Split Type */}
        <div>
          <label className="block text-sm font-medium mb-1">How to Split</label>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {["Equally", "Percentages", "Itemized"].map((type) => (
              <button
                key={type}
                onClick={() => setExpenseSplitType(type)}
                className={`flex-1 p-2 rounded-lg transition-colors ${
                  expenseSplitType === type
                    ? "bg-purple-500 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {type === "Equally"
                  ? "Equally Split"
                  : type === "Percentages"
                  ? "Percentages"
                  : "Itemized List"}
              </button>
            ))}
          </div>
        </div>

        {/* Equally or Percentages */}
        {(expenseSplitType === "Equally" ||
          expenseSplitType === "Percentages") && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter total cost"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value === "" ? "" : parseFloat(e.target.value)
                  )
                }
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
              />
            </div>

            <label className="block text-sm font-medium mb-1">
              Who Was Involved?
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {participantButtons([
                ...roommates.map((rm) => rm.name),
                ...selectedParticipants.filter(
                  (p) => !roommates.some((rm) => rm.name === p)
                ),
              ])}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-grow p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                placeholder="Add non-roommate"
                value={newNonRoommate}
                onChange={(e) => setNewNonRoommate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNonRoommate()}
              />
              <button
                onClick={addNonRoommate}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>

            {expenseSplitType === "Percentages" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {selectedParticipants.map((name) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">
                      {name} (%)
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                      value={percentages[name] || ""}
                      onChange={(e) =>
                        setPercentages({
                          ...percentages,
                          [name]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
                {expenseModalErrors.percentages && (
                  <p className="text-red-500 text-sm mt-1 col-span-full">
                    {expenseModalErrors.percentages}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Itemized List */}
        {expenseSplitType === "Itemized" && (
          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Itemized List</h3>
            {expenseItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 mb-4 p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-grow p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="w-24 p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                    placeholder="Cost"
                    value={item.cost}
                    onChange={(e) =>
                      handleItemChange(index, "cost", e.target.value)
                    }
                  />
                  <button
                    onClick={() =>
                      setExpenseItems(
                        expenseItems.filter((_, i) => i !== index)
                      )
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <label className="block text-sm font-medium mb-1">
                  Associated with:
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {roommates.map((rm) => (
                    <button
                      key={rm.id}
                      onClick={() =>
                        handleItemParticipantChange(index, rm.name)
                      }
                      className={`py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                        item.participants.includes(rm.name)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {rm.name}
                    </button>
                  ))}
                  {selectedParticipants
                    .filter((p) => !roommates.some((rm) => rm.name === p))
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => handleItemParticipantChange(index, p)}
                        className={`py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                          item.participants.includes(p)
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {p}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParticipants((prev) =>
                              prev.filter((sp) => sp !== p)
                            );
                            handleItemChange(
                              index,
                              "participants",
                              item.participants.filter((part) => part !== p)
                            );
                          }}
                          className="ml-1 text-red-500 cursor-pointer"
                        >
                          &times;
                        </span>
                      </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    className="flex-grow p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                    placeholder="Add non-roommate"
                    value={newNonRoommate}
                    onChange={(e) => setNewNonRoommate(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addNonRoommate();
                        handleItemParticipantChange(
                          index,
                          newNonRoommate.trim()
                        );
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      addNonRoommate();
                      handleItemParticipantChange(index, newNonRoommate.trim());
                    }}
                    className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                  >
                    <PlusIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setExpenseItems([
                  ...expenseItems,
                  { name: "", cost: "", participants: [] },
                ])
              }
              className="w-full mt-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-semibold"
            >
              Add another item
            </button>
          </div>
        )}
      </div>

      {/* Save / Update Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() =>
            handleSaveExpense(
              onClose,
              expenseDescription,
              expenseDate,
              expensePaidBy,
              expenseSplitType,
              selectedParticipants,
              percentages,
              expenseItems,
              parseFloat(amount) || 0,
              setExpenseDescription,
              setExpenseDate,
              setExpensePaidBy,
              setExpenseSplitType,
              setSelectedParticipants,
              setExpenseItems,
              setPercentages,
              setAmount,
              setNewNonRoommate,
              editingExpenseId
            )
          }
          className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md"
        >
          {editingExpenseId ? "Update Expense" : "Save Expense"}
        </button>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
