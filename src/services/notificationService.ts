import { getToken, getMessaging } from "firebase/messaging";
import { getMessagingInstance } from "../firebase";
import { hybridApi } from "./hybridApiService";

export const requestNotificationPermission = async (userId: string) => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn("Messaging not supported.");
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // NOTE: Replace this with your actual VAPID public key from Firebase Console
      const vapidKey = 'YOUR_VAPID_PUBLIC_KEY'; 
      
      const token = await getToken(messaging, { vapidKey });
      
      if (token) {
        // Send token to our PHP backend
        await hybridApi.post('/users.php', {
          action: 'update_token',
          userId: userId,
          fcmToken: token
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error requesting permission:", error);
    return false;
  }
};
