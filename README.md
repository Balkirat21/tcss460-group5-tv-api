# TCSS 460 – Group 5 Dataset Web API (TV Shows)

This repository contains the Group 5 Web API project for the TCSS 460 Back-End Development course.  
Our assigned dataset is **tv_last1years.csv**, containing television shows released within the past year.  
The Web API is built using **Node.js** and **Express**, and provides secure, API key–restricted access to the dataset.

---

## 🚀 Alpha Sprint Contribution

**Group Members**

- **Balkirat Singh** – I tested the /api/v1/shows endpoint in Postman to confirm that our API successfully loads the TV dataset and supports pagination with different page and pageSize values. Right now, the API can read data from the CSV file, return paginated results, and fetch individual show details. I also wrote the Web API Functionality Plan, explaining how each route is intended to work. Next, we’ll be integrating the remaining features like adding, updating, and deleting records, as well as connecting the API to a PostgreSQL database for permanent data storage. 
-
-

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

This project represents the **Alpha Sprint milestone** for Group 5’s Dataset Web API.  
It fulfills the initial implementation requirement by:
- Setting up a working Express server  
- Loading and serving the assigned dataset  
- Implementing API key protection  
- Preparing documentation and database schema for the next sprint
