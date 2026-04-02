import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAuth, getAuth } from '@angular/fire/auth'; 
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// ĐÂY CHÍNH LÀ CHÌA KHÓA CỦA RIÊNG BẠN
const firebaseConfig = {
  apiKey: "AIzaSyCwR1W0h7paYv2A5i43EIyIOAC5HfhCMzY",
  authDomain: "task-e7028.firebaseapp.com",
  projectId: "task-e7028",
  storageBucket: "task-e7028.firebasestorage.app",
  messagingSenderId: "160717134708",
  appId: "1:160717134708:web:64da9329bc898ee5a72a21",
  measurementId: "G-EBVW7CWDC3"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAuth(() => getAuth()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),

  ]
};