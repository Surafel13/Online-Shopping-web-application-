<div align="center">

# SHEGER SHOP

### Modern E-Commerce Platform

A full-stack e-commerce platform designed to provide a seamless online shopping experience, efficient store management, and secure administrative operations.

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Framework-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br />

**Built for modern commerce. Designed for a better shopping experience.**

</div>

---

## Overview

**Sheger Shop** is a full-stack e-commerce application that brings customers and store administrators together through a centralized shopping and management platform.

The application provides customers with an intuitive storefront for discovering products, managing shopping carts, placing orders, and interacting with customer support.

It also includes dedicated administrative dashboards that allow administrators to manage products, categories, customers, orders, reviews, and platform operations through role-based permissions.

The system follows a modular architecture with a React-based frontend and a TypeScript-powered Express backend.

---

## Platform Highlights

<div align="center">

| Customer Experience | Administration | Platform Management |
|:---:|:---:|:---:|
| Product Discovery | Admin Dashboard | Admin Management |
| Shopping Cart | Product Management | Role Management |
| Wishlist | Category Management | Permission Control |
| Checkout | Order Management | Access Control |
| Reviews & Ratings | Customer Management | Platform Settings |
| Notifications | Analytics & Reports | Activity Management |
| Customer Support | Support Management | FAQ Management |

</div>

---

## Core Features

### 1. Customer Platform

- Secure user registration and authentication.
- Browse products and explore categories.
- Product details and product reviews.
- Shopping cart management.
- Wishlist management.
- Checkout and order management.
- Customer profile management.
- Order history and tracking.
- Notifications.
- Customer support ticket creation.
- Real-time support conversations.
- Light and dark theme support.

### 2. Admin Dashboard

A dedicated administrative interface for managing daily store operations.

- Dashboard overview and statistics.
- Product management.
- Category management.
- Customer management.
- Order management.
- Sales and revenue analytics.
- Customer support management.
- FAQ management.
- Administrative settings.

### 3. Super Admin Dashboard

A centralized management environment for controlling platform administration and access permissions.

- Super Admin dashboard.
- Administrator account management.
- Role-based access control (RBAC).
- Permission management.
- Permission matrix.
- Product and category administration.
- Order and payment management.
- Review management.
- Platform-wide administrative operations.

### 4. Customer Support System

An integrated support system designed to improve communication between customers and administrators.

- Support ticket creation.
- Ticket status management.
- Ticket conversations.
- Real-time messaging.
- File attachments.
- FAQ management.
- Administrative ticket handling.

### 5. Security and Access Control

Security is integrated into both frontend and backend application layers.

- JWT-based authentication.
- Password hashing using bcryptjs.
- Role-based authorization.
- Permission-based access control.
- Protected frontend routes.
- Backend authentication middleware.
- Request validation using Zod.
- HTTP security headers using Helmet.
- Centralized error handling.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface development |
| TypeScript | Static type safety |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Utility-first styling |
| Redux Toolkit | Global state management |
| React Router | Client-side navigation |
| Axios | HTTP requests |
| Motion | UI animations |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| TypeScript | Type safety |
| MongoDB | NoSQL database |
| Mongoose | Database modeling |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Zod | Data validation |
| Multer | File upload handling |
| Helmet | HTTP security |
| Winston | Application logging |
| Morgan | HTTP request logging |
| Swagger | API documentation |

### External Services

| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database hosting |
| Cloudinary | Image and media storage |

---

## System Architecture

The application separates frontend responsibilities from backend business logic and database operations.

```text
                       SHEGER SHOP
                            |
              +-------------+-------------+
              |                           |
         CLIENT SIDE                 SERVER SIDE
              |                           |
       React + TypeScript          Node.js + Express
              |                           |
       Redux Toolkit              Middleware Layer
              |                           |
       React Router                 Controller Layer
              |                           |
       API Services                  Service Layer
              |                           |
              +-------- HTTP API ----------+
                                          |
                                    Repository Layer
                                          |
                                        Models
                                          |
                                       MongoDB
                                          |
                              +-----------+-----------+
                              |                       |
                          Cloudinary              Logging
```

### Backend Architecture

The backend follows a layered architecture that separates HTTP handling, business logic, and database operations.

```text
Client Request
      |
      v
    Routes
      |
      v
  Middleware
      |
      v
 Controller
      |
      v
   Service
      |
      v
 Repository
      |
      v
   Database
```

| Layer | Responsibility |
|---|---|
| Routes | Define API endpoints |
| Middleware | Handle authentication, authorization, and validation |
| Controllers | Handle incoming requests and outgoing responses |
| Services | Implement application business logic |
| Repositories | Handle database queries and operations |
| Models | Define database schemas and document structures |

---

## Project Structure

The project is organized into two main applications: `client` and `server`.

### Frontend Structure

```text
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── shared/
│   │   └── ui/
│   ├── config/
│   ├── features/
│   │   ├── admin/
│   │   ├── superadmin/
│   │   └── support/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   ├── admin/
│   │   ├── superadmin/
│   │   └── support/
│   ├── redux/
│   │   └── slices/
│   ├── services/
│   ├── types/
│   └── utils/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Backend Structure

```text
server/
├── logs/
├── src/
│   ├── config/
│   ├── database/
│   ├── interface/
│   ├── middleware/
│   ├── modules/
│   │   ├── admins/
│   │   ├── auth/
│   │   ├── catagory/
│   │   ├── notifications/
│   │   ├── orders/
│   │   ├── permissions/
│   │   ├── product/
│   │   ├── rbac/
│   │   ├── review/
│   │   ├── superadmin/
│   │   ├── support/
│   │   ├── users/
│   │   └── wishlist/
│   ├── seeds/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

---

## Authentication and Authorization

The application uses JWT-based authentication combined with role-based and permission-based authorization.

### User Roles

| Role | Description |
|---|---|
| Customer | Access shopping, cart, wishlist, orders, reviews, and support features |
| Admin | Manage store operations according to assigned permissions |
| Super Admin | Manage administrators, permissions, and platform-wide operations |

### Authorization Flow

1. A user authenticates using their credentials.
2. The server validates the credentials.
3. Authentication tokens are issued.
4. Protected endpoints verify the user's authentication.
5. Role and permission middleware determine access.
6. Authorized requests proceed to the appropriate controller.

Registration is designed for customer and admin-managed account creation, with elevated administrative access controlled separately.

---

## API Modules

The backend is divided into independent modules to improve maintainability and scalability.

| Module | Responsibility |
|---|---|
| Auth | Authentication and session management |
| Users | User account management |
| Admins | Administrative operations |
| Products | Product management |
| Categories | Category management |
| Orders | Order processing |
| Wishlist | Wishlist operations |
| Reviews | Product reviews and ratings |
| Notifications | Notification management |
| Support | Customer support and ticket management |
| Permissions | Permission management |
| RBAC | Role-based access control |
| Super Admin | Platform administration |

---

## Getting Started

Follow the instructions below to set up the project locally.

### Prerequisites

Make sure the following tools are installed:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/Surafel13/Online-Shopping-web-application-.git

cd Online-Shopping-web-application-
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
pnpm install
```

Create your environment configuration:

```bash
cp .env.example .env
```

Configure the required environment variables in your `.env` file.

Start the development server using the `dev` script defined in `server/package.json`.

### 3. Frontend Setup

Open another terminal from the project root:

```bash
cd client
```

Install dependencies:

```bash
pnpm install
```

Create the frontend environment file:

```bash
cp .env.example .env
```

Configure the backend API URL and other required frontend settings.

Start the frontend using the `dev` script defined in `client/package.json`.

---

## Environment Variables

The application uses environment variables to manage configuration and sensitive credentials.

### Backend Configuration

The backend requires configuration for:

| Variable | Description |
|---|---|
| NODE_ENV | Application environment |
| PORT | Backend server port |
| DATABASE_URL | MongoDB connection string |
| JWT_SECRET | Access token secret |
| JWT_EXPIRES_IN | Access token expiration |
| CLIENT_URL | Frontend application origin |
| CLOUDINARY_CLOUD_NAME | Cloudinary account name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |

Use the exact variable names expected by your server configuration.

### Frontend Configuration

Configure the backend API base URL using the environment variable expected by the frontend API configuration.

**Security Notice:** Never commit `.env` files, passwords, database credentials, API secrets, or JWT secrets to version control.

---

## API Documentation

The backend includes Swagger/OpenAPI configuration for documenting API endpoints.

After starting the backend, navigate to the Swagger documentation route configured in the server to explore available endpoints and their request/response structures.

---

## Development Principles

The project follows these engineering principles:

- Modular application architecture.
- Separation of concerns.
- Reusable frontend components.
- Strong TypeScript typing.
- Centralized API communication.
- Repository-based database operations.
- Consistent request validation.
- Role and permission-based access control.
- Environment-based configuration.
- Centralized application error handling.

---

## Future Improvements

Potential enhancements for future development include:

- Redis-based caching and performance optimization.
- Advanced product search and filtering.
- Enhanced sales and business analytics.
- Automated unit and integration testing.
- CI/CD pipeline integration.
- Application monitoring and observability.
- Additional payment gateway integrations.
- Improved product recommendation functionality.

---

## Author

<div align="center">

### Surafel Tesfaye

**Software Engineering Student | Full-Stack Developer**

[![GitHub](https://img.shields.io/badge/GitHub-Surafel13-181717?style=for-the-badge&logo=github)](https://github.com/Surafel13)

<br />

Building practical applications through thoughtful engineering and continuous learning.

</div>

---

<div align="center">

**SHEGER SHOP**

*Bringing a better shopping experience to everyone.*

© 2026 Sheger Shop. All rights reserved.

</div>
