# TCSS 460 – Group 5 Dataset Web API (TV Shows)

This repository contains the Group 5 Web API project for the TCSS 460 Back-End Development course.
Our assigned dataset is **tv_last1years.csv**, containing television shows released within the past year.
The Web API is built using **Node.js** and **Express**, connected to a **PostgreSQL database**, and provides secure, API key–restricted access to the dataset.

**🌐 Hosted Data Web API URL (Render):** [https://tcss460-group5-tv-api.onrender.com](https://tcss460-group5-tv-api.onrender.com)

**📚 API Documentation:** [https://tcss460-group5-tv-api.onrender.com/api-docs/](https://tcss460-group5-tv-api.onrender.com/api-docs/)

---

## 🚀 Beta Sprint Contribution

**Group Members**

- **Balkirat Singh** – During this sprint, I helped across multiple parts of the API by assisting with debugging and testing the POST, PUT, DELETE, and pagination features while helping make the error handling and API key protection more consistent. I also updated portions of the documentation when new routes were added and helped teammates set up and test their routes on both local and Render environments. On top of that, I started preparing for the next sprint requirements by researching how to add login and register functionality with JWTs, planning the user credentials table for PostgreSQL, and looking into how to host the database externally the way the instructor requires.
- **Kobe Benavente** –  Implemented the POST endpoint for creating new TV shows with comprehensive validation including required field checks, data type validation for numeric fields, and
  rating bounds enforcement (0-10). Developed the DELETE endpoint to remove TV shows by ID with pre-deletion existence verification and detailed error messages. Also coordinated with team
  members to help integrate the new endpoints and update their local projects to reflect the latest API changes.
- **MD Khan (Shanto)** - Helped implement and test the POST, PUT, and DELETE endpoints for managing TV show data, contributing to full CRUD functionality within the API. Worked on building the routes to handle show creation, updates, and deletion with consistent validation, error handling, and database integration.
- **Pham Nguyen** - Updated openapi.json with detailed API specifications to ensure accurate endpoint documentation. Modified src/routes/shows.js to enhance route functionality, including implementing a pagination strategy in the showbyyear route for efficient data handling. Conducted comprehensive testing of all routes using Postman to verify endpoint reliability and performance.

---

## 💬 Beta II Sprint Meetings

**Primary Communication Methods**

- **Discord:** Used for group coordination, sprint planning, and real-time collaboration during Beta II Sprint.
- **GitHub:** Used for version control, pull requests, code reviews, and tracking sprint progress.

**Meeting Details**

- **When/Where:** Weekly Discord voice meetings and continuous asynchronous collaboration via Discord text channels and GitHub throughout the Beta II Sprint period.
- **What Was Discussed:**
  - Implementing full CRUD functionality (POST, PUT, DELETE operations)
  - Ensuring all routes use proper pagination strategy for 0-to-many records
  - Protecting all routes with API Key authentication as demonstrated in Messages API
  - Creating comprehensive Postman test collection to thoroughly test all routes
  - Updating hosted API documentation to reflect new endpoints
  - Addressing deficiencies found in previous sprint
  - Coordinating individual contributions and merge strategies
  - Planning migration from Render to Heroku for deployment consistency

---

## 🧠 Beta II Sprint Comments

- Successfully implemented full CRUD functionality - API is now 95%+ complete as required.
- All routes properly protected with API Key authentication strategy.
- Comprehensive Postman test collection created at `testing/postman/TV_Shows_API_Tests.postman_collection.json` that thoroughly tests all implemented routes.
- PUT endpoint supports partial updates with dynamic query building for optimal flexibility.
- All numeric fields include proper validation, with special handling for tmdb_rating (0-10 range enforcement).
- Pagination strategy implemented and documented for all routes returning multiple records.
- OpenAPI documentation updated and hosted at `/api-docs` route reflecting all current functionality.
- Currently hosted on Render with plans to migrate to Heroku in upcoming sprint for alignment with course requirements.
- Database updates completed to address deficiencies from previous sprint.
- All endpoints return consistent error messages with appropriate HTTP status codes (400, 401, 404, 500).
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
  testing/
    postman/
      TV_Shows_API_Tests.postman_collection.json
  .env
  .gitignore
  openapi.json
  package.json
  package-lock.json
  README.md
```
---
## 🧩 Beta II Sprint Summary

This project represents the **Beta II Sprint milestone** for Group 5's Dataset Web API in TCSS 460.
During this sprint, the team successfully implemented **full CRUD functionality**, bringing the API to 95%+ completion as required. The API now supports creating, reading, updating, and deleting TV show records with comprehensive validation and error handling.

**Key Achievements:**

- ✅ **Full CRUD Operations Implemented:**
  - **POST /api/v1/shows** – Create new TV shows with comprehensive validation
  - **GET /api/v1/shows** – Retrieve paginated TV show data with filtering
  - **GET /api/v1/shows/:id** – Retrieve single show by ID
  - **PUT /api/v1/shows/:id** – Update existing TV shows (partial updates supported)
  - **DELETE /api/v1/shows/:id** – Delete TV shows by ID
  - **GET /api/v1/shows/showbyyear/:year** – Filter shows by year

- ✅ **Pagination Strategy:** All routes returning multiple records implement proper pagination with configurable page size and page number parameters, fully documented in OpenAPI specification.

- ✅ **API Key Authentication:** All routes (except welcome endpoint) are protected using the API Key strategy demonstrated in the Messages API. Supports both header (`x-api-key`) and query parameter (`apikey`) authentication.

- ✅ **Comprehensive Testing:** New Postman collection (`testing/postman/TV_Shows_API_Tests.postman_collection.json`) thoroughly tests all CRUD operations, including edge cases, validation errors, and authentication requirements.

- ✅ **Updated Documentation:** OpenAPI documentation hosted at `/api-docs` accurately reflects all implemented endpoints with detailed request/response schemas, parameter descriptions, and error responses.

- ✅ **Database Improvements:** Addressed deficiencies from previous sprint with enhanced data validation, better error handling, and optimized query performance.

The API continues to be deployed on **Render** with plans to migrate to Heroku in the upcoming sprint for consistency with course requirements. All endpoints are fully functional in both local development and production environments.
