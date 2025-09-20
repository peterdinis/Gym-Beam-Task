# GymBeam Warehouse Optimization Server

## Overview

The **GymBeam Warehouse Optimization Server** is an HTTP API that helps optimize warehouse order picking.  
It calculates the most efficient picking sequence for a list of products, based on their locations in a warehouse and a worker's starting position.  

The project exposes endpoints for:
- Checking the server health (`GET /health`)
- Optimizing order picking (`POST /optimize`)
- Swagger API documentation (`/api-docs`)

This server integrates with the GymBeam Warehouse API to fetch real product positions and compute the optimized picking order using a custom optimization service.

---

## Features

- **Health Check**: Monitor server uptime, version, and status.
- **Order Optimization**: Compute the optimal picking route and distance for a set of products.
- **Error Handling**: Handles validation errors, warehouse API errors, and internal server errors gracefully.
- **Swagger Documentation**: Automatically generated API docs at `/api-docs`.
- **Unit tests and E2E tests**: All tests are written using the **Jest** framework, covering both unit and end-to-end scenarios.
---

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- GymBeam Warehouse API credentials

---

## Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Create .env.local file**

```bash
WAREHOUSE_API_BASE_URL=warehouse api url
WAREHOUSE_API_KEY=warehouse api key
PORT=your port
```

4. **Run the server**
```bash
pnpm run dev
```
