# Insuppent Backend

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Express](https://img.shields.io/badge/Express.js-API-blue)
![License: ISC](https://img.shields.io/badge/License-ISC-lightgrey)

Backend API for the Insuppent platform. This service powers user management, lead purchasing, admin operations, and application settings for the Insuppent ecosystem.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Database](#database)
- [Scripts](#scripts)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- User authentication & authorization (admin and user)
- Lead management and purchasing
- Configurable lead pricing and brand color
- Stripe integration for payments
- Admin dashboard endpoints
- Config file validation and seeding scripts
- Error handling and validation
- JWT-based authentication
- Sequelize ORM for MySQL

---

## Tech Stack
- **Node.js**
- **Express.js**
- **Sequelize** (MySQL)
- **Stripe** (Payments)
- **Docker** (optional)
- **Vercel** (deployment config)
- **ESLint & Prettier** (code style)

---

## Project Structure
```
insuppent-be/
├── docker-compose.yml
├── Dockerfile
├── eslint.config.mjs
├── package.json
├── vercel.json
├── docs/
├── scripts/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── serverless.js
│   ├── app/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   ├── config/
│   ├── constants/
│   ├── db/
│   ├── enums/
│   ├── errors/
│   ├── helpers/
│   ├── scripts/
│   ├── shared/
│   ├── utils/
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MySQL database

### Install dependencies
```bash
npm install
```

---

## Configuration
1. Copy `.env.example` to `.env` and update values as needed.
2. Update MySQL credentials in `src/db/sequelize.js`.
3. Edit config files in `src/config/` for brand color and lead pricing.

---

## Database
- Uses Sequelize ORM.
- Run seed scripts for initial data:

```bash
npm run seed
```

---

## Scripts
- `npm run seed` — Seed database with initial data
- Other scripts in `src/app/scripts/`:
  - `createAdmin.js`
  - `recreateAdmin.js`
  - `seedLeadMembershipMaxSaleCounts.js`

---

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs on `http://localhost:3000` by default.

---

## API Endpoints

| Path                | Description                       |
|---------------------|-----------------------------------|
| `/admin/auth`       | Admin authentication              |
| `/admin`            | Admin operations (protected)      |
| `/users`            | User management                   |
| `/leads`            | Lead management                   |
| `/purchase`         | Lead purchasing                   |
| `/settings`         | App settings (lead pricing, brand color) |

See `src/app/routes/index.js` for full route registration.

---

## Environment Variables

Example `.env`:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=insuppent
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
```

---

## Docker

Build and run with Docker:
```bash
docker build -t insuppent-be .
docker-compose up
```

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

---

## License

ISC

---

## Related Projects
- [Frontend Repo](../insuppent-fe)

---

## Maintainers
- Abhijit Sarker

---

## Contact
For issues, open a GitHub issue or contact the maintainer.
