# 🛒 ShopSphere – E-commerce & Inventory Management Platform

## 1. Project Introduction

ShopSphere is a full-stack E-commerce and Inventory Management application developed using the MERN stack.

The main purpose of this project is to build an online shopping platform where customers can browse products, manage their shopping carts, place orders, and manage their accounts.

It also provides an administrative dashboard where administrators can manage products, orders, inventory, coupons, and customer reviews.

This project brings customer shopping activities and store management operations together in one application.

## 2. Project Objectives

The main objectives of developing ShopSphere are:

- Build a responsive online shopping application.
- Implement secure user authentication and authorization.
- Develop product browsing and search functionality.
- Manage shopping cart operations.
- Implement checkout and payment workflow.
- Develop order management functionality.
- Manage product inventory and stock movements.
- Provide coupon and product review features.
- Build an admin dashboard for store management.
- Connect the frontend, backend, and database through REST APIs.

## 3. Technology Stack

The following technologies were used during development.

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application logic |
| React.js | Frontend development |
| Vite | Frontend development server and build tool |
| Tailwind CSS | Responsive UI styling |
| React Router | Client-side navigation |
| Context API | Global state management |
| Axios | API communication |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | Database modeling and operations |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Git & GitHub | Version control |

## 4. Application Architecture

ShopSphere follows a client-server architecture.

The application contains three main layers:

### Frontend
- Developed using React.js and Vite.
- Provides customer and administrator interfaces.
- Handles navigation, forms, and user interactions.
- Communicates with backend APIs using Axios.
- Uses Context API to manage shared application state.

### Backend
- Developed using Node.js and Express.js.
- Provides RESTful API endpoints.
- Handles authentication and authorization.
- Implements business logic and validation.
- Processes product, cart, order, coupon, inventory, and review operations.

### Database
- MongoDB is used to store application data.
- Mongoose is used to define schemas and interact with collections.
- Stores user, product, cart, order, inventory, coupon, and review information.

## 5. Development Workflow – Step by Step

The project was developed in different stages, starting from application setup and moving towards complete e-commerce functionality.

### Step 1: Project Planning and Environment Setup

- Analyzed the project requirements.
- Identified customer and administrator workflows.
- Selected the MERN stack.
- Created separate frontend and backend folders.
- Initialized React using Vite.
- Initialized Node.js and Express for backend development.
- Configured MongoDB connection.
- Organized the project into reusable folders and modules.

### Step 2: Frontend Structure and User Interface

- Created the main application layout.
- Implemented reusable components.
- Developed navigation and footer components.
- Configured React Router for page navigation.
- Created customer and admin layouts.
- Developed responsive pages for different application features.
- Used Tailwind CSS for styling and responsive design.

### Step 3: Backend Architecture and REST API Development

- Created the Express server.
- Connected the backend with MongoDB using Mongoose.
- Organized controllers, models, routes, and middleware.
- Implemented REST API endpoints.
- Separated business logic from route definitions.
- Added error-handling and asynchronous request utilities.

### Step 4: Authentication and Authorization

Implemented the authentication system using JWT and bcrypt.

The authentication workflow includes:

- User registration.
- Password hashing using bcrypt.
- User login.
- Access token generation.
- Refresh token generation.
- Protected backend routes.
- User authentication verification.
- Role-based authorization.
- Logout functionality.
- Forgot password and reset password functionality.

The application uses short-lived access tokens and refresh tokens to manage user sessions.

### Step 5: Product Management

Implemented product-related functionality.

- Display product listings.
- View individual product details.
- Search products.
- Manage product information.
- Retrieve product data through backend APIs.
- Support administrator product management.

### Step 6: Shopping Cart Management

Developed the shopping cart functionality.

- Add products to the cart.
- View cart items.
- Update product quantities.
- Remove products from the cart.
- Calculate cart totals.
- Manage cart state using Context API.
- Connect cart operations with backend APIs.

### Step 7: Checkout and Payment Workflow

Implemented the checkout process.

The workflow includes:

1. Customer reviews cart items.
2. Customer proceeds to checkout.
3. Checkout information is submitted.
4. Backend processes the order.
5. Customer continues through the payment flow.
6. Application displays the payment result.

A mock payment flow is used for demonstration purposes. It should not be considered a live payment gateway integration.

### Step 8: Order Management

Implemented order-related functionality.

- Create customer orders.
- Retrieve customer order information.
- Display order history.
- Allow administrators to manage orders.
- Support order status management.

### Step 9: Inventory Management

Developed inventory functionality for administrators.

- View inventory information.
- Manage product stock.
- Track inventory movements.
- Monitor available stock.
- Support inventory management through the admin dashboard.

### Step 10: Coupon Management

Implemented coupon-related functionality.

- Create and manage coupons.
- Retrieve coupon information.
- Support coupon-related operations.
- Integrate coupon functionality into the application workflow.

### Step 11: Product Reviews

Implemented product review functionality.

- Support customer product reviews.
- Store review information.
- Retrieve product reviews.
- Provide review management functionality.

### Step 12: Admin Dashboard

Developed an administrative interface to manage store operations.

The admin dashboard includes:

- Dashboard overview.
- Product management.
- Order management.
- Inventory management.
- Coupon management.
- Review management.

### Step 13: Frontend and Backend Integration

Connected the React frontend with the Express backend.

- Configured a reusable Axios instance.
- Created API service functions.
- Integrated frontend pages with backend endpoints.
- Managed API loading and error states.
- Connected authentication and user session management.
- Integrated customer and admin operations.

### Step 14: Testing and Debugging

Tested application functionality during development.

- Tested authentication APIs.
- Verified protected routes.
- Tested product APIs.
- Tested cart operations.
- Tested checkout and order workflows.
- Verified admin operations.
- Tested frontend and backend integration.
- Identified and fixed application errors.

### Step 15: Version Control and GitHub

Used Git and GitHub to manage project development.

Created separate branches for different development areas:

- `main` – Intended primary project branch.
- `develop` – Development integration branch.
- `backend` – Backend development.
- `frontend` – Frontend development.

Committed changes with meaningful commit messages and pushed the completed frontend and backend work to GitHub.

## 6. Main Application Modules

### Customer Module
- Registration and login.
- Product browsing.
- Product search.
- Product details.
- Shopping cart.
- Checkout.
- Mock payment workflow.
- Order history.
- Product reviews.

### Admin Module
- Admin authentication.
- Dashboard overview.
- Product management.
- Order management.
- Inventory management.
- Coupon management.
- Review management.

### Authentication Module
- User registration.
- Login and logout.
- JWT authentication.
- Access and refresh tokens.
- Protected routes.
- Role-based authorization.
- Password recovery.

## 7. Project Folder Structure

```text
ecommerce-inventory-management/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── products/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── customer/
│   │   │   └── products/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
└── README.md
```

## 8. Local Development Setup

Follow these steps to run the application locally.

### Prerequisites

Install the following tools:

- Node.js and npm.
- MongoDB or MongoDB Atlas account.
- Git.
- Visual Studio Code.

### Step 1: Clone the Repository

```bash
git clone https://github.com/RajuBadanakanti-cloud/ecommerce-inventory-management.git
```

Navigate into the project:

```bash
cd ecommerce-inventory-management
```

### Step 2: Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure the environment variables required by the backend application.

Example configuration categories:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_ACCESS_TOKEN=your_access_token_secret
JWT_SECRET_REFRESH_TOKEN=your_refresh_token_secret
FRONTEND_URL=http://localhost:5173
```

Use the actual MongoDB variable name expected by your backend configuration.

Start the backend using the start script defined in `backend/package.json`.

### Step 3: Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on the local Vite development URL displayed in the terminal.

## 9. Important Implementation Details

- Frontend and backend are maintained separately.
- REST APIs connect the frontend and backend.
- JWT is used for authentication.
- Passwords are hashed before storage.
- Protected middleware handles authentication checks.
- Context API manages shared frontend state.
- Axios handles API requests.
- MongoDB stores application data.
- Environment variables are used for sensitive configuration.
- The payment workflow uses a mock implementation for demonstration.

## 10. Future Enhancements

The following improvements can be considered in future versions:

- Real payment gateway integration.
- Payment webhook verification.
- Advanced sales analytics.
- Email notifications.
- Product image storage integration.
- Advanced product filtering.
- Shipment tracking.
- Refund workflow.
- Automated testing.
- Production deployment and monitoring.

## 11. Learning Outcomes

Through this project, I gained practical experience in:

- Full-stack application development.
- React component-based architecture.
- REST API development.
- MongoDB database integration.
- Authentication and authorization.
- JWT access and refresh token workflows.
- State management using Context API.
- Frontend and backend integration.
- E-commerce business workflows.
- Inventory and order management.
- Git and GitHub version control.
- Debugging and problem-solving.

## 12. Developer

**Developed by:** Raju Badanakanti & Nayan and Team9

**Project:** ShopSphere – E-commerce & Inventory Management Platform

**Technology:** MERN Stack

**GitHub Repository:**  
https://github.com/RajuBadanakanti-cloud/ecommerce-inventory-management

---

*This project was developed as a practical full-stack web development project to understand and implement real-world e-commerce and inventory management workflows.*