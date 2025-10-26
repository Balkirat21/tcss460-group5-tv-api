# How to Authorize in Swagger UI

## Problem: Getting 401 Unauthorized Error

If you're seeing this error:
```json
{
  "error": "Unauthorized: Invalid or missing API key"
}
```

It means you haven't authorized with the API key yet in Swagger UI.

## Solution: Follow These Steps

### Step 1: Open Swagger UI
Go to: **http://localhost:3000/api-docs**

### Step 2: Look for the "Authorize" Button
You'll see a **🔒 Authorize** button at the top-right of the page (green button).

### Step 3: Click "Authorize"
Click the **🔒 Authorize** button.

### Step 4: Enter Your API Key
In the popup dialog:
- **Value field:** Enter `1234` (the API key from your .env file)
- Click **"Authorize"** button
- Click **"Close"** button

### Step 5: Try Your Request Again
Now all requests will automatically include the API key!

## Alternative: Use the Test Page

Instead of using Swagger UI, you can use the simplified test page:
1. Open `test-api.html` in your browser
2. All requests automatically include the API key
3. Just click "Execute" buttons to test

To open it:
```bash
open test-api.html
```

## Alternative: Use cURL Commands

You can also test directly from terminal:
```bash
# Get all shows
curl -H "x-api-key: 1234" http://localhost:3000/api/v1/shows

# Get show by ID
curl -H "x-api-key: 1234" http://localhost:3000/api/v1/shows/2

# Update a show
curl -X PUT -H "x-api-key: 1234" -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}' http://localhost:3000/api/v1/shows/2

# Delete a show
curl -X DELETE -H "x-api-key: 1234" http://localhost:3000/api/v1/shows/2
```

## Your Current Configuration
- **API Key:** 1234
- **API URL:** http://localhost:3000
- **Database:** Connected ✓
- **Server:** Running ✓
