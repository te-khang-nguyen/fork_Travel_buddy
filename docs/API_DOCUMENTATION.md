# Travel Buddy API Documentation

## Overview

Travel Buddy is a comprehensive travel platform API built with Next.js 15, TypeScript, and Supabase (PostgreSQL). This document provides detailed information about all API endpoints, their methods, authentication requirements, request/response structures, and database operations.

## Base URL

- **Production**: `https://travelbuddy8.com/api/v1`
- **Development**: `http://localhost:3000/api/v1`

## Authentication

Most endpoints require Bearer token authentication. The token should be included in the `Authorization` header:

```
Authorization: Bearer {access_token}
```

### Authentication Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/auth/login` | POST | No | User login with email and password |
| `/auth/sign-up` | POST | No | Create new user account |
| `/auth/forgot-password` | POST | No | Request password reset email |
| `/auth/reset-password` | POST | Yes | Reset user password |
| `/auth/logout` | POST | Yes | User logout |
| `/auth/new-session` | POST | No | Create new session |
| `/auth/oauth` | POST | No | OAuth authentication |
| `/auth/otp-verification` | POST | No | OTP verification |
| `/auth/update-email` | POST | Yes | Update user email |
| `/auth/callback` | GET | No | OAuth callback handler |
| `/auth/business/login` | POST | No | Business user login |
| `/auth/business/sign-up` | POST | No | Business user signup |
| `/auth/business/callback` | GET | No | Business OAuth callback |

---

## API Endpoints by Category

### 1. Authentication

#### 1.1 User Login

**Endpoint**: `/auth/login`  
**Method**: `POST`  
**Authentication**: No

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "string",
  "expires_at": "number",
  "refresh_token": "string",
  "user_id": "string"
}
```

**Error Responses**:
- `400`: Invalid credentials
- `500`: Server error

**Database Operations**: Supabase Auth `signInWithPassword()`

---

#### 1.2 User Sign Up

**Endpoint**: `/auth/sign-up`  
**Method**: `POST`  
**Authentication**: No

**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}
```

**Response (200 OK)**:
```json
{
  "message": "User created successfully!",
  "userId": "string",
  "access_token": "string",
  "expires_at": "number",
  "refresh_token": "string"
}
```

**Database Operations**:
- Supabase Auth `signUp()`
- Insert into `userprofiles` table

---

#### 1.3 Forgot Password

**Endpoint**: `/auth/forgot-password`  
**Method**: `POST`  
**Authentication**: No

**Request Body**:
```json
{
  "email": "string",
  "redirect_url": "string (optional)"
}
```

**Response (200 OK)**:
```json
{
  "message": "Email sent successfully!"
}
```

**Database Operations**: Supabase Auth `resetPasswordForEmail()`

---

#### 1.4 Reset Password

**Endpoint**: `/auth/reset-password`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "password": "string"
}
```

**Response (200 OK)**:
```json
{
  "message": "Password reset successfully!",
  "userId": "string"
}
```

**Database Operations**: Supabase Admin `updateUserById()`

---

### 2. Companies

#### 2.1 Create Company

**Endpoint**: `/companies/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "name": "string",
  "description": "string (optional)"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "string",
    "created_by": "string",
    "name": "string",
    "description": "string",
    "created_at": "string",
    "updated_at": "string",
    "owned_by": "string"
  }
}
```

**Database Operations**: Insert into `company_accounts` table

---

#### 2.2 Get All Companies

**Endpoint**: `/companies/get-all`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**: None

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "created_at": "string",
      "description": "string",
      "business_owner": {
        "businessid": "string",
        "username": "string",
        "created": "string"
      },
      "banner": {
        "url": "string"
      },
      "logo": {
        "url": "string"
      }
    }
  ]
}
```

**Database Operations**: 
- Select from `company_accounts` with relations:
  - `businessprofiles` (foreign key: `company_accounts_owned_by_fkey`)
  - `media_assets` (banner, logo)
- Filter: `is_deleted = false`
- Order: `created_at DESC`

---

#### 2.3 Get Company by ID

**Endpoint**: `/companies/get`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**:
- `company-id` (required): Company UUID

**Response (200 OK)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "created_at": "string",
    "description": "string",
    "business_owner": {
      "businessid": "string",
      "username": "string",
      "created": "string"
    },
    "banner": {
      "url": "string"
    },
    "logo": {
      "url": "string"
    }
  }
}
```

**Database Operations**: 
- Select from `company_accounts` by `id`
- Same relations as get-all
- Filter: `is_deleted = false`

---

#### 2.4 Update Company

**Endpoint**: `/companies/update`  
**Method**: `PUT`  
**Authentication**: Yes

**Query Parameters**:
- `company-id` (required): Company UUID

**Request Body**:
```json
{
  "name": "string",
  "description": "string (optional)",
  "owner_id": "string (optional)"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "string",
    "created_by": "string",
    "name": "string",
    "description": "string",
    "created_at": "string",
    "updated_at": "string",
    "owned_by": "string"
  }
}
```

**Database Operations**: 
- Update `company_accounts` by `id`
- Validate owner exists in `businessprofiles` if provided

---

#### 2.5 Delete Company

**Endpoint**: `/companies/delete`  
**Method**: `DELETE`  
**Authentication**: Yes

**Query Parameters**:
- `company-id` (required): Company UUID

**Response (201 Created)**:
```json
{
  "data": {
    "id": "string",
    "created_by": "string",
    "name": "string",
    "description": "string",
    "created_at": "string",
    "updated_at": "string",
    "owned_by": "string"
  }
}
```

**Database Operations**: Delete from `company_accounts` by `id`

---

#### 2.6 Create Company Member

**Endpoint**: `/companies/members/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "companyId": "string",
  "members": [
    {
      "email": "string",
      "name": "string"
    }
  ],
  "redirect_link": "string",
  "role": "string"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "message": "Members created successfully",
    "data": [
      {
        "id": "string",
        "member_id": "string",
        "role": "string",
        "created_at": "string",
        "updated_at": "string",
        "company_id": "string",
        "is_deleted": "boolean"
      }
    ]
  }
}
```

**Database Operations**:
- Check if user exists in `businessprofiles` or `userprofiles`
- Create new user and business profile if not exists
- Insert into `company_members` table
- Send invitation email via MailerSend

---

#### 2.7 Get Company Members

**Endpoint**: `/companies/members/get`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**:
- `company-id` (required): Company UUID

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "member_id": "string",
      "role": "string",
      "created_at": "string",
      "updated_at": "string",
      "company_id": "string",
      "is_deleted": "boolean"
    }
  ]
}
```

**Database Operations**: Select from `company_members` with `company_id`

---

#### 2.8 Delete Company Member

**Endpoint**: `/companies/members/delete`  
**Method**: `DELETE`  
**Authentication**: Yes

**Query Parameters**:
- `company-id` (required): Company UUID
- `member-id` (required): Member UUID

**Response (200 OK)**:
```json
{
  "message": "Member deleted successfully"
}
```

**Database Operations**: Delete from `company_members`

---

#### 2.9 Send Member Email

**Endpoint**: `/companies/members/send-email`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "emails": ["string"],
  "subject": "string",
  "body": "string"
}
```

**Database Operations**: Send email via MailerSend

---

#### 2.10 Get Company Admins

**Endpoint**: `/companies/admins/get-all`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**:
- `company-id` (required): Company UUID

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "member_id": "string",
      "role": "admin",
      "created_at": "string",
      "updated_at": "string",
      "company_id": "string",
      "is_deleted": "boolean"
    }
  ]
}
```

**Database Operations**: Select from `company_members` with `role = 'admin'`

---

#### 2.11 Update Company Admin

**Endpoint**: `/companies/admins/update`  
**Method**: `PUT`  
**Authentication**: Yes

**Query Parameters**:
- `company-id` (required): Company UUID
- `admin-id` (required): Admin UUID

**Request Body**:
```json
{
  "role": "string"
}
```

**Database Operations**: Update `company_members`

---

#### 2.12 Create Company Editor

**Endpoint**: `/companies/editors/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "companyId": "string",
  "editorId": "string"
}
```

**Database Operations**: Insert into `company_editors`

---

#### 2.13 Get Company Editor

**Endpoint**: `/companies/editors/get`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**:
- `company-id` (required): Company UUID

**Database Operations**: Select from `company_editors`

---

### 3. Experiences

#### 3.1 Create Experience

**Endpoint**: `/experiences/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "name": "string",
  "primary_photo": "string",
  "primary_photo_id": "string",
  "photos": ["string"],
  "photos_id": ["string"],
  "address": "string",
  "primary_keyword": "string",
  "url_slug": "string",
  "description": "string",
  "thumbnail_description": "string",
  "primary_video": "string",
  "primary_video_id": "string",
  "parent_experience": "string",
  "status": "string",
  "owned_by": "string"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "string",
    "photos_id": ["string"]
  },
  "success": true
}
```

**Database Operations**: Insert into `experiences` table

---

#### 3.2 Get All Experiences (Authenticated)

**Endpoint**: `/experiences/get-all`  
**Method**: `GET`  
**Authentication**: Yes

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "created_by": "string",
      "name": "string",
      "primary_photo": "string",
      "photos": ["string"],
      "address": "string",
      "status": "string",
      "created_at": "string",
      "updated_at": "string",
      "primary_keyword": "string",
      "url_slug": "string",
      "description": "string",
      "thumbnail_description": "string",
      "primary_video": "string",
      "parent_destination": "string",
      "completed": "boolean"
    }
  ]
}
```

**Database Operations**:
- Select from `experiences`
- Join with `visits` (count), `stories` (count), `company_accounts`
- Filter: `status = 'active'`, `owned_by != 'c7ae75f1-96f0-409d-b5e7-24ce7d304d5a'`
- Order: `created_at DESC`

---

#### 3.3 Get All Experiences (Public)

**Endpoint**: `/experiences/public/get-all`  
**Method**: `GET`  
**Authentication**: No

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "created_by": "string",
      "name": "string",
      "primary_photo": "string",
      "photos": ["string"],
      "address": "string",
      "status": "string",
      "created_at": "string",
      "updated_at": "string",
      "primary_keyword": "string",
      "url_slug": "string",
      "description": "string",
      "thumbnail_description": "string",
      "primary_video": "string",
      "parent_destination": "string",
      "owner": "string",
      "created_by": "string"
    }
  ]
}
```

**Database Operations**:
- Select from `experiences`
- Join with `company_accounts`, `businessprofiles`
- Filter: `status = 'active'`, `owned_by != 'c7ae75f1-96f0-409d-b5e7-24ce7d304d5a'`
- Order: `created_at DESC`

---

### 4. Stories

#### 4.1 Create Story

**Endpoint**: `/story/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "experience_id": "string",
  "channel_id": "string",
  "reporter_id": "string",
  "notes": "string",
  "story_content": "string",
  "media": ["string"],
  "seo_title_tag": "string",
  "seo_meta_desc": "string",
  "seo_excerpt": "string",
  "seo_slug": "string",
  "long_tail_keyword": "string",
  "hashtags": ["string"]
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "message": "Story created successfully",
    "id": "string",
    "media": ["string"],
    "linksToTripReport": "string"
  }
}
```

**Database Operations**:
- Insert into `stories` table
- Insert into `reporters_stories` (secondary schema)
- Insert into `media_assets`
- Insert into `story_media`

---

#### 4.2 Get All Stories (Authenticated)

**Endpoint**: `/story/get-all`  
**Method**: `GET`  
**Authentication**: Yes

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "status": "string",
      "title": "string",
      "created_at": "string",
      "user_id": "string",
      "experience_id": "string",
      "notes": "string",
      "story_content": "string",
      "media_assets": [{"url": "string"}],
      "channels": {
        "channel_type": "string",
        "name": "string"
      },
      "userprofiles": {
        "email": "string",
        "firstname": "string",
        "lastname": "string",
        "media_assets": [{"url": "string"}]
      },
      "likes": {"count": "number"},
      "shares": {"count": "number"},
      "comments": {"count": "number"}
    }
  ]
}
```

**Database Operations**:
- Select from `stories` by `user_id`
- Join with `media_assets`, `channels`, `userprofiles`, `likes`, `shares`, `comments`
- Order: `created_at DESC`

---

#### 4.3 Get All Stories (Public)

**Endpoint**: `/story/public/get-all`  
**Method**: `GET`  
**Authentication**: No

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "status": "string",
      "title": "string",
      "created_at": "string",
      "user_id": "string",
      "experience_id": "string",
      "notes": "string",
      "story_content": "string",
      "media_assets": [{"url": "string"}],
      "channels": {
        "channel_type": "string",
        "name": "string"
      },
      "userprofiles": {
        "email": "string",
        "firstname": "string",
        "lastname": "string",
        "media_assets": [{"url": "string"}]
      },
      "likes": {"count": "number"},
      "shares": {"count": "number"},
      "comments": {"count": "number"}
    }
  ]
}
```

**Database Operations**:
- Select from `stories`
- Filter: `status = 'PUBLISHED'`, `channels.channel_type = 'Travel Buddy'`
- Same joins as authenticated version

---

#### 4.4 Toggle Story Like

**Endpoint**: `/story/likes/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "story_id": "string"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "message": "Liked",
    "status": true,
    "like_id": "string"
  }
}
```

**Response (200 OK - Unlike)**:
```json
{
  "data": {
    "message": "Unliked",
    "status": false,
    "like_id": "string"
  }
}
```

**Database Operations**:
- Check if like exists in `likes` table
- Insert new like or delete existing like

---

#### 4.5 Create Story Comment

**Endpoint**: `/story/comments/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "story_id": "string",
  "content": "string",
  "media": [
    {
      "url": "string",
      "path": "string (optional)"
    }
  ]
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "message": "Comment created successfully",
    "id": "string",
    "media": ["string"]
  }
}
```

**Database Operations**:
- Insert into `comments` table
- Insert into `media_assets`
- Insert into `comment_media`

---

### 5. Profile

#### 5.1 Get Business Profile

**Endpoint**: `/profile/business`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**:
- `user-id` (optional): User UUID
- `company` (optional): Company name filter

**Response (200 OK)**:
```json
{
  "data": {
    "businessid": "string",
    "businessname": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "website": "string",
    "type": "string",
    "created_at": "string",
    "updated_at": "string",
    "status": "string",
    "logo_id": "string",
    "editors": ["string"],
    "companies": [
      {
        "id": "string",
        "name": "string",
        "role": "string"
      }
    ],
    "first_time": "boolean"
  },
  "success": true
}
```

**Database Operations**:
- Select from `businessprofiles`
- Join with `company_members` and `company_accounts`
- Filter: `company_members.is_deleted = false`
- Calculate `first_time` based on user creation and sign-in timestamps

---

### 6. Storage

#### 6.1 Upload Image

**Endpoint**: `/storage/upload_image`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "imageBase64": "string",
  "bucket": "string",
  "title": "string"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "signedUrl": "string",
  "message": "File uploaded successfully!"
}
```

**Database Operations**:
- Upload to Supabase Storage
- Generate signed URL (1 year expiry)
- File path: `{userId}/{title}/{hash}.jpg`

**Configuration**: Max body size: 4.5MB

---

#### 6.2 Upload Video

**Endpoint**: `/storage/upload_video`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "videoBase64": "string",
  "bucket": "string",
  "title": "string"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "signedUrl": "string",
  "message": "File uploaded successfully!"
}
```

**Database Operations**: Similar to image upload

---

#### 6.3 Upload Multiple Images

**Endpoint**: `/storage/upload-images/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "images": [
    {
      "imageBase64": "string",
      "bucket": "string",
      "title": "string"
    }
  ]
}
```

---

#### 6.4 Upload Image (Resumable)

**Endpoint**: `/storage/upload-image/resumable/create`  
**Method**: `POST`  
**Authentication**: Yes

Supports resumable uploads for large files

---

#### 6.5 Initialize Image Upload

**Endpoint**: `/storage/upload-image/initialize/create`  
**Method**: `POST`  
**Authentication**: Yes

Initializes multipart upload

---

### 7. Agents

#### 7.1 Search Agent

**Endpoint**: `/agents/search/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "query": "string",
  "word_limit": "number",
  "custom_system_prompt": "string",
  "topic": "string"
}
```

**Response (201 Created)**:
```json
{
  "answer": "string"
}
```

**Database Operations**: Uses LangChain agent with web search

---

#### 7.2 Intent Classifier

**Endpoint**: `/agents/intent-classifier/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "query": "string"
}
```

**Response**: Classified intent

---

#### 7.3 Foreign Server

**Endpoint**: `/agents/foreignServer`  
**Method**: `POST`  
**Authentication**: Yes

Proxy to external AI services

---

#### 7.4 Chat History

**Endpoint**: `/agents/chat/history/get-all`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: Chat history for authenticated user

---

### 8. Analytics

#### 8.1 Business Overview - Experiences

**Endpoint**: `/analytics/business/overview/experiences/get`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: Experience analytics overview

---

#### 8.2 Business Overview - Explorers

**Endpoint**: `/analytics/business/overview/explorers/get`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: Explorer analytics overview

---

#### 8.3 Business Overview - Stories

**Endpoint**: `/analytics/business/overview/stories/get`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: Story analytics overview

---

#### 8.4 Business Daily - Stories/Photos

**Endpoint**: `/analytics/business/daily/stories-photos/get`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: Daily stories and photos analytics

---

#### 8.5 Business Daily - Unique Users

**Endpoint**: `/analytics/business/daily/unique-users/get`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: Daily unique users analytics

---

#### 8.6 Business All Experiences

**Endpoint**: `/analytics/business/all/experiences/get`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: All experiences analytics

---

#### 8.7 Business Top Stories

**Endpoint**: `/analytics/business/top/stories/get`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: Top performing stories

---

#### 8.8 Business Top Visitors

**Endpoint**: `/analytics/business/top/visitors/get`  
**Method**: `GET`  
**Authentication**: Yes

**Response**: Top visitors analytics

---

### 9. Activities

#### 9.1 Create Activity

**Endpoint**: `/activities/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "experience_id": "string"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "experience_id": "string"
  }
}
```

**Database Operations**: Insert into `activities` table

---

#### 9.2 Get Activity

**Endpoint**: `/activities/get`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**:
- `activity-id` (required): Activity UUID

**Response (200 OK)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "experience_id": "string"
  }
}
```

---

#### 9.3 Get Experience Activities

**Endpoint**: `/activities/experience/get`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**:
- `experience-id` (required): Experience UUID

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "experience_id": "string"
    }
  ]
}
```

---

#### 9.4 Update Activity

**Endpoint**: `/activities/update`  
**Method**: `PUT`  
**Authentication**: Yes

**Query Parameters**:
- `activity-id` (required): Activity UUID

**Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "experience_id": "string"
  }
}
```

---

#### 9.5 Delete Activity

**Endpoint**: `/activities/delete`  
**Method**: `DELETE`  
**Authentication**: Yes

**Query Parameters**:
- `activity-id` (required): Activity UUID

**Response (200 OK)**:
```json
{
  "message": "Activity deleted successfully"
}
```

---

### 10. Attraction

#### 10.1 Create Attraction

**Endpoint**: `/attraction/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "experience_id": "string"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "experience_id": "string"
  }
}
```

---

#### 10.2 Get Attraction

**Endpoint**: `/attraction/get`  
**Method**: `GET`  
**Authentication**: Yes

**Query Parameters**:
- `attraction-id` (required): Attraction UUID

**Response (200 OK)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "experience_id": "string"
  }
}
```

---

#### 10.3 Update Attraction

**Endpoint**: `/attraction/update`  
**Method**: `PUT`  
**Authentication**: Yes

**Query Parameters**:
- `attraction-id` (required): Attraction UUID

**Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "experience_id": "string"
  }
}
```

---

### 11. Channel

#### 11.1 Create Channel

**Endpoint**: `/channel/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "name": "string",
  "channel_type": "string"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "channel_type": "string"
  }
}
```

---

#### 11.2 Get All Channels

**Endpoint**: `/channel/get-all`  
**Method**: `GET`  
**Authentication**: Yes

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "channel_type": "string"
    }
  ]
}
```

---

#### 11.3 Update Channel

**Endpoint**: `/channel/update`  
**Method**: `PUT`  
**Authentication**: Yes

**Query Parameters**:
- `channel-id` (required): Channel UUID

**Request Body**:
```json
{
  "name": "string",
  "channel_type": "string"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "channel_type": "string"
  }
}
```

---

### 12. Destination

**Note**: The destination module has 23 endpoints for CRUD operations on destinations. Key endpoints include:

- `/destination/create` - Create new destination
- `/destination/get` - Get destination by ID
- `/destination/get-all` - Get all destinations
- `/destination/update` - Update destination
- `/destination/delete` - Delete destination
- `/destination/{id}/experiences` - Get experiences for destination
- `/destination/{id}/attractions` - Get attractions for destination
- `/destination/{id}/activities` - Get activities for destination

---

### 13. Locations

#### 13.1 Get Location

**Endpoint**: `/locations/get`  
**Method**: `GET`  
**Authentication**: No

**Query Parameters**:
- `location-id` (required): Location UUID

**Response (200 OK)**:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "address": "string",
    "latitude": "number",
    "longitude": "number"
  }
}
```

---

#### 13.2 Get All Locations

**Endpoint**: `/locations/get-all`  
**Method**: `GET`  
**Authentication**: No

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "address": "string",
      "latitude": "number",
      "longitude": "number"
    }
  ]
}
```

---

#### 13.3 Create Location

**Endpoint**: `/locations/create`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "name": "string",
  "address": "string",
  "latitude": "number",
  "longitude": "number"
}
```

---

#### 13.4 Update Location

**Endpoint**: `/locations/update`  
**Method**: `PUT`  
**Authentication**: Yes

**Query Parameters**:
- `location-id` (required): Location UUID

**Request Body**:
```json
{
  "name": "string",
  "address": "string",
  "latitude": "number",
  "longitude": "number"
}
```

---

### 14. Email

#### 14.1 Send Email

**Endpoint**: `/email/send`  
**Method**: `POST`  
**Authentication**: Yes

**Request Body**:
```json
{
  "sender": "string",
  "senderName": "string",
  "to": ["string"],
  "bcc": ["string"],
  "subject": "string",
  "html": "string"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Database Operations**: Send via MailerSend API

---

## Database Schema

### Key Tables

#### `company_accounts`
- `id` (UUID, PK)
- `name` (string)
- `description` (string)
- `created_by` (UUID)
- `owned_by` (UUID, FK → businessprofiles)
- `banner_media_id` (UUID, FK → media_assets)
- `logo_id` (UUID, FK → media_assets)
- `is_deleted` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `company_members`
- `id` (UUID, PK)
- `company_id` (UUID, FK → company_accounts)
- `member_id` (UUID, FK → businessprofiles)
- `role` (string)
- `is_deleted` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `experiences`
- `id` (UUID, PK)
- `name` (string)
- `primary_photo` (string)
- `photos` (array)
- `address` (string)
- `description` (string)
- `thumbnail_description` (string)
- `primary_video` (string)
- `status` (string: active, inactive, internal)
- `primary_keyword` (string)
- `url_slug` (string)
- `parent_experience` (UUID)
- `owned_by` (UUID, FK → company_accounts)
- `created_by` (UUID)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `stories`
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `experience_id` (UUID, FK → experiences)
- `channel_id` (UUID, FK → channels)
- `status` (string: DRAFT, PUBLISHED)
- `title` (string)
- `notes` (string)
- `story_content` (string)
- `seo_title_tag` (string)
- `seo_meta_desc` (string)
- `seo_excerpt` (string)
- `seo_slug` (string)
- `long_tail_keyword` (string)
- `hashtags` (array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `likes`
- `id` (UUID, PK)
- `story_id` (UUID, FK → stories)
- `user_id` (UUID, FK → auth.users)
- `created_at` (timestamp)

#### `comments`
- `id` (UUID, PK)
- `story_id` (UUID, FK → stories)
- `user_id` (UUID, FK → auth.users)
- `content` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `media_assets`
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `url` (string)
- `storage_path` (string)
- `usage` (string: story, comment, profile, etc.)
- `mime_type` (string)
- `created_at` (timestamp)

#### `businessprofiles`
- `businessid` (UUID, PK)
- `businessname` (string)
- `username` (string)
- `email` (string)
- `phone` (string)
- `address` (string)
- `website` (string)
- `type` (string)
- `status` (string)
- `logo_id` (UUID, FK → media_assets)
- `editors` (array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `userprofiles`
- `userid` (UUID, PK)
- `username` (string)
- `firstname` (string)
- `lastname` (string)
- `email` (string)
- `phone` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `channels`
- `id` (UUID, PK)
- `name` (string)
- `channel_type` (string)
- `created_at` (timestamp)

#### `activities`
- `id` (UUID, PK)
- `name` (string)
- `description` (string)
- `experience_id` (UUID, FK → experiences)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `attractions`
- `id` (UUID, PK)
- `name` (string)
- `description` (string)
- `experience_id` (UUID, FK → experiences)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## Common Response Patterns

### Success Response
```json
{
  "data": {},
  "success": true
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

### Method Not Allowed (405)
```json
{
  "error": "Method not allowed"
}
```

### Unauthorized (401)
```json
{
  "error": "Unauthorized!"
}
```

### Not Found (404)
```json
{
  "error": "Resource not found"
}
```

### Internal Server Error (500)
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently, no explicit rate limiting is implemented. Consider implementing for production.

---

## CORS

CORS is configured to allow requests from the frontend domain. Update environment variables as needed.

---

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
NEXT_PUBLIC_BASE_URL=your_base_url
NODE_ENV=production|development
```

---

## API Versioning

Current version: `v1`

All endpoints are prefixed with `/api/v1/`

---

## Pagination

Pagination is not currently implemented across all endpoints. Consider adding for large datasets.

---

## Sorting

Most list endpoints support sorting via `order()` in Supabase queries. Default sorting is by `created_at DESC`.

---

## Filtering

Common filters:
- `is_deleted = false` - Exclude soft-deleted records
- `status = 'active'` - Filter by active status
- `owned_by != 'c7ae75f1-96f0-409d-b5e7-24ce7d304d5a'` - Exclude default Edge8 AI company

---

## Testing

Use the provided Swagger documentation for testing endpoints interactively.

---

## Support

For API issues, contact the development team or create an issue in the repository.
