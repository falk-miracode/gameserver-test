# 🎮 Gameserver Test - Monorepo

Ein Monorepo mit Colyseus Backend und SolidJS Frontend, die gemeinsame Schemas verwenden.

## 📁 Struktur

```
packages/
├── schemas/           # Gemeinsame Colyseus-Schemas
├── backend/          # Colyseus Server
└── frontend/         # SolidJS Frontend
```

## 🚀 Quick Start

### Alle Dependencies installieren
```bash
pnpm install
```

### Entwicklung starten
```bash
# Backend und Frontend gleichzeitig starten
pnpm dev

# Oder einzeln:
pnpm dev:backend   # Startet Colyseus Server auf Port 2567
pnpm dev:frontend  # Startet SolidJS App auf Port 3000
```

### Produktions-Build
```bash
pnpm build
```

## 📦 Pakete

### 🔧 Schemas (`@gameserver-test/schemas`)
Gemeinsame Colyseus-Schemas, die von Backend und Frontend verwendet werden.

**Scripts:**
- `pnpm build:schemas` - TypeScript Build
- `pnpm dev:schemas` - Watch Mode

### 🖥️ Backend (`@gameserver-test/backend`)
Colyseus Multiplayer-Server mit Express.

**Scripts:**
- `pnpm dev:backend` - Entwicklungsserver starten
- `pnpm build:backend` - Produktions-Build
- `pnpm test` - Tests ausführen
- `pnpm --filter @gameserver-test/backend loadtest` - Load Tests

**Features:**
- Colyseus Rooms mit `MyRoom`
- Express Server mit Monitor und Playground
- Redis-Unterstützung (optional)
- Automatische Tests

**Endpoints:**
- `ws://localhost:2567` - WebSocket Verbindung
- `http://localhost:2567` - Colyseus Playground (nur Development)
- `http://localhost:2567/monitor` - Colyseus Monitor

### 🎨 Frontend (`@gameserver-test/frontend`)
SolidJS Single Page Application.

**Scripts:**
- `pnpm dev:frontend` - Entwicklungsserver starten
- `pnpm build:frontend` - Produktions-Build
- `pnpm --filter @gameserver-test/frontend preview` - Build-Vorschau

**Features:**
- 🎯 Live-Verbindung zum Colyseus Server
- 💬 Echtzeit-Messaging
- 📊 Room-Informationen und Statistiken
- 🎨 Modernes, responsives Design
- ⚡ SolidJS mit TypeScript

## 🔧 Development

### Neue Schemas hinzufügen
1. Schema in `packages/schemas/src/` erstellen
2. In `packages/schemas/src/index.ts` exportieren
3. Schemas-Paket neu builden: `pnpm build:schemas`

### Backend erweitern
- Neue Rooms in `packages/backend/src/rooms/` erstellen
- In `packages/backend/src/app.config.ts` registrieren
- Shared Schemas über `@gameserver-test/schemas` importieren

### Frontend erweitern
- Komponenten in `packages/frontend/src/` erstellen
- Shared Schemas über `@gameserver-test/schemas` importieren
- CSS in `packages/frontend/src/App.css` anpassen

## 🐳 Docker

### Backend als Docker Container bauen und starten

```bash
# Docker Image bauen (vom Root-Verzeichnis aus)
docker build -t gameserver-test-backend .

# Container starten
docker run -p 2567:2567 gameserver-test-backend

# Mit Environment Variables
docker run -p 2567:2567 -e NODE_ENV=production gameserver-test-backend
```

### Mit Docker Compose

```bash
# Einfacher Start
docker-compose up -d

# Mit Redis für Skalierung
docker-compose --profile with-redis up -d

# Logs anzeigen
docker-compose logs -f

# Stoppen
docker-compose down
```

### Multi-Container Setup

```bash
# Mehrere Backend-Instanzen mit Load Balancer
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d --scale backend=3
```

## 🧪 Testing

```bash
# Alle Tests ausführen
pnpm test

# Load Test (Backend muss laufen)
pnpm --filter @gameserver-test/backend loadtest
```

## 🔧 Environment Variables

### Backend
```env
# Optional: Redis Configuration
REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_DB=0

# Environment
NODE_ENV=development
```

## 📝 Workspace Scripts

```bash
# Alle Pakete bauen
pnpm build

# Einzelne Pakete bauen
pnpm build:schemas
pnpm build:backend
pnpm build:frontend

# Development-Server
pnpm dev                    # Backend + Frontend
pnpm dev:backend           # Nur Backend
pnpm dev:frontend          # Nur Frontend

# Tests
pnpm test                  # Backend Tests

# Cleaning
pnpm clean                 # Build-Ordner löschen
```

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend WebSocket:** ws://localhost:2567
- **Colyseus Playground:** http://localhost:2567 (Development)
- **Colyseus Monitor:** http://localhost:2567/monitor

## 🛠️ Tech Stack

- **Monorepo:** pnpm Workspaces
- **Backend:** Colyseus + Express + TypeScript
- **Frontend:** SolidJS + Vite + TypeScript
- **Schemas:** @colyseus/schema
- **Testing:** Mocha + @colyseus/testing
- **Build:** TypeScript + Vite
