# Group 5 — TV Dataset Web API: Functionality Overview

## Project Purpose
The Group 5 TV Dataset Web API provides an organized and secure way for users to explore, add, update, and remove television show data from a curated dataset. The dataset includes information on recent and upcoming television shows worldwide, with details such as title, release dates, genres, cast, network, popularity, and ratings.  
The API allows clients (such as web or mobile applications) to retrieve and manage this data through clearly defined routes, while maintaining security and scalability.

---

## 1. Overview of Key Features
Our Web API is designed to:
- **Provide data access** to all TV shows within the `tv_last1years.csv` dataset.
- **Support searching and pagination**, allowing clients to view a limited number of records per page.
- **Enable CRUD operations** (Create, Read, Update, Delete) so clients can manage show records easily.
- **Secure all routes** through an API key system, ensuring only authorized requests can access or modify data.
- **Return responses in standard JSON format**, suitable for integration into front-end dashboards or third-party applications.
 
---

## 2. Functional Routes

### 2.1 Retrieve TV Shows
**Purpose:** Allow users to view one or more TV shows.  
**Route:** `GET /api/v1/shows`  
**Features:**
- Supports **pagination** using optional query parameters:
    - `page` (default: 1)
    - `pageSize` (default: 20)
- Returns a paginated list of shows, including each show’s key details (e.g., Name, Original Name, First Air Date, Genres, TMDb Rating, Overview).
- Example response:
  ```json
  {
    "page": 1,
    "pageSize": 20,
    "total": 7382,
    "shows": ["..."]
  }
  ```

---

### 2.2 Retrieve One TV Show
**Purpose:** View detailed information for a single show using its unique ID.  
**Route:** `GET /api/v1/shows/:id`  
**Features:**
- Returns full details for the show with the given ID.
- If the show ID does not exist, a 404 error is returned.
- Example response:
  ```json
  {
    "ID": "258462",
    "Name": "In the Mud",
    "Genres": "Crime; Drama",
    "TMDb Rating": "7.6"
  }
  ```

---

### 2.3 Add a New TV Show
**Purpose:** Allow authorized users to insert a new TV show record.  
**Route:** `POST /api/v1/shows`  
**Features:**
- Accepts a JSON object containing show details such as Name, Genres, TMDb Rating, and Status.
- Validates required fields before saving.
- Automatically generates a new unique ID.
- Example request:
  ```json
  {
    "Name": "My New Show",
    "Genres": "Drama",
    "TMDb Rating": "8.5",
    "Status": "Returning Series"
  }
  ```
- Example response:
  ```json
  {
    "message": "New show added successfully.",
    "show": {
      "ID": "7383",
      "Name": "My New Show",
      "Genres": "Drama",
      "TMDb Rating": "8.5",
      "Status": "Returning Series"
    }
  }
  ```

---

### 2.4 Update an Existing TV Show
**Purpose:** Modify information about an existing show.  
**Route:** `PUT /api/v1/shows/:id`  
**Features:**
- Locates the show by ID and updates only the provided fields.
- Returns a success message and the updated record.
- If no show with that ID exists, returns a 404 error.
- Example request:
  ```json
  {
    "TMDb Rating": "9.0",
    "Status": "Ended"
  }
  ```
- Example response:
  ```json
  {
    "message": "Show updated successfully.",
    "show": {
      "ID": "258462",
      "TMDb Rating": "9.0",
      "Status": "Ended"
    }
  }
  ```

---

### 2.5 Delete a TV Show
**Purpose:** Remove a TV show from the dataset.  
**Route:** `DELETE /api/v1/shows/:id`  
**Features:**
- Deletes the record matching the specified ID.
- Returns a confirmation message and the deleted record.
- If no record exists, returns an error message.
- Example response:
  ```json
  {
    "message": "Show deleted successfully.",
    "deleted": {
      "ID": "258462",
      "Name": "In the Mud"
    }
  }
  ```

---

### 2.6 Search and Filter (Future Feature)
**Purpose:** Allow users to filter shows by genre, popularity, or keyword.  
**Planned Endpoints:**
- `/api/v1/shows/search?query=keyword`
- `/api/v1/shows/filter?genre=Drama`
- `/api/v1/shows/sort?by=popularity`

---

## 3. Security
All routes require an **API key** passed in the request header (`x-api-key`).  
Unauthorized users receive an HTTP 403 error with a JSON error message.

**Example Header:**
```
x-api-key: dev-12345
```

**Error Example:**
```json
{
  "error": "Forbidden: Invalid API key"
}
```

---

## 4. Data Source
The Web API relies on the `tv_last1years.csv` dataset, containing over **7,300 records** of recent television shows.  
Each record includes structured metadata such as:
- Name and Original Name
- First and Last Air Date
- Genre(s)
- Status (Returning, Ended, etc.)
- Network and Studio Info
- Ratings, Popularity, and Cast
---

## 5. Future Enhancements
While the current version of the Web API operates using in-memory data loaded from the CSV file, future updates could include the following improvements:

- **Cloud Deployment:** Host the API using platforms such as Render or Railway, integrating a **PostgreSQL database** for permanent data storage instead of temporary CSV-based memory.
- **Search and Filtering:** Expand the query capabilities to allow users to search and filter by **genre, network, rating, or popularity**.
- **Live Documentation:** Integrate **Swagger UI** to automatically generate interactive, live documentation for developers and clients to test and understand API routes.
- **Sorting and Analytics:** Add options to sort results by metrics like popularity or release year, and include analytics endpoints for data insights.
- **Authentication Expansion:** Introduce role-based authentication (admin vs. viewer) for finer control over dataset modifications.

---


---

## 6. Summary
This Web API enables clients to easily access, modify, and analyze TV show data from the past year.  
It is designed to be scalable, secure, and developer-friendly while also remaining understandable for non-technical stakeholders.  
By using modern web standards, it can serve as a foundation for dashboards, mobile apps, or analytical tools that rely on accurate and up-to-date entertainment data.
