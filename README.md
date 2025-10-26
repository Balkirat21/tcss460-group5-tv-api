# TCSS 460 – Group 5 Dataset Web API (TV Shows)

This repository contains the Group 5 Web API project for the TCSS 460 Back-End Development course.
Our assigned dataset is **tv_last1years.csv**, containing television shows released within the past year.
The Web API is built using **Node.js** and **Express**, connected to a **PostgreSQL database**, and provides secure, API key–restricted access to the dataset.

## 🔗 Hosted API URLs

**📊 Data Web API (TV Shows):** [https://helloworld-api-su2v.onrender.com](https://helloworld-api-su2v.onrender.com)

**🔐 Credentials Web API:** [https://helloworld-api-su2v.onrender.com](https://helloworld-api-su2v.onrender.com)
- Register: `POST /auth/register`
- Login: `POST /auth/login`

**📚 API Documentation:** [https://helloworld-api-su2v.onrender.com/api-docs](https://helloworld-api-su2v.onrender.com/api-docs)

---

## 🚀 Beta Sprint Contribution

**Group Members**

- **Balkirat Singh** – Created and exported the comprehensive Postman test collection (`Testing/postman/postman.json`) with automated tests for all implemented routes including the root endpoint, pagination, filtering by name/genre, and database queries. Helped implement and test the main API endpoints (GET all shows with pagination/filtering, GET show by ID) excluding the `/showbyyear` route. Updated the README.md to document Beta Sprint deliverables, contributions, and meeting details.

---

## 💬 Beta Sprint Meetings

**Primary Communication Methods**

- **Discord:** Used for group coordination, quick updates, and daily check-ins during the Beta Sprint.
- **GitHub:** Used for version control, code review, pull requests, and tracking commits.

**Meeting Details**

- **When/Where:** Weekly Discord voice meetings and asynchronous collaboration via Discord text channels throughout the week.
- **What Was Discussed:**
  - Finalizing the PostgreSQL database setup and migrating from CSV to cloud-hosted database
  - Implementing database query routes (GET all shows with pagination/filtering, GET by ID, GET by year)
  - Creating the Postman test collection with comprehensive automated tests
  - Setting up Swagger/OpenAPI documentation at the `/api-docs` route
  - Deploying the API to Render and ensuring the database connection works in production
  - Dividing tasks among team members for efficient completion before the deadline

---

## 🧠 Beta Sprint Comments

- Successfully migrated from CSV-based data loading to a cloud-hosted PostgreSQL database.
- Implemented multiple working routes that query the database with variable results (pagination, filtering by name/genre, filtering by year).
- Created comprehensive Postman test collection with automated test scripts for all routes.
- Hosted live API documentation using Swagger UI at `/api-docs` route.
- The welcome page (root endpoint `/`) is now publicly accessible without requiring an API key for easier testing.
- API is successfully deployed on Render and connected to an external PostgreSQL database.
- All routes return properly formatted JSON responses with appropriate error handling.

---

## 🗂️ Current Repository Structure

```
tcss460-group5-tv-api/
  .idea/                    (IDE configuration files)
  node_modules/
  project_files/
    WebAPI_Functionality_Plan.md
    WebAPI_Cloud_Hosting_Options.md
    Initialize_TVShowdatabase.sql
    TVShow_ERDiagram.pdf
    images/
  src/
    config/
      db.js
    middleware/
      authMiddleware.js
    routes/
      shows.js
    app.js
  Testing/
    postman/
      postman.json
  .env
  .gitignore
  openapi.json
  package.json
  package-lock.json
  README.md
```

## 🧩 Beta Sprint Summary

This project represents the **Beta Sprint milestone** for Group 5's Dataset Web API in TCSS 460.
During this sprint, the team successfully transitioned from a CSV-based prototype to a fully functional, cloud-hosted Web API connected to a PostgreSQL database. The API is now deployed on **Render** and serves over 7,000 television show records from an external database with full query support.

The API includes multiple working routes that query the database and return variable results:
- **GET /api/v1/shows** – Returns paginated TV show data with optional filtering by name and genre
- **GET /api/v1/shows/:id** – Returns a single show by its database ID
- **GET /api/v1/shows/showbyyear/:year** – Returns all shows that first aired in a specific year

All routes are secured with **API key authentication** (except the root welcome endpoint), ensuring only authorized users can access the data. The API was thoroughly tested using **Postman**, with a comprehensive test collection (`Testing/postman/postman.json`) that includes automated test scripts validating status codes, response structure, and data integrity.

Live API documentation was implemented using **Swagger UI** and is hosted at the `/api-docs` route, providing an interactive interface for exploring and testing all available endpoints. The documentation accurately describes request parameters, response schemas, and error handling for each route.

The database connection is handled through a centralized `db.js` configuration file that connects to the PostgreSQL instance hosted externally. The SQL schema was refined from the Alpha Sprint with proper data types, and the database was populated with the TV show dataset for persistent storage.

Overall, the Beta Sprint successfully delivered:
- ✅ Cloud-hosted Web API on Render
- ✅ External PostgreSQL database setup and population
- ✅ Multiple working routes with database queries returning variable results
- ✅ Comprehensive Postman test collection with automated tests
- ✅ Live Swagger API documentation at `/api-docs`
- ✅ Secure API key authentication for protected routes

The next sprint will focus on implementing full CRUD functionality (POST, PUT, DELETE operations) and adding more advanced query features such as sorting, filtering by multiple criteria, and pagination enhancements.

---

## 🚀 Beta II Sprint Contribution

**Group Members**

- **Balkirat Singh** – Implemented the complete CRUD functionality for the Data API including POST, PUT, and DELETE routes for TV shows. Built the Credentials API with user registration and login endpoints featuring bcrypt password hashing and JWT token generation. Updated the OpenAPI/Swagger documentation to include all new routes (POST/PUT/DELETE for shows, register/login for auth). Expanded the Postman test collection with 5 new automated tests covering user registration, login, show creation, updates, and deletion. Updated README.md with Beta II Sprint sections including contribution details, meeting information, and sprint comments.

- **[Team Member 2 Name]** – [Add their contributions here - what routes they worked on, what features they implemented, what documentation they created, etc.]

- **[Team Member 3 Name]** – [Add their contributions here]

- **[Team Member 4 Name]** – [Add their contributions here]

---

## 💬 Beta II Sprint Meetings

**Primary Communication Methods**

- **Discord:** Used for daily standups, code reviews, and coordinating implementation of new features during Beta II Sprint
- **GitHub:** Version control, pull requests, code reviews, and issue tracking for CRUD implementation and auth features
- **Zoom/In-Person:** [Add details if you had any video calls or in-person meetings]

**Meeting Details**

- **Meeting 1 - [Date]**
  - **Where/When/How:** Discord voice channel / [Specific time]
  - **What Was Discussed:**
    - Planned the implementation strategy for Beta II Sprint requirements
    - Divided tasks: CRUD operations for Data API, Credentials API development, testing, and documentation
    - Reviewed professor's requirements for 95% API completion
    - Discussed database schema for users table
    - Established timeline for completing POST, PUT, DELETE routes

- **Meeting 2 - [Date]**
  - **Where/When/How:** Discord voice channel / [Specific time]
  - **What Was Discussed:**
    - Progress check on CRUD implementation
    - Discussed JWT authentication strategy and bcrypt password hashing
    - Reviewed email validation approach using validator library
    - Coordinated Postman test creation for new routes
    - Planned OpenAPI documentation updates

- **Meeting 3 - [Date]**
  - **Where/When/How:** [Location/method] / [Specific time]
  - **What Was Discussed:**
    - Final testing of all new endpoints
    - Reviewed Postman collection completeness
    - Verified API documentation accuracy
    - Prepared for deployment to Render
    - Discussed README updates and sprint deliverables

**Asynchronous Communication**

Throughout the Beta II Sprint, team members communicated via:
- Discord text channels for quick questions and updates
- GitHub commit messages and pull request comments
- Code reviews and feedback on implementation details

---

## 🧠 Beta II Sprint Comments

**Completed Deliverables:**

✅ **Data API (95%+ Complete):**
- Implemented POST /api/v1/shows - Create new TV shows with validation
- Implemented PUT /api/v1/shows/:id - Update existing shows with partial update support
- Implemented DELETE /api/v1/shows/:id - Delete shows with confirmation response
- All Data API routes protected by API key authentication
- Pagination strategy documented and implemented with configurable page size (max 200)

✅ **Credentials API (Fully Functional):**
- Implemented POST /auth/register with email validation and phone number validation
- Implemented POST /auth/login with bcrypt password verification
- Both routes return JWT tokens with user information and role
- Created users table in PostgreSQL database on Render
- Email validation using industry-standard validator library
- Secure password storage using bcrypt hashing (never stores plain passwords)
- JWT tokens valid for 24 hours with user ID, email, and role claims

✅ **Testing:**
- Expanded Postman collection to 17 comprehensive tests
- New tests cover: user registration, login, show creation, updates, and deletion
- All tests include automated assertions for status codes, response structure, and data validation
- Postman collection exported to `/testing/postman/postman.json`

✅ **Documentation:**
- Updated OpenAPI/Swagger documentation with all new routes
- Documentation hosted at `/api-docs` route with interactive testing interface
- All request/response schemas documented with examples
- Error responses documented (400, 401, 404, 409)

✅ **Database:**
- Added users table to cloud-hosted PostgreSQL database
- Table includes: email (unique), phone, password_hash, role, created_at
- Database hosted on Render (external cloud service, not local)

**Technical Implementation Notes:**

- **Security:** All passwords hashed with bcrypt (10 salt rounds), JWT tokens signed with secret key
- **Validation:** Email format validation, phone number validation, password length requirements (min 6 chars)
- **Error Handling:** Comprehensive error responses with appropriate HTTP status codes
- **Code Quality:** Modular route structure, reusable database connection pool, environment variable configuration
- **API Design:** RESTful conventions followed, JSON responses throughout, proper HTTP methods (GET/POST/PUT/DELETE)

**Challenges & Solutions:**

- **Challenge:** Needed to create both Data API CRUD and Credentials API in short timeframe
- **Solution:** Used efficient code patterns, modular design, and parallel development of routes

- **Challenge:** Password security and JWT implementation
- **Solution:** Used industry-standard libraries (bcrypt for hashing, jsonwebtoken for tokens)

- **Challenge:** Updating comprehensive Postman collection and OpenAPI docs
- **Solution:** Followed existing patterns and added automated tests for all new endpoints

**Next Steps (Future Enhancements):**

- Implement role-based access control (admin vs. user permissions)
- Add JWT middleware to protect Data API routes with user tokens (in addition to API key)
- Implement refresh token functionality for extended sessions
- Add rate limiting to prevent API abuse
- Implement password reset functionality
- Add more advanced filtering and search capabilities
- Implement sorting by multiple fields

---

## 🗂️ Updated Repository Structure (Beta II)

```
tcss460-group5-tv-api/
  project_files/
    WebAPI_Functionality_Plan.md
    WebAPI_Cloud_Hosting_Options.md
    Initialize_TVShowdatabase.sql
    create_users_table.sql          (NEW - Users table schema)
    TVShow_ERDiagram.pdf
    images/
  src/
    config/
      db.js
    middleware/
      authMiddleware.js
    routes/
      shows.js                       (UPDATED - Added POST, PUT, DELETE)
      auth.js                        (NEW - Register & Login routes)
    app.js                           (UPDATED - Added auth routes)
  testing/
    postman/
      postman.json                   (UPDATED - 17 tests total)
  .env                               (UPDATED - Added JWT_SECRET)
  openapi.json                       (UPDATED - All new routes documented)
  package.json                       (UPDATED - Added bcrypt, jsonwebtoken, validator)
  README.md                          (UPDATED - Beta II Sprint sections)
```

---

## 📊 Sprint Progress Summary

| Feature | Beta Sprint | Beta II Sprint |
|---------|-------------|----------------|
| Data API Routes | 3 GET routes | ✅ 6 routes (GET, POST, PUT, DELETE) |
| Credentials API | ❌ Not implemented | ✅ Fully functional (register, login) |
| Authentication | API key only | ✅ API key + JWT tokens |
| Database Tables | tv_shows only | ✅ tv_shows + users |
| Postman Tests | 12 tests | ✅ 17 tests |
| API Documentation | Basic routes | ✅ Complete documentation |
| Security | Basic API key | ✅ Bcrypt + JWT + validation |
| Deployment | Render (Data API) | ✅ Render (Data + Credentials) |

**API Completion Status: 95%+** ✅
