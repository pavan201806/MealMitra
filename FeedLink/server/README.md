# MealMitra Spring Boot Server

Complete Spring Boot backend for the MealMitra (FEEDILINK) food donation platform. This is a full migration from the Node.js backend with 100% functional parity.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Web** - REST API
- **Spring Data JPA** - Database access
- **Spring Security** - Authentication & Authorization
- **H2 Database** - In-memory/file-based database
- **JWT (JJWT)** - Token-based authentication
- **Lombok** - Boilerplate reduction
- **Maven** - Build tool

## Features

- ✅ User authentication (register, login, JWT)
- ✅ Role-based authorization (donor, volunteer, ngo, admin)
- ✅ Donation management (create, assign, complete)
- ✅ AI service integration for donation orchestration
- ✅ Location normalization with city lookup
- ✅ Volunteer and NGO listing for AI service
- ✅ Admin dashboard (users, donations)

## Prerequisites

- Java 17 or higher
- Maven 3.6+

## Setup Instructions

### 1. Clone/Navigate to Project

```bash
cd D:\codeverse\Events\Mind_Matrix\MealMitra\server
```

### 2. Build the Project

```bash
mvn clean install
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

The server will start on **http://localhost:5000**

### 4. Access H2 Console (Optional)

- URL: http://localhost:5000/h2-console
- JDBC URL: `jdbc:h2:file:./data/mealmitra`
- Username: `sa`
- Password: (leave blank)

## Environment Variables

Create a `.env` file or set environment variables:

```bash
# JWT Secret (default: feedilink_secret_key_change_in_production)
JWT_SECRET=your_secret_key_here

# AI Service URL (default: http://localhost:8000)
AI_SERVICE_URL=http://localhost:8000
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile/update` | Update profile | Yes |

### Donations (`/api/donations`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | `/api/donations/create` | Create donation | DONOR |
| GET | `/api/donations/donor` | Get donor's donations | DONOR |
| GET | `/api/donations/available` | Get available donations | VOLUNTEER |
| GET | `/api/donations/volunteer` | Get volunteer's donations | VOLUNTEER |
| POST | `/api/donations/assign` | Assign donation | VOLUNTEER |
| POST | `/api/donations/complete` | Complete donation | VOLUNTEER |
| GET | `/api/donations/all` | Get all donations | ADMIN |

### NGO (`/api/ngo`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/api/ngo/nearby-donations` | Get nearby donations | NGO |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | Get all users | ADMIN |
| GET | `/api/admin/donations` | Get all donations | ADMIN |

### Users (`/api/users`) - Public for AI Service

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/volunteers` | Get all volunteers | No |
| GET | `/api/users/ngos` | Get all NGOs | No |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- DONOR, VOLUNTEER, NGO, ADMIN
    phone VARCHAR(50),
    address VARCHAR(500),
    latitude DOUBLE DEFAULT 0.0,
    longitude DOUBLE DEFAULT 0.0,
    city VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP NOT NULL
);
```

### Donations Table

```sql
CREATE TABLE donations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    donor_id BIGINT NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    food_type VARCHAR(255) NOT NULL,
    quantity VARCHAR(255) NOT NULL,
    pickup_address VARCHAR(500) NOT NULL,
    expiry_time VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,  -- PENDING, ASSIGNED, DELIVERED
    volunteer_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (donor_id) REFERENCES users(id),
    FOREIGN KEY (volunteer_id) REFERENCES users(id)
);
```

## Example API Calls

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "DONOR",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "Hyderabad"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Donation (with JWT)

```bash
curl -X POST http://localhost:5000/api/donations/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "food_name": "Rice",
    "food_type": "Cooked",
    "quantity": "10 kg",
    "pickup_address": "123 Main St, Hyderabad",
    "expiry_time": "2026-01-06T12:00:00",
    "image_url": "https://example.com/food.jpg"
  }'
```

## Migration Notes from Node.js

### Key Differences

1. **Database**: H2 instead of SQLite (better JPA support)
   - Data is stored in `./data/mealmitra.mv.db`
   - Can be switched to SQLite if needed

2. **Password Hashing**: BCryptPasswordEncoder (Spring Security)
   - Compatible with bcryptjs hashes from Node.js

3. **JWT Library**: JJWT instead of jsonwebtoken
   - Same JWT standard, tokens are compatible

4. **Error Handling**: Spring's @ControllerAdvice
   - Returns same error format: `{ "error": "message" }`

### Preserved Features

- ✅ All API endpoints match exactly
- ✅ JWT token structure identical (userId, role, email)
- ✅ Role-based authorization logic
- ✅ Location normalization with city lookup
- ✅ AI service integration
- ✅ Placeholder scores for volunteers/NGOs
- ✅ Error messages and HTTP status codes

### Supported Cities

The location normalizer supports these cities:
- Hyderabad
- Bengaluru/Bangalore
- Chennai
- Mumbai
- Delhi
- Kolkata
- Pune
- Ahmedabad

## Project Structure

```
server/
├── src/main/java/com/mealmitra/server/
│   ├── ServerApplication.java          # Main application
│   ├── config/                         # Configuration classes
│   │   ├── SecurityConfig.java
│   │   ├── CorsConfig.java
│   │   └── RestTemplateConfig.java
│   ├── controller/                     # REST controllers
│   │   ├── AuthController.java
│   │   ├── DonationController.java
│   │   ├── NGOController.java
│   │   ├── AdminController.java
│   │   ├── UserController.java
│   │   └── HealthController.java
│   ├── service/                        # Business logic
│   │   ├── AuthService.java
│   │   ├── DonationService.java
│   │   ├── UserService.java
│   │   ├── AdminService.java
│   │   ├── LocationNormalizerService.java
│   │   └── AIServiceClient.java
│   ├── repository/                     # Data access
│   │   ├── UserRepository.java
│   │   └── DonationRepository.java
│   ├── model/                          # JPA entities
│   │   ├── User.java
│   │   ├── Donation.java
│   │   ├── Role.java
│   │   └── DonationStatus.java
│   ├── dto/                            # Data transfer objects
│   │   ├── AuthDTO.java
│   │   ├── DonationDTO.java
│   │   └── UserDTO.java
│   ├── security/                       # Security components
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── UserPrincipal.java
│   └── exception/                      # Exception handling
│       ├── GlobalExceptionHandler.java
│       ├── BadRequestException.java
│       ├── UnauthorizedException.java
│       ├── ForbiddenException.java
│       └── NotFoundException.java
├── src/main/resources/
│   └── application.yml                 # Application configuration
└── pom.xml                             # Maven dependencies
```

## Testing

### Build and Test

```bash
mvn clean test
```

### Package Application

```bash
mvn clean package
```

The JAR file will be created at `target/server-0.0.1-SNAPSHOT.jar`

### Run JAR

```bash
java -jar target/server-0.0.1-SNAPSHOT.jar
```

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, change it in `application.yml`:

```yaml
server:
  port: 8080
```

### AI Service Connection Error

Ensure the AI service is running at the configured URL. Check logs for:
```
AI Service error: Connection refused
```

Update `AI_SERVICE_URL` environment variable if needed.

### Database Issues

Delete the database file to reset:
```bash
rm -rf data/
```

## Production Deployment

For production, update:

1. **JWT Secret**: Use a strong, random secret
2. **Database**: Switch to PostgreSQL/MySQL
3. **CORS**: Restrict allowed origins
4. **Logging**: Configure appropriate log levels
5. **AI Service**: Use production AI service URL

## License

This project is part of the MealMitra food donation platform.

## Support

For issues or questions, please contact the development team.
