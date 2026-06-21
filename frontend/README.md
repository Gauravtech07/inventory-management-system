# Inventory Management System

## Overview

A full-stack Inventory Management System built using FastAPI, PostgreSQL, React, and Bootstrap.

The application allows users to manage products, customers, orders, and inventory stock through a responsive web interface.

---

## Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic

### Frontend

* React.js
* Axios
* React Router
* Bootstrap 5
* Bootstrap Icons

---

## Features

### Product Management

* Add Product
* Update Product
* Delete Product
* Search Products
* Pagination
* Low Stock Tracking

### Customer Management

* Add Customer
* Update Customer
* Delete Customer
* Search Customers
* Pagination

### Order Management

* Create Orders
* View Orders
* View Order Details
* Cancel Orders
* Automatic Stock Deduction
* Automatic Stock Restoration on Cancellation

### Dashboard

* Total Products
* Active Products
* Total Customers
* Active Customers
* Total Orders
* Pending Orders
* Cancelled Orders
* Low Stock Products

---

## Project Structure

inventory-management-system

├── backend

├── frontend

├── docker-compose.yml

└── README.md

---

## Backend Setup

cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload

API Documentation:

http://localhost:8000/docs

---

## Frontend Setup

cd frontend

npm install

npm run dev

Frontend URL:

http://localhost:5173

---

## Environment Variables

Create a .env file inside backend folder:

DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db

---

## Docker Setup

docker-compose up --build

---




## Author

Gaurav Jaiswal
