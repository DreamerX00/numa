# ✨ NUMA - Premium E-commerce Platform

<div align="center">

![NUMA Logo](./public/numaLogo.png)

**A modern, scalable e-commerce platform built with Next.js 15, featuring comprehensive admin controls, secure payments, and exceptional user experience.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Demo](#) • [📖 Documentation](#features) • [🛠️ Installation](#installation) • [🤝 Contributing](#contributing)

</div>

---

## 🎯 Overview

NUMA is a production-ready e-commerce platform designed for jewelry and luxury goods retailers. Built with modern web technologies, it offers a seamless shopping experience with robust admin capabilities, secure payment processing, and comprehensive inventory management.

### 🌟 Key Highlights

- **🔐 Secure Authentication** - Firebase Auth with session-based security
- **💳 Payment Integration** - Razorpay with comprehensive error handling
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **⚡ Performance Optimized** - Next.js 15 with Turbopack for lightning-fast builds
- **🛡️ Type-Safe** - Full TypeScript implementation with strict typing
- **🎨 Modern UI** - Beautiful components with Framer Motion animations
- **📊 Admin Dashboard** - Complete inventory and order management system

---

## ✨ Features

### 🛍️ **Customer Experience**
- **Product Catalog** - Advanced search, filtering, and categorization
- **Shopping Cart** - Persistent cart with real-time updates
- **Wishlist Management** - Save products for later
- **User Profiles** - Account management with order history
- **Reviews & Ratings** - Product feedback system with image uploads
- **Order Tracking** - Real-time order status updates
- **Responsive Design** - Optimized for all devices

### 👨‍💼 **Admin Panel**
- **Product Management** - CRUD operations with image handling
- **Order Processing** - Complete order lifecycle management
- **User Management** - Customer accounts and analytics
- **Inventory Tracking** - Stock levels and alerts
- **Analytics Dashboard** - Sales metrics and insights
- **Content Management** - Category and brand management

### 🔧 **Technical Features**
- **Authentication** - Secure Firebase Auth with custom claims
- **Payment Processing** - Razorpay integration with webhook handling
- **Image Management** - Cloudinary integration for optimized media
- **Email System** - Automated notifications and confirmations
- **Error Handling** - Custom error pages with fallback images
- **Rate Limiting** - API protection and security measures
- **SEO Optimized** - Meta tags, structured data, and sitemap

---

## 🏗️ Architecture

```
📦 NUMA E-commerce Platform
├── 🎨 Frontend (Next.js 15 + TypeScript)
│   ├── App Router with RSC
│   ├── Tailwind CSS + shadcn/ui
│   ├── Framer Motion animations
│   └── Progressive Web App features
├── 🔐 Authentication (Firebase)
│   ├── Client-side SDK
│   ├── Server-side session management
│   └── Role-based access control
├── 💾 Database (MongoDB Atlas + Prisma)
│   ├── Type-safe database operations
│   ├── Optimized queries
│   └── Data validation
├── 💳 Payments (Razorpay)
│   ├── Secure payment processing
│   ├── Webhook handling
│   └── Order management
└── ☁️ Infrastructure
    ├── Cloudinary (Media)
    ├── Vercel (Hosting)
    └── Email service integration
```

---

## 🛠️ Installation

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **MongoDB Atlas** account
- **Firebase** project
- **Razorpay** account
- **Cloudinary** account (optional)

### 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/DreamerX00/numa.git
   cd numa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables (see [Environment Variables](#environment-variables))

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/numa"

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin (Private)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_your-key-id"
RAZORPAY_KEY_SECRET="your-secret-key"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="instagram_posts"

# Email (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

---

## 🎯 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login with Firebase ID token |
| `POST` | `/api/auth/logout` | User logout and session cleanup |
| `GET` | `/api/auth/me` | Get current user profile |

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products with filters |
| `GET` | `/api/products/[id]` | Get product by ID |
| `POST` | `/api/products` | Create new product (Admin) |
| `PUT` | `/api/products/[id]` | Update product (Admin) |
| `DELETE` | `/api/products/[id]` | Delete product (Admin) |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | Get user orders |
| `POST` | `/api/orders` | Create new order |
| `GET` | `/api/orders/[id]` | Get order details |
| `PUT` | `/api/orders/[id]` | Update order status (Admin) |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature |
| `POST` | `/api/payments/webhook` | Handle payment webhooks |

---

## 📱 Pages & Features

### 🏠 **Customer Pages**
- **Homepage** (`/`) - Featured products and categories
- **Products** (`/product/[slug]`) - Detailed product pages with reviews
- **Collections** (`/collections/[slug]`) - Category browsing
- **Search** (`/search`) - Advanced product search and filtering
- **Cart** (`/cart`) - Shopping cart management
- **Checkout** (`/checkout`) - Secure checkout process
- **Profile** (`/profile`) - User account management
- **Orders** (`/orders`) - Order history and tracking
- **Wishlist** (`/wishlist`) - Saved products

### 👨‍💼 **Admin Pages**
- **Dashboard** (`/admin`) - Analytics and overview
- **Products** (`/admin/products`) - Product management
- **Orders** (`/admin/orders`) - Order processing
- **Users** (`/admin/users`) - Customer management
- **Analytics** (`/admin/analytics`) - Sales insights
- **Settings** (`/admin/settings`) - System configuration

---

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Automatic deployments on push to main

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Conventional Commits** for commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Lead Developer** - [@DreamerX00](https://github.com/DreamerX00)
- **Frontend Developer** - [@Tan9isha](https://github.com/Ta9isha)

---

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Prisma** team for the excellent database toolkit
- **shadcn** for the beautiful UI components
- **Vercel** for hosting and deployment
- **MongoDB** for the database platform

---

## 📞 Support

- **Documentation** - [Project Wiki](#)
- **Issues** - [GitHub Issues](https://github.com/DreamerX00/numa/issues)
- **Email** - support@numa.com

---

<div align="center">

**Made with ❤️ for the jewelry industry**

[⬆ Back to Top](#-numa---premium-e-commerce-platform)

</div>
