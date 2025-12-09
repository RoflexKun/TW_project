# 🐾 Pets2Adopt - Find your new best friend

![Status](https://img.shields.io/badge/Status-Completed-success)
![Tech](https://img.shields.io/badge/Backend-PHP-blue)
![DB](https://img.shields.io/badge/Database-Oracle%20PL%2FSQL-red)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-orange)

## 📖 Despre Proiect

**Pets2Adopt** este o platformă web dedicată facilitării adopției animalelor de companie. Aplicația conectează persoanele care doresc să adopte un animal cu actualii proprietari sau adăposturi, oferind un mediu sigur și ușor de utilizat pentru a găsi "prietenul perfect".

Proiectul a fost dezvoltat urmând arhitectura **MVC (Model-View-Controller)**, punând accent pe securitate, performanță și o experiență de utilizare fluidă (SPA-like feel prin AJAX).

## 🚀 Funcționalități Principale

### 👤 Pentru Utilizatori:
* **Sistem de Autentificare:** Login/Register securizat, resetare parolă via email (SendGrid) și autentificare cu Google (OAuth 2.0).
* **Căutare și Filtrare Avansată:** Filtre dinamice pentru specie, rasă, vârstă, mărime, gen și oraș.
* **Wishlist:** Salvarea anunțurilor favorite (funcționalitate AJAX).
* **Adăugare Anunțuri:** Formular complex pentru postarea animalelor spre adopție, inclusiv upload media.
* **Profil Utilizator:** Gestionarea datelor personale și vizualizarea propriilor anunțuri.
* **Ticketing System:** Posibilitatea de a raporta probleme sau de a deschide tichete de suport.

### 🛡️ Panou de Administrare (Admin Panel):
* **User Management:** Căutare, ștergere, promovare sau retrogradare utilizatori.
* **Post Management:** Moderarea și ștergerea anunțurilor neconforme.
* **Support:** Vizualizarea și soluționarea tichetelor primite de la utilizatori.
* **Export Date:** Exportul anunțurilor în format JSON.

## 🛠️ Tehnologii Utilizate

### Backend
* **Limbaj:** PHP (Vanilla)
* **Arhitectură:** MVC
* **Bază de date:** Oracle Database (Cloud Autonomous DB)
* **Comunicare DB:** OCI8 Driver & PL/SQL Stored Procedures
* **Securitate:** JWT (Firebase Library) pentru sesiune, protecție împotriva SQL Injection (Binding variables) și XSS.

### Frontend
* **Limbaje:** HTML5, CSS3, JavaScript (Vanilla).
* **Interacțiune:** AJAX pentru comunicare asincronă cu serverul (fără reîncărcarea paginii).
* **Design:** Responsive (Mobile & Desktop).

### Biblioteci Externe
* **PHPMailer / SendGrid:** Pentru serviciul de email.
* **Google Sign-In API:** Pentru social login.

## ⚙️ Arhitectura și Baza de Date

Aplicația folosește o clasă Singleton `Database` pentru gestionarea conexiunilor Oracle. Logica de business este încapsulată în proceduri stocate **PL/SQL**, asigurând viteză și securitate.

Structura bazei de date include tabele normalizate pentru:
* `Users` & `Admins`
* `Posts` (legat de tabele de nomenclator: `Species`, `Breeds`, `Locations`)
* `Wishlists`
* `Tickets`

## 📸 Previzualizare

[Vezi videoclipul de prezentare](https://www.youtube.com/watch?v=v66zL-lXM8E&ab_channel=RoflexKun)
