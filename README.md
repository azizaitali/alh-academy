# ALH Academy - Next.js Tikkie & MongoDB Payment Portal

A Next.js application designed for tuition and course checkout with **MongoDB** persistence and **Tikkie / iDEAL** payments.

## Features

1. **Public Web Page**: Responsive form allowing users to select a course plan and enter their **Full Name** and **Email Address**.
2. **MongoDB Integration**:
   - When the user clicks **Pay**, a document is saved to the MongoDB collection **`payments`**.
   - Saved document schema:
     ```json
     {
       "name": "Alex van der Beek",
       "email": "alex@example.com",
       "reference": "ALH-2026-X9K2L",
       "createdAt": "2026-09-29T12:00:00.000Z",
       "amount": 49.00,
       "currency": "EUR"
     }
     ```
3. **Official Tikkie Payment Modal**:
   - Once saved to MongoDB, the official Tikkie modal opens with authentic Tikkie styling, amount, reference, and direct Tikkie portal integration (`tikkieUrl` iframe embed & open in new window button).
   - Features explicit action buttons: **Payment completed** and **Payment failed** as requested.
4. **Thank You & Payment Failed Status Screens**:
   - **Payment completed**: Saves `"completed"` status to MongoDB and displays a full receipt breakdown.
   - **Payment failed**: Displays an alert card with `"failed"` status saved to MongoDB, providing one-click options to **Retry Tikkie Payment** or edit details.
   - If the modal is dismissed via the close button, an on-page prompt asks the user to confirm whether the payment was completed or failed.
5. **Admin Portal (`/admin`) with Password Authentication**:
   - Secure admin authentication protected by `ADMIN_PASSWORD` (default: `admin123`).
   - **Traffic & Analytics**: Live tracking of visitor pageviews, total visits, device distribution (Desktop, Mobile, Tablet), browser breakdowns, conversion rates, and total revenue (€).
   - **Payment Records Monitoring**: Search and filter all payment transactions by status (`completed`, `failed`, `pending`) or reference/email.
   - **Settings & Pricing Editor**: Real-time management of the default Tikkie payment URL, course plan tuition pricing, academy contact info, and maintenance mode toggle with instant persistence in MongoDB.
6. **Live MongoDB Database Inspector**:
   - Built-in live inspector drawer to view and copy saved documents directly from the `payments` collection in both Table and JSON view modes, including live status badges (`completed`, `failed`, `pending`).

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB instance (local `mongodb://127.0.0.1:27017` or MongoDB Atlas cluster)

### 2. Environment Configuration
Review or customize [.env.local](file:///c:/Sources/alh-academy/.env.local):
```env
# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/alh_academy
MONGODB_DB=alh_academy

# Default Tikkie Payment Link
NEXT_PUBLIC_DEFAULT_TIKKIE_URL=https://tikkie.me/pay/ALHAcademy/course-fee

# Admin Password
ADMIN_PASSWORD=admin123
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the student checkout page or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

---

## API Endpoints

- **`POST /api/payments`**: Validates input, generates a unique reference, saves the payment document to MongoDB collection `payments`, and returns the Tikkie URL.
- **`GET /api/payments`**: Fetches recent payment records stored in the `payments` collection.
- **`PATCH /api/payments`**: Updates payment status (`completed`, `failed`).
- **`POST /api/traffic`**: Records visitor pageviews and client device/browser info.
- **`GET /api/settings`**: Public endpoint for active course prices, Tikkie URL, and academy settings.
- **`POST /api/admin/auth`**: Authenticates admin password and issues session token.
- **`GET /api/admin/traffic`**: Protected endpoint returning traffic metrics, visitor logs, and transaction lists.
- **`GET /api/admin/settings`** & **`POST /api/admin/settings`**: Protected endpoints to read and update live academy settings.
- **`GET /api/health`**: Tests MongoDB database connectivity and collection stats.

