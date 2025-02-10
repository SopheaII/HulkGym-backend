### Create `.env.dev`

```bash
DB_HOST=...
DB_PORT=...
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=...
NODE_ENV=...
JWT_SECRET=...
TELEGRAM_URL=...
TELEGRAM_TOKEN=...
PGADMIN_EMAIL=...
PGADMIN_PASSWORD=...
```

### Docker compose

```bash
services:
  backend:
    build: .
    ports:
      - "3001:3000"
    environment:
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
      NODE_ENV: ${NODE_ENV}
      JWT_SECRET: ${JWT_SECRET}
      TELEGRAM_TOKEN: ${TELEGRAM_TOKEN}
    depends_on:
      - database
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules

```

### Run docker compose services

```bash
docker compose --env-file .env.dev -f compose.dev.yml up -d --build
```
