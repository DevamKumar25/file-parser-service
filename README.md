# File Parser Service

A robust backend application that supports uploading, storing, parsing, and retrieving files with real-time progress tracking for large uploads. The solution exposes REST APIs with JWT authentication and persists data in a database.

## 🚀 Features

- **File Upload with Progress Tracking**: Upload large files with real-time progress monitoring
- **Asynchronous File Processing**: Parse files asynchronously without blocking the main thread
- **Multiple File Format Support**: Parse CSV, Excel, PDF, and other file formats
- **JWT Authentication**: Secure APIs with token-based authentication
- **CRUD Operations**: Complete file management functionality
- **Database Persistence**: Store file metadata and parsed content
- **Status Management**: Track file processing states (`uploading`, `processing`, `ready`, `failed`)

## 📋 Requirements

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn package manager

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd file-parser-api
   npm install
   ```

2. **Configure Environment**
   Copy the provided `.env` configuration or create your own

3. **Start the Server**
   ```bash
   npm run dev
   ```

4. **Test with Postman**
   Import the [Postman Collection](https://devamkumar-8265657.postman.co/workspace/7335aa69-c86c-4582-8f1d-90ba72a8e2c1/collection/46186704-f5b8f2f2-7f54-473b-b1ec-4a84dea5dd64?action=share&source=copy-link&creator=46186704) and start testing!

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd file-parser-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGO_URI=your uri
   
   # JWT Configuration
   JWT_SECRET_KEY= generate random 32 letter secret key
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # File Upload Configuration
   MAX_FILE_SIZE=50MB
   UPLOAD_DIR=./uploads
   ```

4. **Database Setup**
   ```bash
   # MongoDB Atlas is already configured in MONGO_URI
   # No additional setup required for MongoDB Atlas
   
   # For local MongoDB (optional):
   # mongod --dbpath /path/to/your/db
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

   The server will start on `http://localhost:5000`

## 📚 API Documentation

### 🚀 Postman Collection

A complete Postman collection is available for testing all API endpoints:

**Collection Link**: [File Upload API - Postman Collection](https://devamkumar-8265657.postman.co/workspace/7335aa69-c86c-4582-8f1d-90ba72a8e2c1/collection/46186704-f5b8f2f2-7f54-473b-b1ec-4a84dea5dd64?action=share&source=copy-link&creator=46186704)

The collection includes:
- Pre-configured environment variables
- Sample requests for all endpoints
- Authentication token management
- File upload examples
- Response validation tests

### Authentication

#### Register User
```http
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login User
```http
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### File Operations

> **Note:** All file endpoints require authentication. Include the JWT token in the Authorization header:
> ```
> Authorization: Bearer <your_jwt_token>
> ```

#### 1. Upload File
```http
POST http://localhost:5000/files
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: <file_to_upload>
```

**Response:**
```json
{
  "file_id": "uuid",
  "filename": "data.csv",
  "status": "uploading",
  "message": "File upload initiated successfully"
}
```

#### 2. Get Upload Progress
```http
GET http://localhost:5000/files/{file_id}/progress
Authorization: Bearer <token>
```

**Response:**
```json
{
  "file_id": "uuid",
  "status": "processing",
  "progress": 42,
  "filename": "data.csv"
}
```

**Status Types:**
- `uploading`: File is being uploaded
- `processing`: File is being parsed
- `ready`: File parsing completed successfully
- `failed`: File processing failed

#### 3. Get File Content
```http
GET http://localhost:5000/files/{file_id}
Authorization: Bearer <token>
```

**Success Response (when ready):**
```json
{
  "file_id": "uuid",
  "filename": "data.csv",
  "status": "ready",
  "content": [
    {
      "column1": "value1",
      "column2": "value2"
    }
  ],
  "metadata": {
    "rows": 1000,
    "columns": 5,
    "file_size": "2.5MB"
  }
}
```

**Processing Response:**
```json
{
  "message": "File upload or processing in progress. Please try again later.",
  "status": "processing",
  "progress": 65
}
```

#### 4. List All Files
```http
GET http://localhost:5000/files
Authorization: Bearer <token>
```

**Response:**
```json
{
  "files": [
    {
      "id": "uuid1",
      "filename": "data.csv",
      "status": "ready",
      "created_at": "2024-01-15T10:30:00Z",
      "file_size": "2.5MB"
    },
    {
      "id": "uuid2",
      "filename": "report.xlsx",
      "status": "processing",
      "created_at": "2024-01-15T11:00:00Z",
      "file_size": "5.2MB"
    }
  ]
}
```

#### 5. Delete File
```http
DELETE http://localhost:5000/files/{file_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "File deleted successfully",
  "file_id": "uuid"
}
```

## 🏗️ Project Structure

```
file-parser-api/
├── controllers/
│   ├── auth.js              # Authentication logic
│   └── fileController.js    # File operations
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── File.js              # File model
│   └── User.js              # User model
├── routes/
│   ├── auth.route.js        # Authentication routes
│   └── fileRoutes.js        # File operation routes
├── utils/
│   └── parser.js            # File parsing utilities
├── uploads/                 # File upload directory
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── app.js                  # Express app configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🔧 Supported File Types

- **CSV Files**: Parsed into JSON arrays
- **Excel Files (.xlsx, .xls)**: Spreadsheet data extraction
- **PDF Files**: Text content extraction
- **JSON Files**: Direct parsing and validation
- **TXT Files**: Plain text processing

## 🚦 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | File not found |
| 413 | File too large |
| 422 | Unsupported file type |
| 500 | Internal server error |

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **File Type Validation**: Only allowed file types are processed
- **File Size Limits**: Configurable maximum file size
- **Input Sanitization**: Prevent malicious file uploads
- **Rate Limiting**: Prevent abuse of upload endpoints

## 🧪 Testing

### Using Postman Collection
1. **Import the Collection**: Click the [Postman Collection Link](https://devamkumar-8265657.postman.co/workspace/7335aa69-c86c-4582-8f1d-90ba72a8e2c1/collection/46186704-f5b8f2f2-7f54-473b-b1ec-4a84dea5dd64?action=share&source=copy-link&creator=46186704)
2. **Set Environment Variables**: Configure your base URL and authentication tokens
3. **Test Authentication**: Start with register/login endpoints
4. **Test File Operations**: Upload, track progress, and retrieve files


## 🔄 Background Processing

The application uses asynchronous processing for file parsing to handle large files efficiently:

- Files are queued for processing after upload
- Progress is tracked and can be queried via the progress endpoint
- Failed processing is handled gracefully with error states


## 📊 Monitoring and Logging

- Request/response logging
- Error tracking and reporting
- File processing metrics
- Authentication attempt logging

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- [ ] WebSocket support for real-time progress updates
- [ ] Server-Sent Events (SSE) for live notifications
- [ ] File compression and optimization
- [ ] Advanced file validation and virus scanning
- [ ] Multiple file upload support
- [ ] File versioning and history
- [ ] Integration with cloud storage (AWS S3, Google Cloud)


## 🙏 Acknowledgments

- Express.js community
- JWT.io for authentication standards
- File parsing library contributors
- Open source community

