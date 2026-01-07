# Technical Analysis: Next.js API to FastAPI Migration

## Document Overview

This document provides a detailed technical analysis of migrating the Travel Buddy API from TypeScript Next.js API routes to Python FastAPI. It covers architectural patterns, code transformations, database operations, authentication, and all technical considerations.

---

## Table of Contents

1. [Architecture Comparison](#architecture-comparison)
2. [Code Transformation Patterns](#code-transformation-patterns)
3. [Database Operations](#database-operations)
4. [Authentication & Authorization](#authentication--authorization)
5. [Error Handling](#error-handling)
6. [Validation & Serialization](#validation--serialization)
7. [File Uploads & Storage](#file-uploads--storage)
8. [AI/ML Integration](#aiml-integration)
9. [Email Integration](#email-integration)
10. [Performance Considerations](#performance-considerations)
11. [Security Considerations](#security-considerations)
12. [Testing Strategy](#testing-strategy)
13. [Deployment Architecture](#deployment-architecture)
14. [Monitoring & Observability](#monitoring--observability)

---

## Architecture Comparison

### Current Architecture (Next.js API Routes)

```typescript
// pages/api/companies/get-all.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    const supabase = createApiClient(token!);
    
    try {
        const { data: queryData, error } = await supabase
            .from("company_accounts")
            .select(`
                id,name,created_at,
                description,
                business_owner:businessprofiles!company_accounts_owned_by_fkey(businessid,username,created),
                banner:media_assets!company_accounts_banner_media_id_fkey(url),
                logo:media_assets!company_accounts_logo_id_fkey(url)
            `)
            .is('is_deleted', false)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}
```

**Characteristics**:
- File-based routing: `/pages/api/{module}/{action}.ts`
- Handler function pattern
- Manual method checking
- Supabase SDK for database operations
- Manual error handling
- No built-in validation
- Swagger exports as workaround

### Target Architecture (FastAPI)

```python
# app/api/v1/companies/router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.db.session import get_db
from app.api.v1.companies.schemas import CompanyResponse
from app.api.v1.companies.models import CompanyAccount
from app.core.security import verify_token

router = APIRouter(prefix="/companies", tags=["companies"])

@router.get("/get-all", response_model=List[CompanyResponse])
async def get_all_companies(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    """Get all companies with related data"""
    query = (
        select(CompanyAccount)
        .where(CompanyAccount.is_deleted == False)
        .order_by(CompanyAccount.created_at.desc())
    )
    
    result = await db.execute(query)
    companies = result.scalars().all()
    
    # Load relationships
    for company in companies:
        await db.refresh(company, ["business_owner", "banner", "logo"])
    
    return companies
```

**Characteristics**:
- Router-based organization
- Decorator pattern for endpoints
- Automatic method routing
- SQLAlchemy ORM for database operations
- Built-in exception handling
- Pydantic for validation
- Auto-generated OpenAPI/Swagger

---

## Code Transformation Patterns

### Pattern 1: Handler to Router Function

**TypeScript (Next.js)**:
```typescript
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { name, description } = req.body;
    // ... implementation
}
```

**Python (FastAPI)**:
```python
from fastapi import APIRouter, status

router = APIRouter()

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_company(
    name: str,
    description: Optional[str] = None
):
    # ... implementation
```

### Pattern 2: Request Body Extraction

**TypeScript**:
```typescript
const { name, description } = req.body;
```

**Python**:
```python
# Option 1: Direct parameters
async def create_company(name: str, description: Optional[str] = None):
    pass

# Option 2: Pydantic model
class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None

async def create_company(company: CompanyCreate):
    pass
```

### Pattern 3: Query Parameters

**TypeScript**:
```typescript
const companyId = req.query["company-id"];
```

**Python**:
```python
from fastapi import Query

async def get_company(
    company_id: str = Query(..., alias="company-id")
):
    pass
```

### Pattern 4: Headers Extraction

**TypeScript**:
```typescript
const token = req.headers.authorization?.split(' ')[1];
```

**Python**:
```python
from fastapi import Header

async def get_company(
    authorization: Optional[str] = Header(None)
):
    token = authorization.split(' ')[1] if authorization else None
```

### Pattern 5: Response Formatting

**TypeScript**:
```typescript
return res.status(200).json({ data: queryData });
```

**Python**:
```python
from fastapi import Response

# Option 1: Auto-serialization
return {"data": query_data}

# Option 2: With status code
from fastapi import status
return {"data": query_data}, status.HTTP_200_OK
```

---

## Database Operations

### Supabase SDK vs SQLAlchemy

#### Current: Supabase SDK (TypeScript)

```typescript
// Select with relations
const { data, error } = await supabase
    .from("company_accounts")
    .select(`
        id,name,created_at,
        description,
        business_owner:businessprofiles!company_accounts_owned_by_fkey(businessid,username,created),
        banner:media_assets!company_accounts_banner_media_id_fkey(url),
        logo:media_assets!company_accounts_logo_id_fkey(url)
    `)
    .is('is_deleted', false)
    .order("created_at", { ascending: false });

// Insert
const { data, error } = await supabase
    .from('company_accounts')
    .insert({ name, description })
    .select('*')
    .single();

// Update
const { data, error } = await supabase
    .from('company_accounts')
    .update({ name, description })
    .eq('id', company_id)
    .select('*')
    .single();

// Delete
const { data, error } = await supabase
    .from('company_accounts')
    .delete()
    .eq('id', company_id)
    .select('*')
    .single();
```

#### Target: SQLAlchemy ORM (Python)

```python
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import CompanyAccount

# Select with relations
async def get_all_companies(db: AsyncSession):
    query = (
        select(CompanyAccount)
        .options(
            selectinload(CompanyAccount.business_owner),
            selectinload(CompanyAccount.banner),
            selectinload(CompanyAccount.logo)
        )
        .where(CompanyAccount.is_deleted == False)
        .order_by(CompanyAccount.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()

# Insert
async def create_company(db: AsyncSession, company_data: CompanyCreate):
    company = CompanyAccount(**company_data.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company

# Update
async def update_company(db: AsyncSession, company_id: str, update_data: CompanyUpdate):
    query = (
        update(CompanyAccount)
        .where(CompanyAccount.id == company_id)
        .values(**update_data.model_dump(exclude_unset=True))
    )
    await db.execute(query)
    await db.commit()
    
    # Fetch updated record
    result = await db.execute(
        select(CompanyAccount).where(CompanyAccount.id == company_id)
    )
    return result.scalar_one()

# Delete
async def delete_company(db: AsyncSession, company_id: str):
    query = (
        delete(CompanyAccount)
        .where(CompanyAccount.id == company_id)
    )
    await db.execute(query)
    await db.commit()
```

### SQLAlchemy Model Definitions

```python
# app/db/models/company.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class CompanyAccount(Base):
    __tablename__ = "company_accounts"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by = Column(String, nullable=True)
    owned_by = Column(String, ForeignKey("businessprofiles.businessid"), nullable=True)
    banner_media_id = Column(String, ForeignKey("media_assets.id"), nullable=True)
    logo_id = Column(String, ForeignKey("media_assets.id"), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    business_owner = relationship("BusinessProfile", back_populates="companies_owned")
    banner = relationship("MediaAsset", foreign_keys=[banner_media_id])
    logo = relationship("MediaAsset", foreign_keys=[logo_id])
    members = relationship("CompanyMember", back_populates="company")

class CompanyMember(Base):
    __tablename__ = "company_members"
    
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("company_accounts.id"), nullable=False)
    member_id = Column(String, ForeignKey("businessprofiles.businessid"), nullable=False)
    role = Column(String, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company = relationship("CompanyAccount", back_populates="members")
    member = relationship("BusinessProfile", back_populates="company_memberships")
```

### Complex Query Examples

#### Join with Filtering

**TypeScript**:
```typescript
const { data, error } = await supabase.from("experiences")
    .select('*,visits(count),stories(count),company_accounts(id,name)')
    .eq('status', 'active')
    .eq('visits.user_id', user!.id)
    .eq('stories.user_id', user!.id)
    .neq('owned_by', "c7ae75f1-96f0-409d-b5e7-24ce7d304d5a")
    .not('owned_by', 'is', null)
    .order("created_at", { ascending: false });
```

**Python**:
```python
from sqlalchemy import select, func, and_, not_
from sqlalchemy.orm import aliased

async def get_user_experiences(db: AsyncSession, user_id: str):
    # Subquery for visits count
    visits_subq = (
        select(
            Experience.id,
            func.count(Visit.id).label('visit_count')
        )
        .join(Visit, Visit.experience_id == Experience.id)
        .where(Visit.user_id == user_id)
        .group_by(Experience.id)
        .subquery()
    )
    
    # Subquery for stories count
    stories_subq = (
        select(
            Experience.id,
            func.count(Story.id).label('story_count')
        )
        .join(Story, Story.experience_id == Experience.id)
        .where(Story.user_id == user_id)
        .group_by(Experience.id)
        .subquery()
    )
    
    # Main query
    query = (
        select(
            Experience,
            CompanyAccount.id.label('company_id'),
            CompanyAccount.name.label('company_name'),
            func.coalesce(visits_subq.c.visit_count, 0).label('visits_count'),
            func.coalesce(stories_subq.c.story_count, 0).label('stories_count')
        )
        .join(CompanyAccount, CompanyAccount.id == Experience.owned_by)
        .outerjoin(visits_subq, visits_subq.c.id == Experience.id)
        .outerjoin(stories_subq, stories_subq.c.id == Experience.id)
        .where(
            and_(
                Experience.status == 'active',
                Experience.owned_by != "c7ae75f1-96f0-409d-b5e7-24ce7d304d5a",
                Experience.owned_by.isnot(None)
            )
        )
        .order_by(Experience.created_at.desc())
    )
    
    result = await db.execute(query)
    return result.all()
```

#### Aggregation Queries

**TypeScript**:
```typescript
const { data } = await supabase
    .from("stories")
    .select(`*, 
      media_assets(url), 
      channels(channel_type, name), 
      userprofiles(email, firstname, lastname, media_assets(url)),
      likes(count),
      shares(count),
      comments(count)`)
    .eq("status", "PUBLISHED")
    .eq("channels.channel_type", "Travel Buddy")
    .order("created_at", { ascending: false });
```

**Python**:
```python
async def get_published_stories(db: AsyncSession):
    query = (
        select(
            Story,
            func.count(Like.id).label('likes_count'),
            func.count(Share.id).label('shares_count'),
            func.count(Comment.id).label('comments_count')
        )
        .join(Story.media_assets)
        .join(Story.channel)
        .join(Story.user_profile)
        .outerjoin(Like, Like.story_id == Story.id)
        .outerjoin(Share, Share.story_id == Story.id)
        .outerjoin(Comment, Comment.story_id == Story.id)
        .where(
            and_(
                Story.status == 'PUBLISHED',
                Channel.channel_type == 'Travel Buddy'
            )
        )
        .group_by(Story.id)
        .order_by(Story.created_at.desc())
    )
    
    result = await db.execute(query)
    return result.all()
```

---

## Authentication & Authorization

### Current: Supabase Auth SDK

```typescript
import { createApiClient } from "@/libs/supabase/supabaseApi";
import isAuthenticated from "@/libs/services/authorization";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = req.headers.authorization?.split(' ')[1];
    const isJwtValid = await isAuthenticated(token);

    if (!isJwtValid) {
        return res.status(401).json({ error: "Unauthorized!" });
    }

    const supabase = createApiClient(token!);
    const { data: { user } } = await supabase.auth.getUser();
    
    // ... use user.id
}
```

### Target: FastAPI Dependencies

```python
# app/core/security.py
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer()

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Verify JWT token and return user ID"""
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_id
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[str]:
    """Optional authentication - returns None if no token"""
    if credentials is None:
        return None
    return await verify_token(credentials)

# Usage in endpoints
@router.get("/protected")
async def protected_endpoint(
    user_id: str = Depends(verify_token)
):
    return {"user_id": user_id}

@router.get("/public")
async def public_endpoint(
    user_id: Optional[str] = Depends(get_optional_user)
):
    if user_id:
        return {"user_id": user_id, "authenticated": True}
    return {"authenticated": False}
```

### Role-Based Authorization

```python
# app/core/authorization.py
from enum import Enum
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import CompanyMember, BusinessProfile

class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "admin"
    EDITOR = "editor"
    MEMBER = "member"

async def verify_company_role(
    company_id: str,
    required_role: UserRole,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
) -> BusinessProfile:
    """Verify user has required role in company"""
    
    # Check if user is SUPER_ADMIN
    user_query = select(BusinessProfile).where(
        BusinessProfile.businessid == user_id,
        BusinessProfile.type == "SUPER_ADMIN"
    )
    user_result = await db.execute(user_query)
    if user_result.scalar_one_or_none():
        return user_result
    
    # Check company membership
    member_query = select(CompanyMember).where(
        CompanyMember.company_id == company_id,
        CompanyMember.member_id == user_id,
        CompanyMember.is_deleted == False
    )
    member_result = await db.execute(member_query)
    member = member_result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this company"
        )
    
    # Check role hierarchy
    role_hierarchy = {
        UserRole.SUPER_ADMIN: 4,
        UserRole.ADMIN: 3,
        UserRole.EDITOR: 2,
        UserRole.MEMBER: 1
    }
    
    if role_hierarchy.get(member.role, 0) < role_hierarchy.get(required_role, 0):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Requires {required_role} role"
        )
    
    return member

# Usage
@router.put("/companies/{company_id}")
async def update_company(
    company_id: str,
    user: BusinessProfile = Depends(
        lambda user_id, db: verify_company_role(
            company_id,
            UserRole.ADMIN,
            user_id,
            db
        )
    )
):
    pass
```

---

## Error Handling

### Current: Manual Error Handling

```typescript
try {
    const { data, error } = await supabase
        .from('company_accounts')
        .insert({ name, description })
        .select('*')
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ data });
} catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
}
```

### Target: FastAPI Exception Handlers

```python
# app/core/exceptions.py
from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

class AppException(Exception):
    """Base application exception"""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request"):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)

class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status.HTTP_409_CONFLICT)

# Exception handlers
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message}
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Database error occurred"}
    )

async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error"}
    )

# Register handlers in main.py
from fastapi import FastAPI

app = FastAPI()
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
```

### Usage in Endpoints

```python
@router.post("/create")
async def create_company(company: CompanyCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Check if company exists
        existing = await db.execute(
            select(CompanyAccount).where(CompanyAccount.name == company.name)
        )
        if existing.scalar_one_or_none():
            raise ConflictException("Company already exists")
        
        # Create company
        new_company = CompanyAccount(**company.model_dump())
        db.add(new_company)
        await db.commit()
        await db.refresh(new_company)
        
        return {"data": new_company}
        
    except SQLAlchemyError as e:
        await db.rollback()
        raise
```

---

## Validation & Serialization

### Current: Manual Validation

```typescript
const { name, description } = req.body;

if (!name) {
    return res.status(400).json({ error: 'Missing required fields' });
}
```

### Target: Pydantic Models

```python
# app/api/v1/companies/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CompanyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Company name")
    description: Optional[str] = Field(None, max_length=5000, description="Company description")
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    owned_by: Optional[str] = None
    
    class Config:
        # Allow partial updates
        extra = "forbid"

class CompanyResponse(CompanyBase):
    id: str
    created_by: Optional[str]
    owned_by: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    is_deleted: bool = False
    
    # Nested relationships
    business_owner: Optional["BusinessProfileResponse"] = None
    banner: Optional["MediaAssetResponse"] = None
    logo: Optional["MediaAssetResponse"] = None
    
    class Config:
        from_attributes = True

class BusinessProfileResponse(BaseModel):
    businessid: str
    businessname: str
    username: Optional[str]
    email: str
    
    class Config:
        from_attributes = True

class MediaAssetResponse(BaseModel):
    id: str
    url: str
    
    class Config:
        from_attributes = True

# Forward references for circular dependencies
CompanyResponse.model_rebuild()
```

### Complex Validation

```python
from pydantic import BaseModel, field_validator, model_validator

class StoryCreate(BaseModel):
    experience_id: str
    channel_id: str
    story_content: str = Field(..., min_length=1, max_length=100000)
    media: List[str] = Field(default_factory=list)
    seo_title_tag: Optional[str] = Field(None, max_length=60)
    seo_meta_desc: Optional[str] = Field(None, max_length=160)
    hashtags: List[str] = Field(default_factory=list)
    
    @field_validator('media')
    @classmethod
    def validate_media_urls(cls, v: List[str]) -> List[str]:
        import re
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        for url in v:
            if not url_pattern.match(url):
                raise ValueError(f'Invalid URL: {url}')
        return v
    
    @field_validator('hashtags')
    @classmethod
    def validate_hashtags(cls, v: List[str]) -> List[str]:
        for tag in v:
            if not tag.startswith('#'):
                raise ValueError(f'Hashtag must start with #: {tag}')
            if len(tag) > 50:
                raise ValueError(f'Hashtag too long: {tag}')
        return v
    
    @model_validator(mode='after')
    def validate_content_length(self) -> 'StoryCreate':
        if len(self.story_content) < 10:
            raise ValueError('Story content must be at least 10 characters')
        return self
```

---

## File Uploads & Storage

### Current: Base64 Upload

```typescript
import { base64toBinary } from "@/libs/services/utils";

export const imageToStorage = async (
  inputobj: ImageUploadInput,
  supabase: SupabaseClient
): Promise<SignedUrlResponse> => {
  const hash = crypto.randomBytes(16).toString("hex");
  const fileName = `${inputobj.title.replace(/\s+/g, "")}/${hash}.jpg`;
  const storageRef = `${inputobj.userId}/${fileName}`;
  
  const uploadTask = await supabase.storage
    .from(inputobj.bucket)
    .upload(storageRef, inputobj.data, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/jpg",
    });

  if (uploadTask.error) {
    return { error: uploadTask.error };
  }
  
  const { data, error } = await supabase.storage
    .from(inputobj.bucket)
    .createSignedUrl(uploadTask.data.path, 60 * 60 * 24 * 365);

  return { data: data?.signedUrl };
};
```

### Target: Multipart Upload

```python
# app/api/v1/storage/router.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid
import os
from pathlib import Path

from app.db.session import get_db
from app.services.storage import StorageService
from app.core.security import verify_token

router = APIRouter(prefix="/storage", tags=["storage"])

@router.post("/upload_image")
async def upload_image(
    file: UploadFile = File(...),
    bucket: str = Form(...),
    title: str = Form(...),
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    """Upload image to storage"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    # Validate file size (4.5MB max)
    MAX_SIZE = 4.5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large (max 4.5MB)"
        )
    
    # Generate unique filename
    file_hash = uuid.uuid4().hex
    clean_title = title.replace(" ", "")
    filename = f"{clean_title}/{file_hash}.jpg"
    storage_path = f"{user_id}/{filename}"
    
    # Upload to Supabase Storage
    storage_service = StorageService()
    result = await storage_service.upload_file(
        bucket=bucket,
        path=storage_path,
        file_data=contents,
        content_type="image/jpeg"
    )
    
    if result.error:
        raise HTTPException(
            status_code=500,
            detail=result.error
        )
    
    # Create signed URL (1 year expiry)
    signed_url = await storage_service.create_signed_url(
        bucket=bucket,
        path=result.path,
        expires_in=60 * 60 * 24 * 365  # 1 year
    )
    
    # Save to database
    media_asset = MediaAsset(
        user_id=user_id,
        url=signed_url,
        storage_path=result.path,
        usage="profile",
        mime_type=file.content_type
    )
    db.add(media_asset)
    await db.commit()
    await db.refresh(media_asset)
    
    return {
        "success": True,
        "signedUrl": signed_url,
        "message": "File uploaded successfully!",
        "media_id": media_asset.id
    }

@router.post("/upload-images")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    bucket: str = Form(...),
    title: str = Form(...),
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    """Upload multiple images"""
    results = []
    
    for file in files:
        try:
            # Process each file
            result = await upload_single_image(file, bucket, title, user_id, db)
            results.append({
                "filename": file.filename,
                "success": True,
                "media_id": result["media_id"]
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return {"results": results}
```

### Storage Service

```python
# app/services/storage.py
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional
import io

class StorageService:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
    
    async def upload_file(
        self,
        bucket: str,
        path: str,
        file_data: bytes,
        content_type: str,
        upsert: bool = True
    ) -> dict:
        """Upload file to Supabase Storage"""
        result = self.client.storage.from_(bucket).upload(
            path=path,
            file=file_data,
            file_options={
                "contentType": content_type,
                "upsert": str(upsert).lower(),
                "cacheControl": "3600"
            }
        )
        
        if hasattr(result, 'error') and result.error:
            return {"error": result.error.message}
        
        return {"path": result.path}
    
    async def create_signed_url(
        self,
        bucket: str,
        path: str,
        expires_in: int = 3600
    ) -> str:
        """Create signed URL for file"""
        result = self.client.storage.from_(bucket).create_signed_url(
            path=path,
            expires_in=expires_in
        )
        
        if hasattr(result, 'error') and result.error:
            raise Exception(result.error.message)
        
        return result.signedUrl
    
    async def delete_file(self, bucket: str, path: str) -> bool:
        """Delete file from storage"""
        result = self.client.storage.from_(bucket).remove([path])
        
        if hasattr(result, 'error') and result.error:
            raise Exception(result.error.message)
        
        return True
    
    async def get_file_url(self, bucket: str, path: str) -> str:
        """Get public URL for file"""
        result = self.client.storage.from_(bucket).get_public_url(path)
        return result
```

### Resumable Uploads

```python
# app/api/v1/storage/resumable.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import StreamingResponse
import asyncio
from pathlib import Path
import shutil

router = APIRouter(prefix="/storage/upload-image/resumable", tags=["storage"])

# Store upload sessions in memory (use Redis in production)
upload_sessions = {}

@router.post("/initialize")
async def initialize_upload(
    filename: str = Form(...),
    file_size: int = Form(...),
    chunk_size: int = Form(default=5 * 1024 * 1024),  # 5MB chunks
    user_id: str = Depends(verify_token)
):
    """Initialize resumable upload"""
    upload_id = str(uuid.uuid4())
    total_chunks = (file_size + chunk_size - 1) // chunk_size
    
    upload_sessions[upload_id] = {
        "filename": filename,
        "file_size": file_size,
        "chunk_size": chunk_size,
        "total_chunks": total_chunks,
        "uploaded_chunks": set(),
        "temp_path": Path(f"/tmp/uploads/{upload_id}")
    }
    
    # Create temp directory
    upload_sessions[upload_id]["temp_path"].mkdir(parents=True, exist_ok=True)
    
    return {
        "upload_id": upload_id,
        "total_chunks": total_chunks,
        "chunk_size": chunk_size
    }

@router.post("/chunk")
async def upload_chunk(
    upload_id: str = Form(...),
    chunk_index: int = Form(...),
    chunk: UploadFile = File(...),
    user_id: str = Depends(verify_token)
):
    """Upload a chunk"""
    if upload_id not in upload_sessions:
        raise HTTPException(status_code=404, detail="Upload session not found")
    
    session = upload_sessions[upload_id]
    
    # Save chunk
    chunk_path = session["temp_path"] / f"chunk_{chunk_index}"
    with open(chunk_path, "wb") as f:
        shutil.copyfileobj(chunk.file, f)
    
    session["uploaded_chunks"].add(chunk_index)
    
    return {
        "chunk_index": chunk_index,
        "uploaded": len(session["uploaded_chunks"]),
        "total": session["total_chunks"]
    }

@router.post("/complete")
async def complete_upload(
    upload_id: str = Form(...),
    bucket: str = Form(...),
    title: str = Form(...),
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    """Complete resumable upload and assemble file"""
    if upload_id not in upload_sessions:
        raise HTTPException(status_code=404, detail="Upload session not found")
    
    session = upload_sessions[upload_id]
    
    # Check if all chunks uploaded
    if len(session["uploaded_chunks"]) != session["total_chunks"]:
        raise HTTPException(
            status_code=400,
            detail=f"Missing chunks: {session['total_chunks'] - len(session['uploaded_chunks'])}"
        )
    
    # Assemble file
    assembled_path = session["temp_path"] / session["filename"]
    with open(assembled_path, "wb") as outfile:
        for i in range(session["total_chunks"]):
            chunk_path = session["temp_path"] / f"chunk_{i}"
            with open(chunk_path, "rb") as infile:
                shutil.copyfileobj(infile, outfile)
    
    # Upload to storage
    with open(assembled_path, "rb") as f:
        file_data = f.read()
    
    storage_service = StorageService()
    result = await storage_service.upload_file(
        bucket=bucket,
        path=f"{user_id}/{session['filename']}",
        file_data=file_data,
        content_type="image/jpeg"
    )
    
    # Cleanup
    shutil.rmtree(session["temp_path"])
    del upload_sessions[upload_id]
    
    return {"success": True, "path": result["path"]}
```

---

## AI/ML Integration

### Current: LangChain in TypeScript

```typescript
import searchAgent, { createPromptFromTemplate } from "@/libs/agents/webSearchAgent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { 
    query, 
    word_limit,
    custom_system_prompt,
    topic,
  } = req.body;

  const messages = createPromptFromTemplate({
      userInputs: query,
      numerOfWords: word_limit,
      customSystemPrompt: custom_system_prompt,
      searchTopic: topic
  });

  try {
      const agent = searchAgent({});
      const response = await agent.invoke(await messages.invoke({}))

    return res.status(201).json({ 
        answer: response.messages[response.messages.length - 1].content
    });
  } catch (catchError) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

### Target: LangChain in Python

```python
# app/services/agents/search.py
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain import hub
from langchain.prompts import ChatPromptTemplate
from typing import Dict, Any
import os

class SearchAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.prompt = hub.pull("hwchase17/openai-tools-agent")
    
    def create_search_tool(self) -> Tool:
        """Create search tool"""
        from langchain.utilities import SerpAPIWrapper
        
        search = SerpAPIWrapper()
        return Tool(
            name="Search",
            func=search.run,
            description="Useful for searching the internet for current information"
        )
    
    def create_agent(self, tools: list) -> AgentExecutor:
        """Create agent executor"""
        agent = create_openai_tools_agent(self.llm, tools, self.prompt)
        return AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=True,
            handle_parsing_errors=True
        )
    
    async def invoke(self, query: str, word_limit: int = None) -> str:
        """Invoke agent with query"""
        tools = [self.create_search_tool()]
        agent_executor = self.create_agent(tools)
        
        system_prompt = f"Provide a concise answer within {word_limit} words." if word_limit else ""
        
        result = await agent_executor.ainvoke({
            "input": query,
            "system_message": system_prompt
        })
        
        return result["output"]

# Singleton instance
search_agent = SearchAgent()
```

### FastAPI Endpoint

```python
# app/api/v1/agents/router.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.agents.search import search_agent
from app.core.security import verify_token

router = APIRouter(prefix="/agents", tags=["agents"])

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")
    word_limit: Optional[int] = Field(None, gt=0, description="Word limit for response")
    custom_system_prompt: Optional[str] = Field(None, description="Custom system prompt")
    topic: Optional[str] = Field(None, description="Search topic")

class SearchResponse(BaseModel):
    answer: str

@router.post("/search/create", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    user_id: str = Depends(verify_token)
):
    """Invoke search agent"""
    try:
        answer = await search_agent.invoke(
            query=request.query,
            word_limit=request.word_limit
        )
        return SearchResponse(answer=answer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {str(e)}"
        )
```

### Intent Classifier

```python
# app/services/agents/intent.py
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import Literal
import os

class Intent(BaseModel):
    """Intent classification model"""
    intent: Literal["search", "booking", "information", "support", "other"] = Field(
        description="The classified intent"
    )
    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence score"
    )
    reasoning: str = Field(description="Reasoning for classification")

class IntentClassifier:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.parser = PydanticOutputParser(pydantic_object=Intent)
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an intent classifier. Classify the user's query into one of: search, booking, information, support, other.\n{format_instructions}"),
            ("human", "{query}")
        ])
    
    async def classify(self, query: str) -> Intent:
        """Classify intent of user query"""
        chain = self.prompt | self.llm | self.parser
        result = await chain.ainvoke({
            "query": query,
            "format_instructions": self.parser.get_format_instructions()
        })
        return result

# Singleton
intent_classifier = IntentClassifier()
```

---

## Email Integration

### Current: MailerSend in TypeScript

```typescript
import mailSendHandler from "./send-email";
import { memberCreationEmailTemplate } from "./email-template";

const mailSendResp = await mailSendHandler({
    sender: 'hello@travelbuddy8.com',
    senderName: 'Travel Buddy 8',
    to: [email],
    bcc: ["trac.nguyen@edge8.ai"],
    subject: 'Welcome to Travel Buddy 8 Business Management Platform',
    html: emailBodyNewMember,
});

if (mailSendResp.error) {
    return res.status(500).json({ error: mailSendResp.error });
}
```

### Target: MailerSend in Python

```python
# app/services/email.py
import httpx
from typing import List, Optional
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.api_key = settings.MAILERSEND_API_KEY
        self.base_url = "https://api.mailersend.com/v1"
    
    async def send_email(
        self,
        to: List[str],
        subject: str,
        html: str,
        sender: str = "hello@travelbuddy8.com",
        sender_name: str = "Travel Buddy 8",
        bcc: Optional[List[str]] = None,
        reply_to: Optional[str] = None
    ) -> dict:
        """Send email via MailerSend API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": {
                "email": sender,
                "name": sender_name
            },
            "to": [{"email": email} for email in to],
            "subject": subject,
            "html": html
        }
        
        if bcc:
            payload["bcc"] = [{"email": email} for email in bcc]
        
        if reply_to:
            payload["reply_to"] = {"email": reply_to}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/email",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 202:
                return {
                    "error": f"Email send failed: {response.text}",
                    "status_code": response.status_code
                }
            
            return {
                "success": True,
                "message_id": response.json().get("message_id")
            }

# Singleton
email_service = EmailService()
```

### Email Templates

```python
# app/services/email_templates.py
from jinja2 import Template

MEMBER_CREATION_TEMPLATE = Template("""
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Travel Buddy 8</title>
</head>
<body>
    <h1>Welcome to Travel Buddy 8 Business Management Platform</h1>
    <p>Hi {{ name }},</p>
    <p>You have been invited to join <strong>{{ company_name }}</strong> as a <strong>{{ role }}</strong>.</p>
    
    {% if password %}
    <p>Your temporary password is: <strong>{{ password }}</strong></p>
    <p>Please change your password after logging in.</p>
    {% endif %}
    
    <p>To get started, click the link below:</p>
    <p><a href="{{ redirect_link }}">Login to Travel Buddy 8</a></p>
    
    <p>If you forgot your password, you can reset it here:</p>
    <p><a href="{{ recovery_link }}">Reset Password</a></p>
    
    <p>Best regards,<br>Travel Buddy 8 Team</p>
</body>
</html>
""")

def render_member_creation_email(
    name: str,
    company_name: str,
    role: str,
    redirect_link: str,
    recovery_link: str,
    password: Optional[str] = None
) -> str:
    """Render member creation email template"""
    return MEMBER_CREATION_TEMPLATE.render(
        name=name,
        company_name=company_name,
        role=role,
        redirect_link=redirect_link,
        recovery_link=recovery_link,
        password=password
    )
```

### Usage in Endpoint

```python
@router.post("/members/create")
async def create_member(
    request: MemberCreateRequest,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    """Create company member and send invitation email"""
    # ... create member logic ...
    
    # Send email
    email_html = render_member_creation_email(
        name=member_name,
        company_name=company.name,
        role=request.role,
        redirect_link=request.redirect_link,
        recovery_link=f"https://{redirect_host}/auth/forgot-password",
        password=password
    )
    
    email_result = await email_service.send_email(
        to=[email],
        subject="Welcome to Travel Buddy 8 Business Management Platform",
        html=email_html,
        bcc=["trac.nguyen@edge8.ai"]
    )
    
    if email_result.get("error"):
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {email_result['error']}"
        )
    
    return {"data": {"message": "Member created successfully"}}
```

---

## Performance Considerations

### Database Connection Pooling

```python
# app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from app.core.config import settings

# Create engine with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=10,              # Number of connections to maintain
    max_overflow=20,           # Additional connections when pool is full
    pool_timeout=30,           # Timeout for getting connection from pool
    pool_recycle=3600,         # Recycle connections after 1 hour
    pool_pre_ping=True,        # Test connections before using
    poolclass=QueuePool        # Use QueuePool for production
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncSession:
    """Dependency for database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### Query Optimization

```python
# Use selectinload for relationships
from sqlalchemy.orm import selectinload, joinedload

# Good: Eager load relationships
query = (
    select(Story)
    .options(
        selectinload(Story.media_assets),
        selectinload(Story.user_profile),
        selectinload(Story.channel)
    )
    .where(Story.status == 'PUBLISHED')
)

# Bad: N+1 queries
stories = (await db.execute(select(Story))).scalars().all()
for story in stories:
    # This causes N+1 queries!
    media = await db.execute(
        select(MediaAsset).where(MediaAsset.story_id == story.id)
    )
```

### Caching Strategy

```python
# app/core/cache.py
from functools import wraps
from typing import Callable, Any
import json
import hashlib
import redis.asyncio as redis
from app.core.config import settings

class CacheService:
    def __init__(self):
        self.redis = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        """Set value in cache"""
        await self.redis.setex(
            key,
            ttl,
            json.dumps(value)
        )
    
    async def delete(self, key: str):
        """Delete value from cache"""
        await self.redis.delete(key)
    
    async def clear_pattern(self, pattern: str):
        """Clear all keys matching pattern"""
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)

# Singleton
cache_service = CacheService()

# Cache decorator
def cache_key_builder(*args, **kwargs):
    """Build cache key from function arguments"""
    key_data = f"{args[0].__name__}_{str(args[1:])}_{str(sorted(kwargs.items()))}"
    return hashlib.md5(key_data.encode()).hexdigest()

def cached(ttl: int = 3600):
    """Decorator for caching function results"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key = cache_key_builder(func, *args, **kwargs)
            
            # Try to get from cache
            cached_value = await cache_service.get(key)
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            await cache_service.set(key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Usage
@cached(ttl=300)  # Cache for 5 minutes
async def get_company(company_id: str, db: AsyncSession):
    query = select(CompanyAccount).where(CompanyAccount.id == company_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()
```

### Async Operations

```python
# Use asyncio for concurrent operations
import asyncio

async def get_stories_with_details(story_ids: List[str], db: AsyncSession):
    """Fetch multiple stories concurrently"""
    async def fetch_story(story_id: str):
        query = select(Story).where(Story.id == story_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    # Fetch all stories concurrently
    stories = await asyncio.gather(
        *[fetch_story(sid) for sid in story_ids]
    )
    
    return [s for s in stories if s is not None]
```

---

## Security Considerations

### Input Validation

```python
from pydantic import BaseModel, Field, field_validator
import re

class SecureInput(BaseModel):
    email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    username: str = Field(..., min_length=3, max_length=50, pattern=r'^[a-zA-Z0-9_]+$')
    
    @field_validator('username')
    @classmethod
    def sanitize_username(cls, v: str) -> str:
        # Prevent SQL injection
        if any(char in v for char in [';', '--', '/*', '*/']):
            raise ValueError('Invalid characters in username')
        return v
```

### SQL Injection Prevention

```python
# SQLAlchemy automatically parameterizes queries
# This prevents SQL injection

# GOOD - Parameterized
query = select(CompanyAccount).where(
    CompanyAccount.name == company_name  # Safe
)

# BAD - String interpolation (NEVER DO THIS)
query = text(f"SELECT * FROM company_accounts WHERE name = '{company_name}'")  # Unsafe!
```

### XSS Prevention

```python
from fastapi import Response
import html

def sanitize_html(content: str) -> str:
    """Sanitize HTML to prevent XSS"""
    return html.escape(content)

# In endpoint
@router.post("/story/create")
async def create_story(
    story_content: str,
    user_id: str = Depends(verify_token)
):
    sanitized_content = sanitize_html(story_content)
    # ... save to database ...
```

### Rate Limiting

```python
# app/core/rate_limit.py
from fastapi import Request, HTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# In main.py
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Usage in endpoints
@router.post("/create")
@limiter.limit("10/minute")  # 10 requests per minute
async def create_company(
    request: Request,
    company: CompanyCreate
):
    pass
```

### CORS Configuration

```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://travelbuddy8.com",
        "https://www.travelbuddy8.com",
        "http://localhost:3000"  # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Testing Strategy

### Unit Tests

```python
# tests/api/v1/test_companies.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.models import CompanyAccount

@pytest.mark.asyncio
async def test_create_company(client: AsyncClient, db: AsyncSession, auth_token: str):
    """Test company creation"""
    response = await client.post(
        "/api/v1/companies/create",
        json={
            "name": "Test Company",
            "description": "Test description"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["name"] == "Test Company"
    assert "id" in data["data"]

@pytest.mark.asyncio
async def test_get_all_companies(client: AsyncClient, auth_token: str):
    """Test getting all companies"""
    response = await client.get(
        "/api/v1/companies/get-all",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["data"], list)

@pytest.mark.asyncio
async def test_create_duplicate_company(client: AsyncClient, db: AsyncSession, auth_token: str):
    """Test duplicate company creation"""
    company_data = {"name": "Duplicate Test", "description": "Test"}
    
    # Create first company
    await client.post(
        "/api/v1/companies/create",
        json=company_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Try to create duplicate
    response = await client.post(
        "/api/v1/companies/create",
        json=company_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 409
    assert "already exists" in response.json()["error"].lower()
```

### Integration Tests

```python
# tests/integration/test_auth_flow.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_complete_auth_flow(client: AsyncClient):
    """Test complete authentication flow"""
    
    # 1. Sign up
    signup_data = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "password": "SecurePass123!",
        "phone": "+1234567890"
    }
    
    signup_response = await client.post(
        "/api/v1/auth/sign-up",
        json=signup_data
    )
    assert signup_response.status_code == 200
    access_token = signup_response.json()["access_token"]
    
    # 2. Login
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
    )
    assert login_response.status_code == 200
    
    # 3. Access protected endpoint
    protected_response = await client.get(
        "/api/v1/profile/business",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert protected_response.status_code == 200
```

### Test Fixtures

```python
# tests/conftest.py
import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.db.base import Base
from app.db.models import *
from app.core.config import settings

# Test database
TEST_DATABASE_URL = settings.DATABASE_URL.replace("/travel_buddy", "/travel_buddy_test")

test_engine = create_async_engine(TEST_DATABASE_URL)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession)

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def setup_database():
    """Create test database tables"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db(setup_database):
    """Get database session"""
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def client(db: AsyncSession):
    """Get test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_token(client: AsyncClient):
    """Get authentication token"""
    # Create test user
    signup_response = await client.post(
        "/api/v1/auth/sign-up",
        json={
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    return signup_response.json()["access_token"]
```

---

## Deployment Architecture

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:password@postgres:5432/travel_buddy
      - REDIS_URL=redis://redis:6379/0
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
      - MAILERSEND_API_KEY=${MAILERSEND_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - travel-buddy-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=travel_buddy
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - travel-buddy-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - travel-buddy-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - travel-buddy-network

volumes:
  postgres_data:
  redis_data:

networks:
  travel-buddy-network:
    driver: bridge
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        least_conn;
        server api:8000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name travelbuddy8.com www.travelbuddy8.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name travelbuddy8.com www.travelbuddy8.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API proxy
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check
        location /health {
            proxy_pass http://api/health;
            access_log off;
        }
    }
}
```

---

## Monitoring & Observability

### Structured Logging

```python
# app/core/logging.py
import logging
import sys
from pythonjsonlogger import jsonlogger
from app.core.config import settings

def setup_logging():
    """Configure structured logging"""
    logger = logging.getLogger()
    
    # Remove default handlers
    logger.handlers.clear()
    
    # Create JSON formatter
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Set log level
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    return logger

# Usage
logger = setup_logging()

logger.info("Request received", extra={
    "endpoint": "/companies/create",
    "method": "POST",
    "user_id": user_id
})
```

### Metrics

```python
# app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge
from fastapi import Request
import time

# Define metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

active_connections = Gauge(
    'active_connections',
    'Active database connections'
)

async def metrics_middleware(request: Request, call_next):
    """Middleware to collect metrics"""
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response
```

### Error Tracking (Sentry)

```python
# app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[
        FastApiIntegration(),
        SqlalchemyIntegration()
    ],
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
    environment=settings.ENVIRONMENT
)
```

---

## Summary

This technical analysis provides comprehensive guidance for migrating the Travel Buddy API from TypeScript Next.js to Python FastAPI. Key takeaways:

1. **Architecture**: Move from file-based routing to router-based organization
2. **Database**: Transition from Supabase SDK to SQLAlchemy ORM
3. **Authentication**: Implement JWT validation with FastAPI dependencies
4. **Validation**: Use Pydantic for request/response validation
5. **Error Handling**: Implement custom exception handlers
6. **Performance**: Use connection pooling, caching, and async operations
7. **Security**: Implement input validation, rate limiting, and CORS
8. **Testing**: Comprehensive unit and integration tests
9. **Deployment**: Docker containerization with Nginx reverse proxy
10. **Monitoring**: Structured logging, metrics, and error tracking

The migration maintains 100% API compatibility while improving performance, maintainability, and leveraging Python's rich ecosystem for AI/ML operations.
