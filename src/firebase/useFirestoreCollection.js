import { useState, useEffect } from "react";
import { onSnapshot, collection } from "firebase/firestore";

export const useFirestoreCollection = (db, collectionName) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!db) return;
    const q = collection(db, collectionName);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db, collectionName]);

  return data;
};
