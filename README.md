# 🏆 Loyalty SaaS - System Lojalnościowy dla Firm

Wieloplatformowa aplikacja SaaS do zarządzania programami lojalnościowymi dla polskich firm. System umożliwia zbieranie punktów, pieczątki, karty podarunkowe, vouchery i kampanie marketingowe.

## 📋 Spis Treści

- [Technologie](#-technologie)
- [Struktura Projektu](#-struktura-projektu)
- [Wymagania](#-wymagania)
- [Szybki Start](#-szybki-start)
- [Seedowanie Danych](#-seedowanie-danych)
- [Zmienne Środowiskowe](#-zmienne-środowiskowe)
- [Dostępne Aplikacje](#-dostępne-aplikacje)

---

## 🛠 Technologie

### Backend
| Technologia | Wersja | Opis |
|-------------|--------|------|
| **Node.js** | 20+ | Środowisko uruchomieniowe JavaScript |
| **TypeScript** | 5.6 | Język programowania z typami |
| **Express.js** | 4.21 | Framework webowy |
| **PostgreSQL** | 16 | Relacyjna baza danych |
| **Redis** | 7 | Cache i kolejki |
| **Knex.js** | 3.1 | Query builder i migracje |
| **BullMQ** | 5.20 | Kolejki zadań |
| **Zod** | 3.23 | Walidacja schematów |
| **JWT** | 9.0 | Uwierzytelnianie tokenowe |

### Frontend
| Technologia | Wersja | Opis |
|-------------|--------|------|
| **Next.js** | 14.2 | Framework React z SSR |
| **React** | 18.3 | Biblioteka UI |
| **TailwindCSS** | 3.4 | Framework CSS |
| **TanStack Query** | 5.59 | Zarządzanie stanem serwera |
| **React Hook Form** | 7.53 | Zarządzanie formularzami |
| **Recharts** | 2.13 | Wykresy i wizualizacje |
| **Lucide React** | 0.441 | Ikony |
| **next-intl** | 3.20 | Internacjonalizacja |

### DevOps
| Technologia | Opis |
|-------------|------|
| **Docker & Docker Compose** | Konteneryzacja |
| **pnpm** | Menedżer pakietów (workspaces) |
| **Turborepo** | Monorepo build system |

---

## 📁 Struktura Projektu

```
saas/
├── 📂 backend/                    # API serwera (Express + TypeScript)
│   ├── 📂 src/
│   │   ├── 📂 config/            # Konfiguracja aplikacji
│   │   ├── 📂 db/                # Połączenie bazy i migracje
│   │   │   ├── connection.ts     # Połączenie z PostgreSQL
│   │   │   ├── knexfile.ts       # Konfiguracja Knex.js
│   │   │   └── 📂 migrations/    # Migracje bazy danych
│   │   ├── 📂 jobs/              # Zadania w tle (BullMQ)
│   │   ├── 📂 lib/               # Biblioteki pomocnicze
│   │   ├── 📂 middleware/        # Middleware Express
│   │   ├── 📂 modules/           # Moduły biznesowe
│   │   │   ├── 📂 analytics/     # Analityka i raporty
│   │   │   ├── 📂 auth/          # Uwierzytelnianie i autoryzacja
│   │   │   ├── 📂 campaigns/     # Kampanie marketingowe
│   │   │   ├── 📂 consent/       # Zgody RODO
│   │   │   ├── 📂 customer/      # Zarządzanie klientami
│   │   │   ├── 📂 gift-cards/    # Karty podarunkowe
│   │   │   ├── 📂 kiosk/         # Obsługa kiosków
│   │   │   ├── 📂 loyalty/       # Program lojalnościowy
│   │   │   ├── 📂 payments/      # Płatności (PayU)
│   │   │   ├── 📂 pos/           # Point of Sale
│   │   │   ├── 📂 rewards/       # Nagrody
│   │   │   ├── 📂 stamps/        # Pieczątki
│   │   │   ├── 📂 tenant/        # Multi-tenancy
│   │   │   ├── 📂 transactions/  # Transakcje
│   │   │   ├── 📂 vouchers/      # Vouchery i kody rabatowe
│   │   │   └── 📂 webhooks/      # Webhooki zewnętrzne
│   │   ├── 📂 types/             # Wspólne typy TypeScript
│   │   ├── app.ts                # Konfiguracja Express
│   │   └── server.ts             # Punkt wejściowy serwera
│   ├── .env.example              # Przykładowe zmienne środowiskowe
│   ├── package.json
│   └── tsconfig.json
│
├── 📂 frontend/                   # Aplikacje frontendowe
│   ├── 📂 apps/
│   │   ├── 📂 dashboard/         # Panel administracyjny (port 3000)
│   │   │   ├── 📂 src/
│   │   │   ├── next.config.js
│   │   │   ├── tailwind.config.ts
│   │   │   └── package.json
│   │   ├── 📂 portal/            # Portal dla klientów (port 3002)
│   │   │   └── ...
│   │   └── 📂 kiosk/             # Aplikacja kioskowa (port 3003)
│   │       └── ...
│   └── 📂 packages/              # Współdzielone pakiety
│       ├── 📂 api-client/        # Klient API (fetch wrapper)
│       ├── 📂 config/            # Konfiguracja współdzielona
│       ├── 📂 i18n/              # Tłumaczenia (PL/EN)
│       ├── 📂 store/             # Stan globalny (Zustand)
│       ├── 📂 types/             # Typy TypeScript
│       ├── 📂 ui/                # Komponenty UI (shadcn/ui)
│       └── 📂 utils/             # Funkcje pomocnicze
│
├── 📂 shared/                     # Współdzielony kod backend/frontend
│   └── 📂 src/
│       ├── api-contracts.ts      # Kontrakty API (typy request/response)
│       ├── enums.ts              # Enumy współdzielone
│       └── index.ts              # Eksporty
│
├── 📂 scripts/                    # Skrypty pomocnicze
│   └── seed-customers.ts         # Seedowanie danych klientów
│
├── docker-compose.yml            # Konfiguracja Docker Compose
├── Dockerfile                    # Multi-stage Dockerfile
├── package.json                  # Root package.json (workspaces)
├── pnpm-workspace.yaml           # Konfiguracja pnpm workspaces
├── turbo.json                    # Konfiguracja Turborepo
└── seed-update.sql               # SQL z przykładowymi danymi
```

---

## 📋 Wymagania

- **Node.js** 20+ 
- **pnpm** 9.15+ (zalecane)
- **Docker** i **Docker Compose** (dla pełnego stacku)
- **PostgreSQL** 16 (lub przez Docker)
- **Redis** 7 (lub przez Docker)

---

## 🚀 Szybki Start (Docker - Zalecane)

Najszybszy sposób uruchomienia całego systemu. Wymagany tylko **Docker Desktop**.

### Krok 1: Sklonuj repozytorium

```bash
git clone https://github.com/TWOJE_KONTO/loyalty-saas.git
cd loyalty-saas
```

### Krok 2: Uruchom wszystkie usługi

```bash
# Windows (PowerShell)
docker-compose up -d

# Lub z pełnym buildem (pierwszne uruchomienie)
docker-compose up -d --build
```

### Krok 3: Poczekaj na uruchomienie

```bash
# Sprawdź status kontenerów
docker-compose ps

# Podgląd logów (opcjonalnie)
docker-compose logs -f backend
```

### Krok 4: Uruchom migracje bazy danych

```bash
# Uruchom migracje wewnątrz kontenera backend
docker exec -it loyalty-backend pnpm migrate
```

### Krok 5: (Opcjonalnie) Załaduj przykładowe dane

```bash
# Załaduj seed dla kawiarni demo
docker exec -it loyalty-postgres psql -U loyalty -d loyalty_saas -f /dev/stdin < seed-update.sql
```

### ✅ Gotowe! Dostępne aplikacje:

| Aplikacja | URL | Opis |
|-----------|-----|------|
| 🎛 **Dashboard** | http://localhost:3000 | Panel administratora |
| 👤 **Portal** | http://localhost:3002 | Portal dla klientów |
| 🏪 **Kiosk** | http://localhost:3003 | Aplikacja kioskowa |
| 🔌 **API** | http://localhost:3001 | Backend REST API |

### Przydatne komendy Docker

```bash
# Zatrzymaj wszystkie kontenery
docker-compose down

# Zatrzymaj i usuń dane (reset bazy)
docker-compose down -v

# Restart pojedynczej usługi
docker-compose restart backend

# Podgląd logów konkretnego serwisu
docker-compose logs -f dashboard

# Wejście do kontenera (shell)
docker exec -it loyalty-backend sh
```

---

## 💻 Alternatywa: Lokalne uruchomienie (bez Dockera dla aplikacji)

Jeśli wolisz uruchomić aplikacje lokalnie (wymaga Node.js i pnpm):

```bash
# Zainstaluj zależności
pnpm install

# Skopiuj plik środowiskowy
cp backend/.env.example backend/.env

# Uruchom tylko PostgreSQL i Redis przez Docker
docker-compose up postgres redis -d

# Uruchom migracje bazy danych
cd backend && pnpm migrate

# Uruchom wszystkie aplikacje w trybie dev
cd .. && pnpm dev
```

---

## 🌱 Seedowanie Danych

### Uruchomienie skryptu seedowania klientów

```bash
# Z katalogu głównego projektu
npx tsx scripts/seed-customers.ts

# Lub przez pnpm
cd backend && pnpm seed
```

### Ręczne seedowanie przez SQL

Plik `seed-update.sql` zawiera przykładowe dane dla polskiej kawiarni "Kawiarnia Rozmowa":

```bash
# Zaloguj się do kontenera PostgreSQL
docker exec -it loyalty-postgres psql -U loyalty -d loyalty_saas

# Wykonaj skrypt seedowania
\i /path/to/seed-update.sql
```

### Co zawiera seed:
- 📊 **30-dniowe dane analityczne** - realistyczne transakcje dla 3 lokalizacji
- 🎫 **Vouchery** - kody rabatowe (KAWA20, VIP50, WIOSNA2024, itp.)
- 🎁 **Karty podarunkowe** - różne nominały z saldami
- 📢 **Kampanie marketingowe** - zimowa promocja, walentynki, program poleceń

---

## 🔐 Zmienne Środowiskowe

Skopiuj `backend/.env.example` do `backend/.env` i dostosuj:

```env
# Serwer
PORT=3001
NODE_ENV=development

# Baza danych PostgreSQL
DATABASE_URL=postgres://loyalty:loyalty_dev@localhost:5432/loyalty_saas

# Redis (cache i kolejki)
REDIS_URL=redis://localhost:6379

# JWT (uwierzytelnianie)
JWT_SECRET=zmien-mnie-w-produkcji
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3002,http://localhost:3003

# Email (Amazon SES) - opcjonalne
SES_REGION=eu-central-1
SES_ACCESS_KEY=
SES_SECRET_KEY=
SES_FROM_EMAIL=noreply@twojadomena.pl

# SMS (SMSAPI.pl) - opcjonalne
SMSAPI_TOKEN=
SMSAPI_FROM=Loyalty

# Płatności (PayU) - opcjonalne
PAYU_POS_ID=
PAYU_CLIENT_SECRET=
PAYU_SANDBOX=true
```

---

## 🖥 Dostępne Aplikacje

| Aplikacja | Port | Opis |
|-----------|------|------|
| **Dashboard** | 3000 | Panel administratora - zarządzanie programem lojalnościowym, analityka, kampanie |
| **Portal** | 3002 | Portal dla klientów - sprawdzanie punktów, nagrody, historia |
| **Kiosk** | 3003 | Aplikacja kioskowa - do punktów sprzedaży |
| **Backend API** | 3001 | REST API - wszystkie operacje biznesowe |

---

## 📜 Dostępne Skrypty

```bash
# Uruchom wszystkie aplikacje w trybie dev
pnpm dev

# Zbuduj wszystkie pakiety
pnpm build

# Sprawdź typy TypeScript
pnpm typecheck

# Uruchom linting
pnpm lint

# Wyczyść build artifacts
pnpm clean

# Migracje bazy danych
cd backend && pnpm migrate

# Rollback migracji
cd backend && pnpm migrate:rollback

# Seedowanie danych
cd backend && pnpm seed
```

---

## 🏗 Architektura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────┬─────────────┬─────────────────────────────────┤
│  Dashboard  │   Portal    │             Kiosk               │
│  (Next.js)  │  (Next.js)  │           (Next.js)             │
│   :3000     │    :3002    │            :3003                │
└──────┬──────┴──────┬──────┴──────────────┬──────────────────┘
       │             │                      │
       └─────────────┴──────────────────────┘
                     │ REST API
       ┌─────────────┴─────────────┐
       │     Backend (Express)      │
       │          :3001             │
       └─────────────┬─────────────┘
                     │
       ┌─────────────┴─────────────┐
       │                           │
   ┌───┴───┐                   ┌───┴───┐
   │ Redis │                   │Postgre│
   │ :6379 │                   │ :5432 │
   └───────┘                   └───────┘
```

---

## 📄 Licencja

MIT License - szczegóły w pliku LICENSE.

---

## 🤝 Współtwórcy

Stworzone z ❤️ dla polskich przedsiębiorców.
