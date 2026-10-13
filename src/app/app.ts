
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';

import { auth } from './firebase.config';
import { AuthService } from './auth.service';
import {
  ApartmentData,
  ApartmentService,
} from './apartment.service';

const OWNER_UID = 'CwY9l8dnbBeqTdV8dOvEIqeoGhn1';

const DEFAULT_APARTMENT: ApartmentData = {
  name: 'Apartmán v srdci prírody',
  location: 'Slovensko',
  description:
    'Objavte miesto na oddych, kde si vychutnáte pokoj, pohodlie a krásy okolitej prírody.',
  pricePerNight: 90,
  capacity: 4,
  amenities: ['Wi-Fi', 'Parkovanie', 'Plne vybavená kuchyňa'],
  images: [],
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  view: 'home' | 'login' | 'admin' = 'home';

  user: User | null = null;
  apartment: ApartmentData = { ...DEFAULT_APARTMENT };

  email = '';
  password = '';
  amenitiesText = '';
  imagesText = '';

  loading = true;
  saving = false;
  error = '';
  message = '';

  private stopWatching?: () => void;

  constructor(
    private authService: AuthService,
    private apartmentService: ApartmentService,
  ) {}

  get isOwner(): boolean {
    return !!this.user && this.user.uid === OWNER_UID;
  }

  ngOnInit(): void {
    // Priebežne sleduje údaje apartmánu vo Firestore.
    this.stopWatching = this.apartmentService.watch(
      (data) => {
        if (data) {
          this.apartment = data;
        }

        this.amenitiesText = this.apartment.amenities.join('\n');
        this.imagesText = this.apartment.images.join('\n');
        this.loading = false;
      },
      (error) => {
        console.error('Načítanie apartmánu zlyhalo:', error);
        this.error = 'Údaje sa nepodarilo načítať. Skontroluj Firebase.';
        this.loading = false;
      },
    );

    onAuthStateChanged(auth, async (user) => {
      if (user && user.uid !== OWNER_UID) {
        await signOut(auth);
        this.user = null;
        this.error = 'Tento účet nemá povolený prístup.';
        return;
      }

      this.user = user;

      if (this.isOwner) {
        this.view = 'admin';
      }
    });
  }

  ngOnDestroy(): void {
    this.stopWatching?.();
  }

  async loadApartment(): Promise<void> {
    try {
      const saved = await this.apartmentService.load();

      if (saved) {
        this.apartment = saved;
      }

      this.amenitiesText = this.apartment.amenities.join('\n');
      this.imagesText = this.apartment.images.join('\n');
    } catch (error) {
      console.error(error);
      this.error = 'Údaje sa nepodarilo načítať. Skontroluj Firebase.';
    }
  }

  async login(): Promise<void> {
    this.error = '';
    this.message = '';

    try {
      const result = await this.authService.login(
        this.email.trim(),
        this.password,
      );

      if (result.user.uid !== OWNER_UID) {
        await signOut(auth);
        this.error = 'Tento účet nemá povolený prístup.';
        return;
      }

      this.user = result.user;
      this.password = '';
      this.view = 'admin';

      await this.loadApartment();
    } catch (error) {
      console.error(error);
      this.error = 'Prihlásenie zlyhalo. Skontroluj e-mail a heslo.';
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.user = null;
    this.password = '';
    this.view = 'home';
    this.error = '';
  }

  async saveApartment(): Promise<void> {
    if (!this.isOwner) {
      this.error = 'Na úpravu údajov sa musíš prihlásiť ako majiteľ.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.message = '';

    const dataToSave: ApartmentData = {
      ...this.apartment,
      name: this.apartment.name.trim(),
      location: this.apartment.location.trim(),
      description: this.apartment.description.trim(),
      pricePerNight: Number(this.apartment.pricePerNight),
      capacity: Number(this.apartment.capacity),
      amenities: this.amenitiesText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      images: this.imagesText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (
      !dataToSave.name ||
      !dataToSave.location ||
      !dataToSave.description ||
      !Number.isFinite(dataToSave.pricePerNight) ||
      dataToSave.pricePerNight < 0 ||
      !Number.isInteger(dataToSave.capacity) ||
      dataToSave.capacity < 1
    ) {
      this.error = 'Skontroluj názov, opis, cenu a kapacitu.';
      this.saving = false;
      return;
    }

    try {
      await this.apartmentService.save(dataToSave);
      this.apartment = dataToSave;
      this.message = 'Zmeny boli uložené a web je aktualizovaný.';
    } catch (error) {
      console.error('Uloženie zlyhalo:', error);
      this.error =
        'Uloženie zlyhalo. Skontroluj pravidlá Firestore a pripojenie.';
    } finally {
      this.saving = false;
    }
  }
}
