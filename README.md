# 📚🧪MathMatter♾️🌠

## Purpose
MathMatter is an interactive web application designed to make learning mathematics engaging, accessible, and intuitive. Whether you're a student strengthening core concepts or a math enthusiast solving advanced problems, MathMatter provides a dynamic platform with practice tools, problem sets, visualizations, and personalized progress tracking. With real-time feedback and a clean UI, it simplifies complex topics and fosters confident learning in a fun, gamified environment.


## Live URL
(https://mathmatter-by-shahrin-tarin.web.app/)

## 🚀Key Features

### ✅ Blog Management
- **Create Blogs** – Authenticated users can post blogs with title, short and long descriptions, image, and category.
- **Edit Blogs** – Update blog content based on its ID.
- **Get All Blogs** – Filter blogs by `category` or `title` using query parameters.
- **Recent Blogs** – Retrieve the 6 most recently added blogs (sorted by `createdAt`).
- **Top Blogs** – Retrieve the top 10 blogs based on the word count of the long description.

### ⭐ Wishlist System
- **Add to Wishlist** – Add a blog to a user’s wishlist (duplicate prevention included).
- **Get Wishlist** – View all wishlist items for a specific user (requires JWT verification).
- **Delete Wishlist Item** – Remove a specific item from the wishlist by ID.

### 💬 Comments System
- **Add Comment** – Post comments on individual blogs.
- **View Comments** – Fetch all comments for a specific blog.

### 🔐 JWT Authentication (Firebase-based)
- **Verify Token** – Secure endpoints using Firebase ID tokens.
- **Role-Based Access** – Ensures that only authenticated users can access sensitive data like wishlists.

### 📊 Blog Sorting Logic
- Blogs are ranked for the “Top Blogs” feature based on the `longDescriptionLength` field.
- The field is calculated client-side (number of words) and stored in MongoDB for performance.

---

## ⚙️ Tech Stack

| Tech           | Usage                        |
|----------------|------------------------------|
| Node.js        | Backend runtime              |
| Express.js     | Web server framework         |
| MongoDB        | Database (with collections: blogs, wishlist, comments) |
| Firebase Admin | JWT authentication & decoding |
| Cookie-Parser  | JWT cookie handling          |
| CORS           | Cross-origin resource sharing |

---

## 🔐 Middleware

- **`verifyJWT`**: Ensures requests have a valid Firebase ID token and attaches the decoded email to the request.
- Applies to secure endpoints like `GET /wishlist/:email` and `POST /blogs`.

---

## 📁 API Endpoints Overview

| Method | Route                     | Description                           |
|--------|---------------------------|---------------------------------------|
| GET    | `/blogs`                  | Get all blogs with optional filters   |
| GET    | `/blogs/:id`              | Get a single blog by ID               |
| POST   | `/blogs`                  | Add a new blog (JWT required)         |
| PUT    | `/blogs/:id`              | Update a blog                         |
| GET    | `/recentblogs`            | Get the 6 latest blogs                |
| GET    | `/topblogs`               | Get top 10 blogs (by description size)|
| GET    | `/wishlist/:email`        | Get user’s wishlist (JWT required)    |
| POST   | `/wishlist/:blogId`       | Add to wishlist (prevents duplicates) |
| DELETE | `/wishlist/:id`           | Delete wishlist item                  |
| POST   | `/comment/:blogId`        | Add a comment to a blog               |
| GET    | `/comment/:blogId`        | View all comments for a blog          |

---

## 🌐 Secret Environment Variables