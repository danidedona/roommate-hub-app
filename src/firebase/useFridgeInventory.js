import { useFirestoreCollection } from "./useFirestoreCollection";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useState } from "react";

export const useFridgeInventory = () => {
  const fridgeInventory = useFirestoreCollection(db, "fridgeInventory");

  const [newFridgeItem, setNewFridgeItem] = useState({
    name: "",
    owner: ["Shared"],
    type: "Fridge",
    packedOn: "",
    expires: "",
  });

  const [fridgeFilter, setFridgeFilter] = useState({
    owner: ["All"],
    type: ["All"],
    status: "All",
  });

  const addFridgeItem = async () => {
    if (!newFridgeItem.name.trim()) return;
    try {
      await addDoc(collection(db, "fridgeInventory"), newFridgeItem);
      setNewFridgeItem({
        name: "",
        owner: ["Shared"],
        type: "Fridge",
        packedOn: "",
        expires: "",
      });
    } catch (err) {
      console.error("Error adding fridge item:", err);
    }
  };

  const updateFridgeItem = async (item) => {
    try {
      await updateDoc(doc(db, "fridgeInventory", item.id), item);
    } catch (err) {
      console.error("Error updating fridge item:", err);
    }
  };

  const deleteFridgeItem = async (id) => {
    try {
      await deleteDoc(doc(db, "fridgeInventory", id));
    } catch (err) {
      console.error("Error deleting fridge item:", err);
    }
  };

  const toggleFridgeOwner = (name) => {
    setNewFridgeItem((prev) => {
      const owners = prev.owner.includes(name)
        ? prev.owner.filter((o) => o !== name)
        : [...prev.owner, name];
      return { ...prev, owner: owners.length ? owners : ["Shared"] };
    });
  };

  const toggleFilterOwner = (owner) => {
    setFridgeFilter((prev) => ({
      ...prev,
      owner:
        owner === "All"
          ? ["All"]
          : prev.owner.includes(owner)
          ? prev.owner.filter((o) => o !== owner)
          : [...prev.owner.filter((o) => o !== "All"), owner],
    }));
  };

  const toggleFilterType = (type) => {
    setFridgeFilter((prev) => ({
      ...prev,
      type:
        type === "All"
          ? ["All"]
          : prev.type.includes(type)
          ? prev.type.filter((t) => t !== type)
          : [...prev.type.filter((t) => t !== "All"), type],
    }));
  };

  const filteredFridgeInventory = fridgeInventory.filter((item) => {
    const ownerMatch =
      fridgeFilter.owner.includes("All") ||
      (item.owner && item.owner.some((o) => fridgeFilter.owner.includes(o)));

    const typeMatch =
      fridgeFilter.type.includes("All") ||
      fridgeFilter.type.includes(item.type);

    // Compute status dynamically
    const today = new Date();
    const expires = item.expires ? new Date(item.expires) : null;

    let statusMatch = true;

    if (fridgeFilter.status === "Expired") {
      statusMatch = expires ? expires < today : false;
    } else if (fridgeFilter.status === "NearExpired") {
      statusMatch =
        expires &&
        (expires - today) / (1000 * 60 * 60 * 24) <= 5 &&
        expires > today;
    } else if (fridgeFilter.status === "All") {
      statusMatch = true;
    }

    return ownerMatch && typeMatch && statusMatch;
  });

  return {
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
  };
};
