# Personal Finance Tracker - Implementation Plan
 
## Project Overview
 
Build a modern Personal Finance Tracker application that allows users to manage multiple financial profiles, track credits and debits, categorize transactions, and visualize spending habits through analytics dashboards.
 
The application must be production-ready, scalable, maintainable, and follow modern frontend and backend best practices.
 
---
 
# Core Features
 
## Authentication
 
Users authenticate using Google OAuth.
 
Requirements:
 
* Google Sign In
* JWT-based backend authentication
* Auto user creation on first login
* Session persistence
* Logout support
 
---
 
## Profiles
 
A user can create multiple financial profiles.
 
Examples:
 
* Personal Wallet
* Savings Account
* Emergency Fund
* Travel Fund
 
Profile features:
 
* Create profile
* Edit profile
* Delete profile
* Initial balance
* Current balance
* View transaction history
 
---
 
## Categories
 
Categories are user-specific.
 
Examples:
 
* Food
* Fuel
* Salary
* Rent
* Entertainment
* Shopping
 
Features:
 
* Create category
* Edit category
* Delete category
* Category color
* Category icon (optional)
 
---
 
## Transactions
 
Every financial activity is recorded as a transaction.
 
Transaction Types:
 
* CREDIT
* DEBIT
 
Fields:
 
* Amount
* Title
* Notes
* Category
* Profile
* Transaction Date
 
Features:
 
* Create transaction
* Edit transaction
* Delete transaction
* Filter transactions
* Search transactions
 
---
 
## Profile Transfers
 
Users can transfer money between profiles.
 
Example:
 
Wallet -> Savings
 
Amount: 5000
 
System automatically creates:
 
* Debit transaction in source profile
* Credit transaction in destination profile
 
Transfer must be atomic.
 
---
 
## Dashboard
 
Display analytics and financial insights.
 
Dashboard widgets:
 
### Summary Cards
 
* Total Balance
* Monthly Income
* Monthly Expense
* Savings Rate
 
### Charts
 
* Daily Expense Trend
* Daily Income Trend
* Monthly Expense Trend
* Monthly Income Trend
* Income vs Expense Comparison
* Category Breakdown Pie Chart
 
### Tables
 
* Top Spending Categories
* Recent Transactions
* Highest Transactions
 
---
 
# Tech Stack
 
## Frontend
 
* React
* TypeScript
* Vite
* React Router
* TanStack Query (React Query)
* Axios
* React Hook Form
* Zod
* Shadcn UI
* Tailwind CSS
* Recharts
* Zustand
 
---
 
## Backend
 
* FastAPI
* SQLAlchemy 2.0
* Alembic
* Pydantic v2
* PostgreSQL
* JWT Authentication
 
---
 
## Database
 
PostgreSQL
 
Development:
 
Docker PostgreSQL Container
 
Production:
 
Managed PostgreSQL provider or self-hosted PostgreSQL
 
---
 
# Project Structure
 
## Frontend Structure
 
src/
 
app/
 
components/
 
features/
 
auth/
 
dashboard/
 
profiles/
 
transactions/
 
categories/
 
transfers/
 
services/
 
hooks/
 
routes/
 
store/
 
types/
 
utils/
 
pages/
 
layouts/
 
---
 
## Backend Structure
 
app/
 
api/
 
auth/
 
users/
 
profiles/
 
transactions/
 
categories/
 
dashboard/
 
transfers/
 
models/
 
schemas/
 
services/
 
repositories/
 
core/
 
database/
 
utils/
 
main.py
 
---
 
# Database Design
 
## users
 
Columns:
 
* id
* google_id
* email
* name
* avatar_url
* created_at
* updated_at
 
---
 
## profiles
 
Columns:
 
* id
* user_id
* name
* description
* initial_balance
* current_balance
* created_at
* updated_at
 
Relationships:
 
User -> Many Profiles
 
---
 
## categories
 
Columns:
 
* id
* user_id
* name
* color
* icon
* created_at
 
Relationships:
 
User -> Many Categories
 
---
 
## transactions
 
Columns:
 
* id
* profile_id
* category_id
* type
* amount
* title
* notes
* transaction_date
* created_at
* updated_at
 
Transaction Type Enum:
 
* CREDIT
* DEBIT
 
Relationships:
 
Profile -> Many Transactions
 
Category -> Many Transactions
 
---
 
## transfers
 
Columns:
 
* id
* source_profile_id
* destination_profile_id
* amount
* created_at
 
Transfer history must be retained.
 
---
 
# Balance Management
 
Current balance should be stored inside profile.
 
Whenever transaction is created:
 
CREDIT:
 
profile.balance += amount
 
DEBIT:
 
profile.balance -= amount
 
Whenever transaction is edited or deleted:
 
Balance must be recalculated safely.
 
All balance modifications must happen inside database transactions.
 
---
 
# Backend API Design
 
## Auth
 
POST /auth/google
 
GET /auth/me
 
POST /auth/logout
 
---
 
## Profiles
 
GET /profiles
 
GET /profiles/{id}
 
POST /profiles
 
PUT /profiles/{id}
 
DELETE /profiles/{id}
 
---
 
## Categories
 
GET /categories
 
POST /categories
 
PUT /categories/{id}
 
DELETE /categories/{id}
 
---
 
## Transactions
 
GET /transactions
 
GET /transactions/{id}
 
POST /transactions
 
PUT /transactions/{id}
 
DELETE /transactions/{id}
 
---
 
## Transfers
 
POST /transfers
 
GET /transfers
 
---
 
## Dashboard
 
GET /dashboard
 
Response should contain:
 
* totalBalance
* monthlyIncome
* monthlyExpense
* expenseTrend
* incomeTrend
* categoryBreakdown
* topCategories
* recentTransactions
 
Single endpoint preferred.
 
---
 
# Authentication Flow
 
Frontend:
 
1. User clicks Google Login
2. Google returns token
3. Frontend sends token to backend
4. Backend verifies token
5. Backend creates user if not exists
6. Backend issues JWT
7. Frontend stores JWT securely
 
Protected routes require JWT.
 
---
 
# Frontend Architecture
 
## State Management
 
Use Zustand only for:
 
* Auth State
* Theme State
 
Do NOT store server data in Zustand.
 
Use TanStack Query for:
 
* Profiles
* Transactions
* Dashboard
* Categories
 
Server data belongs in React Query.
 
---
 
# React Query Guidelines
 
Use:
 
* Query Keys
* Query Invalidation
* Optimistic Updates
 
Examples:
 
profiles
 
transactions
 
dashboard
 
categories
 
After transaction creation:
 
Invalidate:
 
* transactions
* profiles
* dashboard
 
---
 
# Form Management
 
Use:
 
* React Hook Form
* Zod Validation
 
Every form must have:
 
* Client Validation
* Server Validation
 
---
 
# UI Design
 
## Layout
 
Desktop:
 
Sidebar Layout
 
Sidebar:
 
* Dashboard
* Profiles
* Transactions
* Categories
* Transfers
* Settings
 
Mobile:
 
Responsive Drawer Navigation
 
---
 
## Dashboard Page
 
Sections:
 
1. Summary Cards
 
2. Expense Chart
 
3. Income Chart
 
4. Category Pie Chart
 
5. Recent Transactions
 
---
 
## Profiles Page
 
Display profile cards.
 
Each card shows:
 
* Name
* Balance
* Transaction Count
 
Actions:
 
* View
* Edit
* Delete
 
---
 
## Profile Details Page
 
Display:
 
* Balance
* Transactions
* Filters
 
Actions:
 
* Credit
* Debit
* Transfer
 
---
 
## Transactions Page
 
Features:
 
* Search
* Date Range Filter
* Category Filter
* Profile Filter
* Pagination
 
---
 
## Categories Page
 
CRUD operations for categories.
 
---
 
# Analytics Requirements
 
Generate analytics directly using SQL aggregation.
 
Avoid loading all transactions and calculating in memory.
 
Examples:
 
SUM()
 
COUNT()
 
GROUP BY
 
DATE_TRUNC()
 
Dashboard queries should be optimized.
 
---
 
# Error Handling
 
Backend:
 
Standard response structure.
 
Success:
 
{
"success": true,
"data": {}
}
 
Error:
 
{
"success": false,
"message": "Error message"
}
 
---
 
# Logging
 
Backend logging required.
 
Log:
 
* Authentication events
* Transaction creation
* Transfers
* Errors
 
Never log secrets.
 
---
 
# Security
 
Requirements:
 
* JWT authentication
* Ownership validation on every request
* Input validation
* SQL injection protection through ORM
* Rate limiting support
* Secure environment variables
 
A user must never access another user's data.
 
Every query must be scoped by user_id.
 
---
 
# Performance
 
Requirements:
 
* Pagination on transaction list
* Indexed database columns
* React Query caching
* Lazy loaded routes
* Dashboard aggregation queries
 
Indexes:
 
transactions(profile_id)
 
transactions(category_id)
 
transactions(transaction_date)
 
profiles(user_id)
 
categories(user_id)
 
---
 
# Future Enhancements
 
Phase 2:
 
* Budgets
* Spending Limits
* Recurring Transactions
* Savings Goals
* CSV Export
* PDF Statements
* Notifications
* Multi Currency Support
* AI Spending Insights
 
These features should not be implemented in Version 1 but architecture should allow future expansion.
 
---
 
# Definition of Done
 
Version 1 is complete when:
 
* Google authentication works
* Multiple profiles supported
* Categories supported
* Credit and debit transactions supported
* Transfers supported
* Dashboard analytics working
* Responsive UI implemented
* PostgreSQL persistence working
* JWT security implemented
* Production-ready API structure established
* All CRUD operations functional
* Basic tests passing