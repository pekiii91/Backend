# Backend API

Back-end for Task Manager project. Based on [ExpressJS](https://expressjs.com/).

The application is dockerized, it is set up only for development.
This is the backend for managing user tasks within the application. The application allows creating, updating, searching and deleting tasks. ExpressJS is the most popular web framework for node

## Tehnology

- Node.js: version 20.10
- ExpressJS
- PostgreSQL 15
- Docker: version 4.33

### Local environment

Install packages locally

```bash
 npm init -y
```

```bash
  npm install express body-parser jsonwebtoken bcrypt
```

```bash
npm install --save swagger-jsdoc swagger-ui-express nodemon
```

## Start server

```bash
  npm run dev
```

## Running the app

```bash
# development
  docker-compose up --build
```

### Create environment

You need `.env` file set up in order for anything to work. A file in the root of your project to store sensitive data such as database credentials.

### Set up database

We created the database in PostgreSQL.
We installed the pg package, which we need for PostgreSQL

```bash
  npm install express pg
```

## Usage

Browse swagger documentation on - [localhost:${SERVER_PORT}/api-docs](http://localhost:5000/api-docs)
