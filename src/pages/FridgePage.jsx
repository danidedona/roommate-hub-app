// FridgePage.jsx
import React, { useState } from "react";
import { TrashIcon, EditIcon } from "../components/Icons";
import { useFridgeInventory } from "../firebase/useFridgeInventory";

const FridgePage = ({ roommates }) => {
  const {
    fridgeInventory,
    filteredFridgeInventory,
    newFridgeItem,
    setNewFridgeItem,
    addFridgeItem,
    updateFridgeItem,
    deleteFridgeItem,
    toggleFridgeOwner,
    fridgeFilter,
    toggleFilterOwner,
    toggleFilterType,
    setFridgeFilter,
  } = useFridgeInventory();

  const [editingItem, setEditingItem] = useState(null);
  const itemTypes = ["Fridge", "Freezer", "Pantry", "Personal", "Spices"];

  const isExpired = (expires) => {
    if (!expires) return false;
    const today = new Date();
    const expDate = new Date(expires);
    return expDate < today;
  };

  const isNearExpired = (expires) => {
    if (!expires) return false;
    const today = new Date();
    const expDate = new Date(expires);
    const diffDays = (expDate - today) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 5;
  };

  const warningItems = fridgeInventory.filter((item) =>
    isNearExpired(item.expires)
  );

  const setFilterStatus = (status) => {
    setFridgeFilter((prev) => ({ ...prev, status }));
  };

  // Helper function to calculate expiration date
  const calculateExpires = (packedOn, weeks, days) => {
    if (!packedOn || (!weeks && !days)) return ""; // no expiration
    return new Date(
      new Date(packedOn).getTime() +
        (weeks || 0) * 7 * 24 * 60 * 60 * 1000 +
        (days || 0) * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg">
      {/* Near-expired warning */}
      {warningItems.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded-lg">
          ⚠️ Heads up! {warningItems.length} item
          {warningItems.length > 1 ? "s are" : " is"} about to expire in 5 days.
        </div>
      )}

      <h3 className="text-lg font-semibold mb-3">Current Inventory</h3>

      {/* Add/Edit Item Section */}
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {editingItem ? "Edit Item" : "Add a New Item"}
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <input
            type="text"
            placeholder="Item Name"
            className="w-full p-3 rounded-lg border bg-white dark:bg-gray-900"
            value={editingItem ? editingItem.name : newFridgeItem.name}
            onChange={(e) =>
              editingItem
                ? setEditingItem({ ...editingItem, name: e.target.value })
                : setNewFridgeItem({ ...newFridgeItem, name: e.target.value })
            }
          />

          {/* Owner buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-sm">Who owns it?</span>
            <button
              onClick={() =>
                editingItem
                  ? setEditingItem({
                      ...editingItem,
                      owner: editingItem.owner.includes("Shared")
                        ? editingItem.owner.filter((o) => o !== "Shared")
                        : [...editingItem.owner, "Shared"],
                    })
                  : toggleFridgeOwner("Shared")
              }
              className={`py-2 px-4 rounded-full text-sm ${
                (
                  editingItem
                    ? editingItem.owner.includes("Shared")
                    : newFridgeItem.owner.includes("Shared")
                )
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              Shared
            </button>
            {roommates.map((rm) => (
              <button
                key={rm.id}
                onClick={() =>
                  editingItem
                    ? setEditingItem({
                        ...editingItem,
                        owner: editingItem.owner.includes(rm.name)
                          ? editingItem.owner.filter((o) => o !== rm.name)
                          : [...editingItem.owner, rm.name],
                      })
                    : toggleFridgeOwner(rm.name)
                }
                className={`py-2 px-4 rounded-full text-sm ${
                  (
                    editingItem
                      ? editingItem.owner.includes(rm.name)
                      : newFridgeItem.owner.includes(rm.name)
                  )
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {rm.name}
              </button>
            ))}
          </div>

          {/* Type buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="font-medium text-sm">Type:</span>
            {itemTypes.map((t) => (
              <button
                key={t}
                onClick={() =>
                  editingItem
                    ? setEditingItem({ ...editingItem, type: t })
                    : setNewFridgeItem({ ...newFridgeItem, type: t })
                }
                className={`py-2 px-4 rounded-full text-sm ${
                  (editingItem ? editingItem.type : newFridgeItem.type) === t
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Packed On */}
          <label className="text-sm font-medium">Packed On:</label>
          <div className="relative">
            <input
              type="date"
              className="w-full p-3 rounded-lg border bg-white dark:bg-gray-900"
              value={
                editingItem
                  ? editingItem.packedOn || ""
                  : newFridgeItem.packedOn || ""
              }
              onChange={(e) => {
                const packedOn = e.target.value;
                if (editingItem) {
                  setEditingItem((prev) => ({
                    ...prev,
                    packedOn,
                    // clear shelf life and expires if packedOn is empty
                    expires: calculateExpires(
                      packedOn,
                      prev.shelfLifeWeeks,
                      prev.shelfLifeDays
                    ),
                    shelfLifeWeeks: packedOn
                      ? prev.shelfLifeWeeks ?? null
                      : null,
                    shelfLifeDays: packedOn ? prev.shelfLifeDays ?? null : null,
                  }));
                } else {
                  setNewFridgeItem((prev) => ({
                    ...prev,
                    packedOn,
                    expires: calculateExpires(
                      packedOn,
                      prev.shelfLifeWeeks,
                      prev.shelfLifeDays
                    ),
                    shelfLifeWeeks: packedOn
                      ? prev.shelfLifeWeeks ?? null
                      : null,
                    shelfLifeDays: packedOn ? prev.shelfLifeDays ?? null : null,
                  }));
                }
              }}
            />
            {(editingItem ? editingItem.packedOn : newFridgeItem.packedOn) && (
              <button
                type="button"
                onClick={() => {
                  if (editingItem) {
                    setEditingItem({
                      ...editingItem,
                      packedOn: "",
                      expires: "",
                      shelfLifeWeeks: "",
                      shelfLifeDays: "",
                    });
                  } else {
                    setNewFridgeItem({
                      ...newFridgeItem,
                      packedOn: "",
                      expires: "",
                      shelfLifeWeeks: "",
                      shelfLifeDays: "",
                    });
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Show only if Packed On is populated */}
          {(editingItem?.packedOn || newFridgeItem.packedOn) && (
            <>
              {/* Shelf life in weeks */}
              <label className="text-sm font-medium">Expires in (weeks):</label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                className="w-full p-3 rounded-lg border bg-white dark:bg-gray-900"
                value={
                  editingItem
                    ? editingItem.shelfLifeWeeks || ""
                    : newFridgeItem.shelfLifeWeeks || ""
                }
                onChange={(e) => {
                  const weeks =
                    e.target.value === "" ? null : Number(e.target.value);
                  if (editingItem) {
                    setEditingItem((prev) => ({
                      ...prev,
                      shelfLifeWeeks: weeks,
                      expires: calculateExpires(
                        prev.packedOn,
                        weeks,
                        prev.shelfLifeDays
                      ),
                    }));
                  } else {
                    setNewFridgeItem((prev) => ({
                      ...prev,
                      shelfLifeWeeks: weeks,
                      expires: calculateExpires(
                        prev.packedOn,
                        weeks,
                        prev.shelfLifeDays
                      ),
                    }));
                  }
                }}
              />

              {/* Shelf life in days */}
              <label className="text-sm font-medium">Expires in (days):</label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                className="w-full p-3 rounded-lg border bg-white dark:bg-gray-900"
                value={
                  editingItem
                    ? editingItem.shelfLifeDays || ""
                    : newFridgeItem.shelfLifeDays || ""
                }
                onChange={(e) => {
                  const days =
                    e.target.value === "" ? null : Number(e.target.value);
                  if (editingItem) {
                    setEditingItem((prev) => ({
                      ...prev,
                      shelfLifeDays: days,
                      expires: calculateExpires(
                        prev.packedOn,
                        prev.shelfLifeWeeks,
                        days
                      ),
                    }));
                  } else {
                    setNewFridgeItem((prev) => ({
                      ...prev,
                      shelfLifeDays: days,
                      expires: calculateExpires(
                        prev.packedOn,
                        prev.shelfLifeWeeks,
                        days
                      ),
                    }));
                  }
                }}
              />
            </>
          )}

          {/* Expires */}
          <label className="text-sm font-medium">Expires:</label>
          <div className="relative">
            <input
              type="date"
              className="w-full p-3 rounded-lg border bg-white dark:bg-gray-900"
              value={
                editingItem
                  ? editingItem.expires || ""
                  : newFridgeItem.expires || ""
              }
              onChange={(e) =>
                editingItem
                  ? setEditingItem({ ...editingItem, expires: e.target.value })
                  : setNewFridgeItem({
                      ...newFridgeItem,
                      expires: e.target.value,
                    })
              }
            />
            {(editingItem ? editingItem.expires : newFridgeItem.expires) && (
              <button
                type="button"
                onClick={() =>
                  editingItem
                    ? setEditingItem({ ...editingItem, expires: "" })
                    : setNewFridgeItem({ ...newFridgeItem, expires: "" })
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Expires in X weeks indicator */}
          {(editingItem ? editingItem.packedOn : newFridgeItem.packedOn) &&
            (editingItem ? editingItem.expires : newFridgeItem.expires) && (
              <div className="text-xs text-gray-500 dark:text-gray-300">
                Expires in{" "}
                {Math.ceil(
                  (new Date(
                    editingItem ? editingItem.expires : newFridgeItem.expires
                  ) -
                    new Date(
                      editingItem
                        ? editingItem.packedOn
                        : newFridgeItem.packedOn
                    )) /
                    (1000 * 60 * 60 * 24 * 7)
                )}{" "}
                week
                {Math.ceil(
                  (new Date(
                    editingItem ? editingItem.expires : newFridgeItem.expires
                  ) -
                    new Date(
                      editingItem
                        ? editingItem.packedOn
                        : newFridgeItem.packedOn
                    )) /
                    (1000 * 60 * 60 * 24 * 7)
                ) > 1
                  ? "s"
                  : ""}
              </div>
            )}
        </div>

        {/* Save / Add Button */}
        <button
          onClick={() => {
            // Prepare item to save
            const item = editingItem || newFridgeItem;
            // Validation
            if (!item.name.trim()) {
              alert("Please enter a name!");
              return;
            }
            if (!item.owner || item.owner.length === 0) {
              alert("Please select an owner!");
              return;
            }
            if (!item.type) {
              alert("Please select a type!");
              return;
            }

            // Remove undefined fields to avoid Firebase errors
            const itemToSave = { ...item };
            itemToSave.expires = calculateExpires(
              itemToSave.packedOn,
              itemToSave.shelfLifeWeeks,
              itemToSave.shelfLifeDays
            );
            // Remove only undefined (keep null)
            Object.keys(itemToSave).forEach((key) => {
              if (itemToSave[key] === undefined) delete itemToSave[key];
            });

            if (editingItem) {
              updateFridgeItem(itemToSave);
              setEditingItem(null);
            } else {
              addFridgeItem(itemToSave);
            }
          }}
          className="mt-4 w-full bg-purple-600 text-white p-3 rounded-lg"
        >
          {editingItem ? "Save Changes" : "Add to Fridge"}
        </button>
      </div>

      {/* Owner Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="font-medium text-sm">Filter by Owner:</span>
        <button
          onClick={() => toggleFilterOwner("All")}
          className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
            fridgeFilter.owner.includes("All")
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          All
        </button>
        <button
          onClick={() => toggleFilterOwner("Shared")}
          className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
            fridgeFilter.owner.includes("Shared")
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          Shared
        </button>
        {roommates.map((rm) => (
          <button
            key={rm.id}
            onClick={() => toggleFilterOwner(rm.name)}
            className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
              fridgeFilter.owner.includes(rm.name)
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {rm.name}
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="font-medium text-sm">Filter by Type:</span>
        {itemTypes.map((t) => (
          <button
            key={t}
            onClick={() => toggleFilterType(t)}
            className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
              fridgeFilter.type.includes(t)
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => toggleFilterType("All")}
          className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
            fridgeFilter.type.includes("All")
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          All
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-medium text-sm">Filter by Status:</span>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="radio"
            checked={fridgeFilter.status === "All"}
            onChange={() => setFilterStatus("All")}
          />
          All
        </label>
        <label className="flex items-center gap-1 text-xs text-yellow-600">
          <input
            type="radio"
            checked={fridgeFilter.status === "NearExpired"}
            onChange={() => setFilterStatus("NearExpired")}
          />
          Near Expired
        </label>
        <label className="flex items-center gap-1 text-xs text-red-600">
          <input
            type="radio"
            checked={fridgeFilter.status === "Expired"}
            onChange={() => setFilterStatus("Expired")}
          />
          Expired
        </label>
      </div>

      {/* Inventory List */}
      <ul className="space-y-3">
        {filteredFridgeInventory.map((item) => (
          <li
            key={item.id}
            className={`p-3 rounded-lg ${
              isExpired(item.expires)
                ? "bg-red-100 dark:bg-red-900"
                : isNearExpired(item.expires)
                ? "bg-yellow-100 dark:bg-yellow-900"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">{item.name}</div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {(item.owner || ["Shared"]).join(", ")}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {item.type}
                </span>
                <button
                  onClick={() => setEditingItem(item)}
                  className="p-1 rounded-full bg-blue-200 hover:bg-blue-300"
                >
                  <EditIcon className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => deleteFridgeItem(item.id)}
                  className="p-1 rounded-full bg-red-200 hover:bg-red-300"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
            {item.packedOn && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Packed On: {new Date(item.packedOn).toLocaleDateString()}
              </div>
            )}
            {item.expires && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                Expires in{" "}
                {Math.ceil(
                  (new Date(item.expires) - new Date()) / (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </div>
            )}
            {item.expires && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Expiration Date: {new Date(item.expires).toLocaleDateString()}
              </div>
            )}
          </li>
        ))}
        {filteredFridgeInventory.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No items found.
          </p>
        )}
      </ul>
    </div>
  );
};

export default FridgePage;
