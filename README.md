# 🎓 SSET Lumina

> IRINS-inspired Faculty Publication Management Portal for recording, managing, and showcasing academic publications at SCMS School of Engineering and Technology (SSET).

---

Hosted link: https://ssetlumina.vercel.app/
Use guest mail: guest@college.edu 
password: GuestPassword123!

## 📌 Overview

**SSET Lumina** is a full-stack web application designed to streamline the management of academic publications produced by faculty members at SCMS School of Engineering and Technology.

The platform enables faculty members to digitally record, organize, retrieve, and manage their scholarly contributions, including:

* Research Journals
* Conference Papers
* Book Chapters
* Articles
* Patents
* Technical Reports
* Other Academic Publications

By replacing fragmented spreadsheets and manual record-keeping processes, SSET Lumina provides a centralized, searchable, and scalable publication repository for institutional use.

---

## 🎯 Problem Statement

Academic institutions often struggle with maintaining accurate and up-to-date records of faculty publications due to:

* Decentralized storage systems
* Manual documentation processes
* Difficulty generating accreditation reports
* Lack of publication search and filtering mechanisms
* Inefficient retrieval of historical publication data

SSET Lumina addresses these challenges through a secure and structured digital platform.

---

## ✨ Key Features

### 👨‍🏫 Faculty Management

* Faculty profile creation and management
* Department-wise faculty organization
* Secure authentication and authorization
* Personalized publication dashboard

### 📚 Publication Management

* Add new publications
* Edit existing publication records
* Delete publications
* Categorize publications by type
* Upload publication metadata

### 🔍 Advanced Search & Filtering

* Search publications by:

  * Title
  * Author
  * Department
  * Publication Type
  * Year

* Dynamic filtering system

* Fast retrieval of records

### 📊 Analytics & Insights

* Publication count tracking
* Department-wise statistics
* Faculty publication summaries
* Research productivity monitoring

### 🛡️ Administrative Controls

* Centralized data management
* Faculty account management
* Publication verification workflows
* Database monitoring

---

## 🏗️ System Architecture

```text
┌─────────────────────┐
│     Frontend        │
│     React.js        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Backend        │
│ Node.js + Express   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     MongoDB Atlas   │
│   Cloud Database    │
└─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript (ES6+)
* HTML5
* CSS3
* Axios
* React Router

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB Atlas
* Mongoose ODM

### Authentication

* JWT Authentication
* Password Hashing

### Deployment

| Service  | Platform      |
| -------- | ------------- |
| Frontend | Vercel        |
| Backend  | Render        |
| Database | MongoDB Atlas |

---

## 📂 Project Structure

```bash
sset-lumina/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── assets/
│   │   └── App.js
│   │
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   ├── utils/
│   └── server.js
│
├── README.md
└── package.json
```

---

## 🗄️ Database Design

### Faculty Collection

```javascript
{
  name: String,
  email: String,
  department: String,
  designation: String,
  profileImage: String
}
```

### Publication Collection

```javascript
{
  title: String,
  authors: [String],
  publicationType: String,
  journalName: String,
  conferenceName: String,
  publicationYear: Number,
  doi: String,
  facultyId: ObjectId
}
```

---

## 🔄 Workflow

### Faculty Workflow

1. Login to the portal
2. Access personal dashboard
3. Add publication details
4. Update or edit records
5. Search previous publications
6. View publication statistics

### Administrator Workflow

1. Manage faculty records
2. Monitor publication database
3. Verify publication entries
4. Generate institutional reports

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/sset-lumina.git

cd sset-lumina
```

### Backend Setup

```bash
cd backend

npm install

npm run dev
```

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## 🌐 Deployment

### Frontend Deployment

* Hosted on **Vercel**
* Continuous deployment via GitHub integration

### Backend Deployment

* Hosted on **Render**
* Auto-build and deployment pipeline

### Database

* MongoDB Atlas cloud cluster
* Secure remote database access

---

## 🔒 Security Features

* JWT-based authentication
* Password encryption
* Protected API routes
* Input validation
* Secure environment variable management
* Database access control

---

## 📈 Future Enhancements

* ORCID Integration
* Google Scholar Synchronization
* Scopus API Integration
* Publication Citation Tracking
* PDF Upload & Storage
* Research Analytics Dashboard
* Department Ranking System
* AI-Based Publication Recommendations
* Automated Accreditation Report Generation

---

## 🎓 Academic Impact

SSET Lumina serves as a digital research repository that simplifies publication management, enhances accessibility of scholarly work, and supports institutional research visibility, accreditation processes, and academic reporting.

---

## 👥 Contributors

Developed by the SSET Lumina Development Team

**Technology Stack:** MERN (MongoDB, Express.js, React.js, Node.js)

**Institution:** SCMS School of Engineering and Technology (SSET)

---

## 📜 License

This project is developed for academic and institutional use.

Copyright © SSET Lumina.

