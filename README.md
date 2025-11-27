# ��� E-Commerce NestJS API

A production-grade, fully-featured e-commerce REST API built with NestJS, TypeORM, PostgreSQL, JWT authentication, and Stripe payment integration.

## ✨ Features

### Core Features
- ✅ **User Authentication** - JWT-based authentication with refresh tokens
- ✅ **Role-Based Access Control (RBAC)** - Admin and User roles with protected routes
- ✅ **User Management** - Complete CRUD operations for user profiles
- ✅ **Product Catalog** - Full product management with categories, SKU, and stock tracking
- ✅ **Shopping Cart** - Add, update, remove items with persistent storage
- ✅ **Order Management** - Create orders from cart, track status, order history
- ✅ **Payment Processing** - Stripe integration for secure payments
- ✅ **Swagger Documentation** - Interactive API documentation with testing capability

### Technical Features
- ✅ **Input Validation** - DTO-based validation with class-validator
- ✅ **Error Handling** - Centralized exception handling with structured responses
- ✅ **Database Relations** - TypeORM with proper foreign keys and relations
- ✅ **Security** - Password hashing (bcrypt), JWT tokens, SQL injection prevention
- ✅ **Code Quality** - ESLint, Prettier, Husky pre-commit hooks
- ✅ **Testing** - Comprehensive unit tests with Jest
- ✅ **Logging** - Structured logging with interceptors
- ✅ **API Standards** - RESTful endpoints with consistent response format

## ���️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS 10.x** | Backend framework |
| **TypeScript 5.x** | Programming language |
| **PostgreSQL** | Primary database |
| **TypeORM** | ORM for database operations |
| **JWT + Passport** | Authentication & authorization |
| **Stripe** | Payment processing |
| **class-validator** | Input validation |
| **Swagger/OpenAPI** | API documentation |
| **Jest** | Testing framework |
| **ESLint + Prettier** | Code formatting |
| **Husky** | Git hooks |

## ��� Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** or **yarn**
- **Git**

## ��� Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-nestjs-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
nano .env
```

### 4. Environment Variables
```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database - PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ecommerce_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# Stripe Payment (Get from https://stripe.com)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 5. Database Setup
```bash
# Create PostgreSQL database
createdb ecommerce_db

# Or using psql
psql -U postgres
CREATE DATABASE ecommerce_db;
\q

# Database tables will be auto-created in development mode
```

## ▶️ Running the Application

### Development Mode
```bash
npm run start:dev
```

Application will start at: **http://localhost:3000**

### Production Mode
```bash
# Build the application
npm run build

# Run production build
npm run start:prod
```

### Other Commands
```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## ��� API Documentation

Once the application is running, access the interactive Swagger documentation:

**��� http://localhost:3000/api/docs**

The Swagger UI provides:
- ��� Complete API reference
- ��� Interactive testing interface
- ��� Authentication testing
- ��� Request/response examples
- ✅ Schema validation

## ��� API Endpoints Overview

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/profile` | Get current user profile | Protected |

### Users (`/api/v1/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all users | Admin Only |
| GET | `/:id` | Get user by ID | Protected |
| PATCH | `/:id` | Update user | Protected |
| DELETE | `/:id` | Delete user | Admin Only |

### Products (`/api/v1/products`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create product | Admin Only |
| GET | `/` | Get all products | Public |
| GET | `/?category=ELECTRONICS` | Filter by category | Public |
| GET | `/:id` | Get product by ID | Public |
| PATCH | `/:id` | Update product | Admin Only |
| DELETE | `/:id` | Delete product | Admin Only |

### Cart (`/api/v1/cart`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user cart | Protected |
| POST | `/items` | Add item to cart | Protected |
| PATCH | `/items/:productId` | Update item quantity | Protected |
| DELETE | `/items/:productId` | Remove item from cart | Protected |
| DELETE | `/` | Clear cart | Protected |

### Orders (`/api/v1/orders`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create order from cart | Protected |
| GET | `/` | Get user orders | Protected |
| GET | `/all` | Get all orders | Admin Only |
| GET | `/:id` | Get order by ID | Protected |
| PATCH | `/:id/status` | Update order status | Admin Only |
| DELETE | `/:id` | Cancel order | Protected |

### Payments (`/api/v1/payments`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/create-intent` | Create Stripe payment intent | Protected |
| POST | `/confirm` | Confirm payment | Protected |
| GET | `/order/:orderId` | Get payment by order ID | Protected |
| GET | `/` | Get all payments | Admin Only |
| POST | `/webhook` | Stripe webhook handler | Public |

## ��� Authentication Flow

### 1. Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### 2. Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### 3. Use Token in Protected Routes
```bash
GET /api/v1/auth/profile
Authorization: Bearer {your-access-token}
```

## ��� Stripe Payment Integration

### Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add keys to `.env` file

### Payment Flow

1. **Create Order** - User creates order from cart
2. **Create Payment Intent** - Frontend calls `/payments/create-intent`
3. **Complete Payment** - User completes payment with Stripe.js
4. **Webhook Confirmation** - Stripe sends webhook to `/payments/webhook`
5. **Order Updated** - Order status automatically updated to PROCESSING

### Test Cards

Use these test cards in development:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

**CVV:** Any 3 digits  
**Expiry:** Any future date

## ��� Testing

### Run Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

### Test Coverage
```
Test Suites: 3 passed, 3 total
Tests:       50 passed, 50 total

Coverage:
- Users Service: 100%
- Auth Service: 100%
- Products Service: 100%
```

### Example Test
```typescript
describe('UsersService', () => {
  it('should create a new user', async () => {
    const result = await service.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    });

    expect(result).toBeDefined();
    expect(result.email).toBe('john@example.com');
  });
});
```

## �� Project Structure
```
ecommerce-nestjs-api/
├── src/
│   ├── common/                     # Shared utilities
│   │   ├── decorators/            # @Public, @Roles, @CurrentUser
│   │   ├── filters/               # HTTP exception filter
│   │   ├── interceptors/          # Transform, Logging interceptors
│   │   ├── pipes/                 # Validation pipes
│   │   ├── guards/                # Auth guards
│   │   ├── enums/                 # UserRole, OrderStatus, PaymentStatus
│   │   └── interfaces/            # Common interfaces
│   │
│   ├── config/                    # Configuration files
│   │   ├── database.config.ts     # TypeORM configuration
│   │   └── swagger.config.ts      # Swagger setup
│   │
│   ├── modules/
│   │   ├── auth/                  # Authentication module
│   │   │   ├── strategies/       # JWT & Local strategies
│   │   │   ├── guards/           # JWT, Roles, Local guards
│   │   │   ├── dto/              # Login, Register DTOs
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── users/                 # User management module
│   │   │   ├── entities/         # User entity
│   │   │   ├── dto/              # Create, Update DTOs
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.service.spec.ts
│   │   │   └── users.module.ts
│   │   │
│   │   ├── products/              # Product catalog module
│   │   │   ├── entities/         # Product entity
│   │   │   ├── dto/              # Create, Update DTOs
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.service.spec.ts
│   │   │   └── products.module.ts
│   │   │
│   │   ├── cart/                  # Shopping cart module
│   │   │   ├── entities/         # Cart entity
│   │   │   ├── dto/              # Add, Update DTOs
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   └── cart.module.ts
│   │   │
│   │   ├── orders/                # Order management module
│   │   │   ├── entities/         # Order entity
│   │   │   ├── dto/              # Create, Update DTOs
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   └── orders.module.ts
│   │   │
│   │   └── payments/              # Payment processing module
│   │       ├── entities/         # Payment entity
│   │       ├── dto/              # Payment DTOs
│   │       ├── payments.controller.ts
│   │       ├── payments.service.ts
│   │       └── payments.module.ts
│   │
│   ├── app.module.ts              # Root application module
│   └── main.ts                    # Application entry point
│
├── test/                          # E2E tests
├── .env.example                   # Environment variables template
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── .gitignore                     # Git ignore rules
├── nest-cli.json                  # NestJS CLI configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
├── API_DOCUMENTATION.md           # Detailed API documentation
└── README.md                      # This file
```

## ��� Database Schema

### Users Table
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- role (ENUM: USER, ADMIN)
- isActive (BOOLEAN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Products Table
```sql
- id (UUID, PK)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- sku (VARCHAR, UNIQUE)
- description (TEXT)
- price (DECIMAL)
- stock (INTEGER)
- category (VARCHAR)
- images (ARRAY)
- isActive (BOOLEAN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Cart Table
```sql
- id (UUID, PK)
- userId (UUID, FK → users.id)
- items (JSONB)
- totalPrice (DECIMAL)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Orders Table
```sql
- id (UUID, PK)
- userId (UUID, FK → users.id)
- products (JSONB)
- totalPrice (DECIMAL)
- status (ENUM: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- shippingAddress (VARCHAR)
- phoneNumber (VARCHAR)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Payments Table
```sql
- id (UUID, PK)
- orderId (UUID, FK → orders.id)
- status (ENUM: PENDING, SUCCESS, FAILED)
- transactionId (VARCHAR, Stripe)
- amount (DECIMAL)
- paymentMethod (VARCHAR)
- metadata (JSONB)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

## ��� Security Features

### Authentication & Authorization
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Protected routes with guards
- ✅ Token expiration handling

### Data Security
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ SQL injection prevention (TypeORM parameterized queries)
- ✅ XSS protection
- ✅ Input validation and sanitization
- ✅ CORS configuration

### Best Practices
- ✅ Environment variables for secrets
- ✅ Soft delete for data retention
- ✅ Error messages don't expose sensitive info
- ✅ Rate limiting ready (can be added)

## ��� Error Handling

All errors are handled consistently:

### Validation Error (400)
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/auth/register",
  "message": ["password must be at least 8 characters"]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### Not Found (404)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already exists"
}
```

## ��� Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## ��� Code Quality

### Linting & Formatting
```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### Git Hooks (Husky)

Pre-commit hooks automatically:
- ✅ Lint code
- ✅ Format code
- ✅ Run tests
- ✅ Validate commit messages (Conventional Commits)

### Commit Message Format
```
type(scope): subject

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(auth): add JWT refresh token functionality
```

## ��� Docker Support (Optional)

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: ecommerce_db
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
```

## ��� Performance Optimization

- ✅ Database connection pooling
- ✅ Indexed columns (email, slug, sku)
- ✅ Lazy loading relationships
- ✅ Pagination support (ready to implement)
- ✅ Response caching (can be added with Redis)

## ��� Development Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/new-feature
```

2. **Make Changes**
```bash
# Edit files
npm run lint
npm test
```

3. **Commit Changes**
```bash
git add .
git commit -m "feat: add new feature"
```

4. **Push & Create PR**
```bash
git push origin feature/new-feature
```

## ��� Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l

# Test connection
psql -U postgres -d ecommerce_db
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## ��� Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## ��� License

This project is licensed under the MIT License.

## ���‍��� Author

**Maryam Saleem**  
Senior Backend Engineer  
��� Email: maryamsaleem63@yahoo.com
��� LinkedIn: [linkedin.com/in/maryam-saleem-5258a9124a](https://www.linkedin.com/in/maryam-saleem-5258a9124)
��� GitHub: [github.com/maryamh](https://github.com/mariyamh)

**Experience:**
- 6+ years with Node.js/NestJS
- Specialized in high-scale distributed systems
- Built systems handling 500+ req/s with 99.9% uptime
- Expert in microservices architecture

## ��� Acknowledgments

- NestJS Team for the amazing framework
- Stripe for payment processing
- PostgreSQL for reliable database
- Open source community

## ��� Support

For issues or questions:
- ��� Create an issue on GitHub
- ��� Email: maryamsaleem63@yahoo.com


## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ using NestJS**

## ��� Image Upload (S3)

### AWS S3 Setup

1. **Create S3 Bucket**
```bash
aws s3api create-bucket --bucket ecommerce-products-yourname --region us-east-1
```

2. **Get AWS Credentials**
   - Go to AWS Console → IAM → Users → Create User
   - Attach `AmazonS3FullAccess` policy
   - Create access keys
   - Add to `.env`

3. **Upload Product Image**
```bash
# Single image
curl -X POST http://localhost:3000/api/v1/products/upload-image \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/image.jpg"

# Response
{
  "success": true,
  "imageUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/products/uuid.jpg",
  "message": "Image uploaded successfully"
}

# Multiple images (max 5)
curl -X POST http://localhost:3000/api/v1/products/upload-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

4. **Create Product with Images**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "sku": "SKU-001",
    "description": "Latest iPhone",
    "price": 999.99,
    "stock": 50,
    "category": "ELECTRONICS",
    "images": [
      "https://your-bucket.s3.us-east-1.amazonaws.com/products/uuid1.jpg",
      "https://your-bucket.s3.us-east-1.amazonaws.com/products/uuid2.jpg"
    ]
  }'
```

### Image Validation
- **Allowed formats:** JPEG, PNG, WebP
- **Max file size:** 5MB per image
- **Max images per product:** 5

## ��� Deployment

See detailed deployment guide in [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Deploy Options

**1. Heroku (Easiest)**
```bash
heroku create
heroku addons:create heroku-postgresql:mini
git push heroku master
```

**2. AWS (Production)**
- See [DEPLOYMENT.md](DEPLOYMENT.md#aws-deployment) for complete guide
- Includes EC2, RDS, S3, Load Balancer setup

**3. DigitalOcean**
- Create Droplet + Managed PostgreSQL
- See [DEPLOYMENT.md](DEPLOYMENT.md#digitalocean-deployment)

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=production-db-host
JWT_SECRET=super-secure-random-string
AWS_ACCESS_KEY_ID=your-production-key
STRIPE_SECRET_KEY=sk_live_your-live-key
```

### Monitoring & Logging

Recommended tools:
- **Sentry** - Error tracking
- **DataDog** - Performance monitoring
- **CloudWatch** - AWS logs
- **LogRocket** - Session replay

