# Dev-Blog: A Full-Stack Blogging Platform

This is a comprehensive, full-stack blogging platform designed for developers. It's built with a modern tech stack and provides a rich, interactive experience for creating, sharing, and engaging with technical content.

## Key Features

### Content Management
- **Create & Manage Posts**: Full CRUD (Create, Read, Update, Delete) functionality for blog posts with a rich text editor experience.
- **Image Uploads**: Seamless image uploads powered by Cloudinary.
- **Clickable Post Previews**: The entire post card on the home page is clickable, improving navigation.
- **Search**: Instantly search for posts by title, subtitle, or content.

### User Engagement
- **Interactive Comments**: Users can add, edit, and delete their own comments.
- **Likes & Dislikes**: Engage with content by liking or disliking both posts and comments.
- **Dropdown Menus**: A clean and intuitive UI with dropdown menus for post and comment actions.

### User Authentication & Management
- **Secure Authentication**: JWT-based authentication for user signup and login.
- **Profile Management**: Users can update their username, email, and password on a dedicated profile page.
- **Secure Account Deletion**: A two-step account deletion process with password confirmation to prevent accidental deletion.

## Tech Stack

### Backend
- **Node.js & Express**: For building robust and scalable RESTful APIs.
- **MongoDB & Mongoose**: As the database and ODM for flexible data storage.
- **JSON Web Tokens (JWT)**: For securing API endpoints.
- **bcrypt.js**: For hashing user passwords.
- **Cloudinary & Multer**: For powerful image upload and management.

### Frontend
- **React & Vite**: For a fast, modern, and efficient frontend development experience.
- **React Router**: For client-side routing and navigation.
- **CSS**: For clean, modern, and responsive styling.

## Database Models

### User
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}
```

### BlogPost
```javascript
{
  title: { type: String, required: true },
  subtitle: { type: String },
  content: { type: String, required: true },
  imageUrl: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    text: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }]
}
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup`: Register a new user.
- `POST /login`: Log in a user.
- `GET /me`: Get the current authenticated user's profile.
- `PUT /me`: Update the current user's profile.
- `DELETE /me`: Delete the current user's account (requires password confirmation).

### Posts (`/api/posts`)
- `GET /`: Get all posts.
- `GET /:id`: Get a single post.
- `POST /`: Create a new post.
- `PUT /:id`: Update a post.
- `DELETE /:id`: Delete a post.
- `PUT /:id/like`: Like a post.
- `PUT /:id/dislike`: Dislike a post.

### Comments (`/api/posts/:id/comment`)
- `POST /`: Add a comment to a post.
- `PUT /:commentId`: Update a comment.
- `DELETE /:commentId`: Delete a comment.
- `PUT /:commentId/like`: Like a comment.
- `PUT /:commentId/dislike`: Dislike a comment.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB account (local or Atlas)
- Cloudinary account

### Backend Setup
1.  **Clone the repository.**
2.  **Install dependencies**: `npm install`
3.  **Create a `.env` file** in the root directory and add the following variables:
    ```env
    MONGODB_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    PORT=5000
    ```
4.  **Run the server**: `npm run dev`

### Frontend Setup
1.  **Navigate to the `frontend` directory**: `cd frontend`
2.  **Install dependencies**: `npm install`
3.  **Run the client**: `npm run dev`

The application will be available at `http://localhost:5173`.

---

** Thanks for  visiting **
