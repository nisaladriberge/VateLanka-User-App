import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../utils/firebaseConfig";

// Save user data to Firestore
export const saveUserData = async (uid, userData) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

// Fetch enabled municipal councils
export const fetchMunicipalCouncils = async () => {
  try {
    const councilsRef = collection(firestore, "municipalCouncils");
    const q = query(councilsRef, where("isEnabled", "==", true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching municipal councils:", error);
    throw error;
  }
};

// Fetch user profile data
export const fetchUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(firestore, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Fetch districts for a municipal council
export const fetchDistrictsForMunicipalCouncil = async (municipalCouncilId) => {
  try {
    const districtRef = collection(
      firestore,
      `municipalCouncils/${municipalCouncilId}/Districts`
    );
    const districtSnapshot = await getDocs(districtRef);
    return districtSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
};

// Fetch wards for a district
export const fetchWardsForDistrict = async (municipalCouncilId, districtId) => {
  try {
    const wardRef = collection(
      firestore,
      `municipalCouncils/${municipalCouncilId}/Districts/${districtId}/Wards`
    );
    const wardSnapshot = await getDocs(wardRef);
    return wardSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching wards:", error);
    throw error;
  }
};

// Update user location
export const updateUserLocation = async (uid, locationData) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      ...locationData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user location:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Fetch Collection Schedules
export const fetchUserSchedules = async (uid) => {
  try {
    const userData = await fetchUserProfile(uid);
    if (!userData?.municipalCouncil || !userData?.district || !userData?.ward) {
      throw new Error("Location not set");
    }

    const schedulesRef = collection(
      firestore,
      `municipalCouncils/${userData.municipalCouncil}/Districts/${userData.district}/Wards/${userData.ward}/schedules`
    );
    const schedulesSnapshot = await getDocs(schedulesRef);

    return schedulesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        wasteType: data.wasteType,
        day: data.day,
        frequency: data.frequency,
        timeSlot: data.timeSlot || null,
      };
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};
