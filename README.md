# TCSS 460 – Group 5 Dataset Web API (TV Shows)

This repository contains the Group 5 Web API project for the TCSS 460 Back-End Development course.  
Our assigned dataset is **tv_last1years.csv**, containing television shows released within the past year.  
The Web API is built using **Node.js** and **Express**, and provides secure, API key–restricted access to the dataset.

---

## 🚀 Alpha Sprint Contribution

**Group Members**

- **Balkirat Singh** – Project setup, Node.js/Express API initialization, API key configuration, and CSV data integration.  
- **Jakita Kaur** – Planning API routes, reviewing dataset fields, assisting with data parsing and filtering design.  
- **Abadat Sandhu** – Documentation planning, ER diagram design draft, and SQL schema structure planning.  

Each team member collaborated during the Alpha Sprint to ensure the Web API could successfully load and serve the dataset from the CSV file and prepare for future PostgreSQL migration.

---

## 💬 Alpha Sprint Meetings

**Primary Communication Methods**

- **Discord:** Used for group coordination, messaging, and short check-ins.  
- **GitHub:** Used for version control, code review, and tracking commits.  
- **Zoom (as needed):** Used for walkthrough sessions when implementing new features or troubleshooting.  

Meetings occurred weekly to align progress and discuss the next sprint goals.

---

## 🧠 Alpha Sprint Comments

- Successfully loaded and parsed the large dataset (7,382 TV shows) using Node.js and Express.  
- Encountered path issues when loading the CSV due to macOS trailing space in folder names — resolved after debugging.  
- API routes are functional and secured by an API key via environment variables.  
- Next tasks include pagination, filtering (by genre, title, or network), and generating Swagger documentation for all routes.  
- Group plans to add an `/api-docs` endpoint for live documentation in the next sprint.  

---

## 🗂️ Repository Structure

tcss460-group5-tv-api/
├── data/
│ └── tv_last1years.csv
├── src/
│ ├── app.js
│ └── routes/
│ └── shows.js
├── .env
├── package.json
├── project_files/ ← to contain ER diagram, SQL script, Swagger YAML, and docs
└── README.md

## 🧩 Summary

This project represents the **Alpha Sprint milestone** for Group 5’s Dataset Web API.  
It fulfills the initial implementation requirement by:
- Setting up a working Express server  
- Loading and serving the assigned dataset  
- Implementing API key protection  
- Preparing documentation and database schema for the next sprint
