
import { Injectable } from '@angular/core';
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

import { db } from './firebase.config';

export interface ApartmentData {
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  images: string[];
}

const apartmentRef = doc(db, 'apartment', 'public');

@Injectable({
  providedIn: 'root',
})
export class ApartmentService {
  async load(): Promise<ApartmentData | null> {
    const snapshot = await getDoc(apartmentRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as ApartmentData;
  }

  watch(
    callback: (data: ApartmentData | null) => void,
    onError: (error: Error) => void,
  ): () => void {
    return onSnapshot(
      apartmentRef,
      (snapshot) => {
        callback(
          snapshot.exists()
            ? (snapshot.data() as ApartmentData)
            : null,
        );
      },
      (error) => onError(error),
    );
  }

  async save(data: ApartmentData): Promise<void> {
    await setDoc(apartmentRef, data);
  }
}
