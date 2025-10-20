# TCSS 460 – Group 5 Dataset Web API (TV Shows)

This repository contains the Group 5 Web API project for the TCSS 460 Back-End Development course.
Our assigned dataset is **tv_last1years.csv**, containing television shows released within the past year.
The Web API is built using **Node.js** and **Express**, connected to a **PostgreSQL database**, and provides secure, API key–restricted access to the dataset.

**🌐 Hosted Web API URL:** [https://helloworld-api-su2v.onrender.com](https://helloworld-api-su2v.onrender.com)

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
