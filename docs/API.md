# API Reference Document

## Authentication `[POST]`
- `/api/v1/auth/login` (body: `email`, `password`)
- `/api/v1/auth/register` (body: `email`, `name`, `password`)
- `/api/v1/auth/refresh` (body: `token`)

## Products `[GET, POST, PUT, DELETE]`
- `/api/v1/products` : Get paginated list of catalog
- `/api/v1/products/:id` : Get single product
- `/api/v1/products` `POST`: Create item (requires Manager)
- `/api/v1/products/:id` `DELETE`: Delete item (requires Admin)

## Inventory `[GET, PATCH]`
- `/api/v1/inventory`
- `/api/v1/inventory/low-stock`
- `/api/v1/inventory/:id` `PATCH` (body: `quantity`)

## Sales `[GET, POST]`
- `/api/v1/sales`
- `/api/v1/sales/summary`
- `/api/v1/sales` `POST` (body: `product_id`, `quantity`, `sale_date`, `region`, `channel`)

## Forecast `[POST]`
- `/api/v1/forecast/:productId` (body: `horizon_days`)

## Python FastAPI Service (Internal)
- `POST http://localhost:8000/predict`
- `POST http://localhost:8000/retrain`
