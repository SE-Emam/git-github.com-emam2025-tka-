import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { useEffect, useState } from 'react';

export const updateCMSDocument = async (docId: string, data: any) => {
  const docRef = doc(db, 'cms', docId);
  await setDoc(docRef, data, { merge: true });
};

export const useCMSData = (docId: string, initialData: any) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'cms', docId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData((prev: any) => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    }, (error) => {
      console.error("CMS Fetch error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [docId]);

  return { data, loading };
};
