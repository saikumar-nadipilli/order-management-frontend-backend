# Inventory & Order Management System

Production-ready full-stack application for managing **products**, **customers**, **orders**, and **inventory**, built per the technical assessment specification.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (JavaScript), Vite, React Router |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Containers | Docker, Docker Compose |

## Features

### API (Backend)
- **Products**: CRUD at `/products`
- **Customers**: Create, list, get, delete at `/customers`
- **Orders**: Create, list, get, delete at `/orders`
- **Dashboard**: Summary at `/dashboard/summary`

### Business Rules
- Product SKU is unique
- Customer email is unique
- Stock quantity cannot be negative
- Orders blocked when inventory is insufficient
- Creating an order reduces stock automatically
- Order total is calculated by the backend
- Proper HTTP status codes and validation errors

### Frontend
- Responsive UI (desktop & mobile)
- Product, customer, and order management
- Dashboard with totals and low-stock alerts
- Form validation and success/error messages

## Quick Start (Docker)

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Build and run all services:
   ```bash
   docker compose up --build
   ```

3. Open the app:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API docs**: http://localhost:8000/docs

## Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL to your PostgreSQL instance
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
# Create frontend/.env with: VITE_API_URL=http://localhost:8000
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | List products |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| POST | `/customers` | Create customer |
| GET | `/customers` | List customers |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer |
| POST | `/orders` | Create order |
| GET | `/orders` | List orders |
| GET | `/orders/{id}` | Get order |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |
| GET | `/dashboard/summary` | Dashboard stats |

### Example: Create Order
```json
POST /orders
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

## Docker Hub (Backend Image)

Build and push your backend image:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend
docker login
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

Replace `YOUR_DOCKERHUB_USERNAME` with your Docker Hub username for submission.

## Deployment

### Backend (Render / Railway / Fly.io)

1. Deploy the `backend` folder as a web service.
2. Set environment variables:
   - `DATABASE_URL` — PostgreSQL connection string from your host
   - `CORS_ORIGINS` — your frontend URL (e.g. `https://your-app.vercel.app`)
3. Use the production Dockerfile in `backend/Dockerfile`.
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (set port per platform).

**Render example**: New Web Service → connect GitHub repo → Root Directory: `backend` → add PostgreSQL add-on → set `CORS_ORIGINS`.

### Frontend (Vercel / Netlify)

1. Deploy the `frontend` folder.
2. Set build environment variable:
   - `VITE_API_URL` = your deployed backend URL (e.g. `https://your-api.onrender.com`)
3. Build command: `npm run build`
4. Output directory: `dist`

**Vercel**: Import repo → Root Directory: `frontend` → add `VITE_API_URL` → Deploy.

After deployment, confirm the frontend can reach `/health` and `/products` on the backend URL.

## Submission Checklist

- [ ] GitHub repository with frontend + backend
- [ ] Docker Hub link for backend image
- [ ] Live frontend URL (Vercel/Netlify)
- [ ] Live backend API URL (Render/Railway/Fly.io)
- [ ] `docker compose up` works locally

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## License

MIT — for educational/assessment use.
