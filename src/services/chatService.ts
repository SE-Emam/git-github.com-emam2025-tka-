import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
  doc,
  getDoc,
  updateDoc,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, storage } from '@/src/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: any;
}

export const sendMessage = async (groupId: string, message: Omit<ChatMessage, 'createdAt'>) => {
  const messagesRef = collection(db, 'groups', groupId, 'messages');
  
  // 1. Add Message
  await addDoc(messagesRef, {
    ...message,
    createdAt: serverTimestamp()
  });

  // 2. Increment Unread Count for others
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);
    if (groupSnap.exists()) {
      const data = groupSnap.data();
      const recipients = [
        ...(data.studentIds || []), 
        ...(data.trainerIds || [])
      ].filter(id => id !== message.senderId);

      // Distribute increments (Batch)
      const batch = writeBatch(db);
      recipients.forEach(rid => {
        const userRef = doc(db, 'users', rid);
        // Using nested path to track per-group counts
        batch.update(userRef, {
          [`unreadByGroup.${groupId}`]: increment(1),
          totalUnread: increment(1)
        });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error updating unread counters:', error);
  }
};

export const resetGroupUnreadCount = async (userId: string, groupId: string, currentUnread: number = 0) => {
  if (!userId || !groupId) return;
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      [`unreadByGroup.${groupId}`]: 0,
      totalUnread: increment(-currentUnread < 0 ? -currentUnread : 0) // Safety check
    });
  } catch (error) {
    // If field doesn't exist it might fail, but usually ok with updates
    console.error('Error resetting unread count:', error);
  }
};

export const subscribeToMessages = (groupId: string, limitCount: number = 25, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, 'groups', groupId, 'messages');
  // We fetch the latest messages first
  const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    // Reverse because we want them in chronological order for the UI
    callback(messages.reverse());
  });
};

export const getMoreMessages = async (groupId: string, lastMessageDoc: DocumentSnapshot, limitCount: number = 25) => {
  const messagesRef = collection(db, 'groups', groupId, 'messages');
  const q = query(
    messagesRef, 
    orderBy('createdAt', 'desc'), 
    startAfter(lastMessageDoc), 
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ChatMessage[];
};

export const uploadChatImage = async (groupId: string, file: File): Promise<string> => {
  // Simple Canvas Compression to save bandwidth
  const compressedFile = await compressImage(file);
  
  const storageRef = ref(storage, `chats/${groupId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, compressedFile);
  return getDownloadURL(snapshot.ref);
};

const compressImage = (file: File): Promise<Blob | File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.7); // 70% quality
      };
    };
  });
};
