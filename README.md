# KhataX — Smart Credit, Billing & Business Management Platform

KhataX is a business management platform designed for small retailers—such as grocery stores, general retail shops, and pharmacies—that need a reliable way to manage customer credit, billing, inventory, payments, and business reports in one place.

It aims to replace fragmented paper khatas, notebooks, spreadsheets, and manual calculations with a connected digital workflow. The long-term product direction includes AI-assisted business queries, while the backend remains responsible for financial calculations, authorization, data validation, and business rules.

## Contents

- Objectives
- Core workflows
- Technology stack
- Architecture
- Backend modules and API routes
- Repository structure
- Local setup
- Configuration
- Authentication
- Development status
- Security and data integrity
- Troubleshooting

## Objectives

KhataX is intended to help small businesses:

- Maintain customer records and monitor outstanding credit.
- Create and manage invoices for sales.
- Track products, stock levels, and inventory transactions.
- Record manual payments and support online payment processing through the configured payment gateway.
- Maintain customer ledger history and reconcile payments with outstanding balances.
- Review sales, payment, and inventory reports with date filters.
- Ask role-aware questions about business information through an AI assistant.
- Keep shop-scoped records separated and enforce access through the backend.

## Core workflows

### Sale and credit

1. A shop owner selects a customer and adds products to a sale.
2. The system records the invoice and its totals.
3. Relevant inventory, ledger, and outstanding records are connected according to the implemented backend rules.
4. The shop owner can inspect the invoice and the customer's balance.

### Payment collection

1. A payment is recorded against a customer and, optionally, an invoice.
2. The backend validates the payment and prevents supported duplicate or overpayment cases.
3. The payment is associated with ledger and invoice payment-state updates where applicable.
4. Payment history and reports provide a record of the transaction.

### Business reporting

Shop owners can request sales, payment, and inventory reports, optionally filtered by a date range. Report calculations come from the backend; the frontend is responsible for displaying them in understandable cards, tables, filters, and charts.

### AI-assisted queries

The AI endpoint is intended to answer role-appropriate questions using backend-provided tools and business data. The model should not bypass authorization or access MongoDB directly; business data access is mediated by backend services and tools.

## Technology stack

### Backend

- Node.js
- TypeScript
- Express
- MongoDB Atlas
- Mongoose
- JWT-based authentication
- Razorpay integration for online payments
- Google GenAI SDK for the AI feature

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod and `@hookform/resolvers`
- Recharts
- Lucide React

## Architecture

The project is organized as a client/server application:

```text
C:\KhataX
├── client/   # React + TypeScript frontend
└── server/   # Express + TypeScript API
```

### Request flow

```text
React page/component
        ↓
Feature hook / API function
        ↓
Shared Axios client
        ↓
Express route and middleware
        ↓
Controller and service/business rules
        ↓
Mongoose models
        ↓
MongoDB Atlas
```

The backend is the source of truth for balances, invoice/payment status, ownership checks, and business operations. The frontend should present and validate user input but must not independently declare a payment successful or replace backend financial calculations.

## Backend modules and API routes

The API base URL used by the local frontend is `http://localhost:5000/api`.

### Authentication — `/api/auth`

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate and receive a token |
| `GET` | `/api/auth/profile` | Get the authenticated profile |

### Shops — `/api/shops`

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/shops` | Create a shop |
| `GET` | `/api/shops` | List the authenticated owner's shops |
| `GET` | `/api/shops/:id` | Get a shop |
| `PUT` | `/api/shops/:id` | Update a shop |
| `PATCH` | `/api/shops/:id/deactivate` | Deactivate a shop |

### Customers

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/shops/:shopId/customers` | Create a customer |
| `GET` | `/api/shops/:shopId/customers` | List customers |
| `GET` | `/api/shops/:shopId/customers/:customerId` | Get customer details |
| `PUT` | `/api/shops/:shopId/customers/:customerId` | Update a customer |
| `PATCH` | `/api/shops/:shopId/customers/:customerId/deactivate` | Deactivate a customer |

### Products

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/shops/:shopId/products` | Create a product |
| `GET` | `/api/shops/:shopId/products` | List products |
| `GET` | `/api/shops/:shopId/products/:productId` | Get product details |
| `PUT` | `/api/shops/:shopId/products/:productId` | Update a product |
| `PATCH` | `/api/shops/:shopId/products/:productId/deactivate` | Deactivate a product |

### Inventory

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/shops/:shopId/products/:productId/inventory` | Record an inventory transaction |

Supported inventory transaction types include `PURCHASE`, `SALE`, `RETURN`, `DAMAGE`, `EXPIRY`, and `ADJUSTMENT`.

### Ledger

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/shops/:shopId/ledger` | Create a ledger entry |
| `GET` | `/api/shops/:shopId/customers/:customerId/ledger` | Retrieve a customer's ledger |

Ledger entry types include `CREDIT`, `DEBIT`, and `ADJUSTMENT`.

### Invoices / Billing

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/shops/:shopId/invoices` | Create an invoice |
| `GET` | `/api/shops/:shopId/invoices` | List invoices |
| `GET` | `/api/shops/:shopId/invoices/:invoiceId` | Get invoice details |
| `PATCH` | `/api/shops/:shopId/invoices/:invoiceId/cancel` | Cancel an invoice |

### Payments

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/shops/:shopId/payments` | Record a manual payment |
| `GET` | `/api/shops/:shopId/customers/:customerId/payments` | Retrieve a customer's payment records |
| `POST` | `/api/shops/:shopId/invoices/:invoiceId/payment-order` | Create an online payment order |
| `POST` | `/api/shops/:shopId/payments/razorpay/verify` | Verify a gateway payment |

A Razorpay webhook is handled on the backend and is not a browser-facing frontend route. Confirm the configured webhook URL and payment-history route directly against the current backend route files before publishing the API externally.

### Reports

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/shops/:shopId/reports/sales` | Sales report |
| `GET` | `/api/shops/:shopId/reports/payments` | Payment report |
| `GET` | `/api/shops/:shopId/reports/inventory` | Inventory report |

Reports support date-range filtering through the backend's `from` and `to` query parameters where implemented.

### AI

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/ai/chat` | Submit a role-aware AI chat request |

All protected endpoints must be called with a valid JWT in the `Authorization: Bearer <token>` header. Shop-scoped requests must use the shop ID returned by the authenticated user's shop data; do not hardcode a shop ID in frontend environment variables.

## Repository structure

The frontend follows a feature-based architecture. The main directories are expected to be:

```text
client/
├── public/
├── src/
│   ├── app/                # App entry, providers, router
│   ├── components/         # Shared UI, feedback, navigation
│   ├── config/             # Environment configuration
│   ├── features/
│   │   ├── auth/
│   │   ├── shops/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── ledger/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── reports/
│   │   └── ai/
│   ├── layouts/            # Auth, owner, and customer layouts
│   ├── lib/                # Shared API client, auth, query client
│   ├── utils/
│   ├── constants/
│   └── types/
├── .env
└── package.json

server/
└── src/                    # Express application and backend modules
```

## Local setup

### Prerequisites

- Node.js and npm
- A configured MongoDB Atlas cluster
- Backend environment variables configured locally
- Razorpay and AI credentials if you are testing those integrations

### 1. Configure the backend

Create or update `server/.env` using the variable names expected by the current backend configuration. Typical values include a MongoDB connection URI, JWT secret, AI API key, and Razorpay credentials. Use placeholders in documentation and never commit real credentials.

Ensure the Atlas network access rules allow connections from your development environment. Start the backend from the repository's server directory:

```powershell
cd C:\KhataX\server
npm install
npx tsx src/server.ts
```

The expected local API address is:

```text
http://localhost:5000
```

The exact environment variable names and required values should be checked in the current server configuration and `.env.example`, if present.

### 2. Configure the frontend

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Install dependencies and start the Vite development server:

```powershell
cd C:\KhataX\client
npm install
npm run dev
```

Vite normally serves the application at `http://localhost:5173`.

### 3. Build the frontend

```powershell
cd C:\KhataX\client
npm run build
```

Run the frontend and backend in separate terminal windows. If browser requests fail, check the backend startup logs, the browser Network/Console panels, the `VITE_API_BASE_URL` value, and the Express CORS configuration for the frontend origin.

## Configuration

### Frontend environment variables

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for API requests | `http://localhost:5000/api` |

Vite exposes variables prefixed with `VITE_` to browser code. Never put database credentials, private API keys, payment secrets, or JWT signing secrets in frontend environment variables.


## Project vision

KhataX aims to give small retailers one dependable platform for customer credit, billing, inventory, payments, ledger tracking, reporting, and AI-assisted business insight. The frontend will expose these capabilities through a clear role-aware user experience while the backend remains authoritative for data integrity and business operations.
