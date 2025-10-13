# TCSS 460 – Group 5 Dataset Web API (TV Shows)

This repository contains the Group 5 Web API project for the TCSS 460 Back-End Development course.  
Our assigned dataset is **tv_last1years.csv**, containing television shows released within the past year.  
The Web API is built using **Node.js** and **Express**, and provides secure, API key–restricted access to the dataset.

---

## 🚀 Alpha Sprint Contribution

**Group Members**

- **Balkirat Singh** – I tested the /api/v1/shows endpoint in Postman to confirm that our API successfully loads the TV dataset and supports pagination with different page and pageSize values. Right now, the API can read data from the CSV file, return paginated results, and fetch individual show details. I also wrote the Web API Functionality Plan, explaining how each route is intended to work. Next, we’ll be integrating the remaining features like adding, updating, and deleting records, as well as connecting the API to a PostgreSQL database for permanent data storage. 
- **Kobe Benavente** – Researched and identified a potential cloud hosting option (Render.com) for our project, evaluating its pros and cons. Tested deployment using a similar Web API to confirm compatibility. Also helped the team stay organized by clarifying what tasks were still pending and ensuring everyone understood our next steps.
- **Pham Nguyen** - I designed an Entity-Relationship (ER) Diagram to represent the database structure of the assigned dataset, including entities, attributes, and relationships. Then I created an SQL initialization script to define the tables, primary and foreign keys, and relationships based on the ERD. The script prepares the database structure for future data migration and population. Currently, we are using the VARCHAR data type in the SQL file, which allows us to change the data types in the future if needed.
- **MD Khan** -I created the Git repository for our Dataset Web API and organized the project structure following Node.js/Express best practices. I configured the initial server and successfully deployed a working Hello World API on Vercel to test our cloud hosting setup. I also ensured the API could read data from the provided CSV dataset and began planning its integration with PostgreSQL. Additionally, I created and organized the /project_files documentation folder, helping to finalize the Web API Functionality Plan and confirm consistency between the ER diagram, SQL initialization script, and API routes.

Each team member collaborated during the Alpha Sprint to ensure the Web API could successfully load and serve the dataset from the CSV file and prepare for future PostgreSQL migration.

---

## 💬 Alpha Sprint Meetings

**Primary Communication Methods**

- **Discord:** Used for group coordination, messaging, and short check-ins.  
- **GitHub:** Used for version control, code review, and tracking commits.  

Meetings occurred weekly to align progress and discuss the next sprint goals.

---

## 🧠 Alpha Sprint Comments

- Successfully integrated and tested the /api/v1/shows endpoint with pagination using Postman.  
- Encountered path issues when loading the CSV due to macOS trailing space in folder names — resolved after debugging.  
- Implemented API key authentication through environment variables (.env) for secure route access. 
- Completed the Web API Functionality Plan outlining all proposed routes and features for client documentation. 
- Next steps include implementing POST, PUT, and DELETE routes to enable full CRUD operations and preparing Swagger-based live documentation under an /api-docs route.
- Tested various cloud hosting options for web APIs. Found success with Render and Vercel, however what we decide to go with in the future may be subject to change. 
- Created an **SQL initialization script** defining all database tables and relationships. The current version includes **`VARCHAR` placeholders** for fields, which will be updated to accurate data types in the next sprint as part of database migration and refinement.  

---

## 🗂️ Current Repository Structure

```
tcss460-group5-tv-api/
  .idea/                    (IDE configuration files)
  data/
    tv_last1years.csv
  node_modules/
  project_files/
    WebAPI_Functionality_Plan.md
    WebAPI_Cloud_Hosting_Options.md
    Initialize_TVShowdatabase.sql
    TVShow_ERDiagram.pdf
  src/
    middleware/
    routes/
    app.js
  .env
  .gitignore
  package.json
  package-lock.json
  README.md
```
## 🧩 Summary

This project represents the **Alpha Sprint milestone** for Group 5’s Dataset Web API in TCSS 460.  
Throughout this sprint, the team collaborated to design, build, and document the foundation of a fully functional backend service focused on the TV dataset (`tv_last1years.csv`). Using **Node.js** and **Express**, the API securely loads, parses, and serves over 7,000 television show records while supporting paginated responses through query parameters.  

The API was secured using an **API key authentication system**, ensuring that only authorized users can access endpoints. The functionality was thoroughly tested using **Postman**, verifying the performance of the `/api/v1/shows` route and confirming that pagination and response structures worked as intended.  

In addition to the core implementation, the team produced extensive planning and documentation deliverables. Balkirat Singh created the **Web API Functionality Plan**, detailing all proposed routes, CRUD operations, and future enhancements for client-facing clarity. Pham Nguyen designed a comprehensive **Entity-Relationship (ER) Diagram** and authored the **SQL initialization script**, defining all tables, primary and foreign keys, and relationships necessary for future PostgreSQL integration. The script currently includes `VARCHAR` placeholders, which will be refined with accurate data types in the next sprint.  

Meanwhile, MD Khan organized the **Git repository**, configured the Express server, and established the project’s base structure, ensuring consistency with Node.js best practices. He also helped set up the **Hello World API deployment** on Vercel to validate cloud compatibility. Kobe Benavente researched and compared **cloud hosting platforms** (Render and Vercel), testing deployment setups to identify the most reliable hosting solution for future use.  

Overall, this sprint laid the groundwork for future development by combining API design, database modeling, and cloud exploration into a cohesive project.  
The next sprint will focus on:
- Implementing **full CRUD functionality** (POST, PUT, DELETE)  
- Integrating a **PostgreSQL database** for persistent storage  
- Adding **Swagger-based live documentation** for route visualization and testing  
- Refining the **SQL schema** with proper data types and indexing for optimized performance  

By completing these steps, Group 5 will transition from a CSV-driven prototype to a fully hosted and database-backed Web API capable of supporting real-world applications.
