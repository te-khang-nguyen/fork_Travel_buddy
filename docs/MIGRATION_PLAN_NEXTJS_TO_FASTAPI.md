# Migration Plan: TypeScript Next.js API to Python FastAPI

## Executive Summary

This document outlines the comprehensive migration strategy for transitioning the Travel Buddy API from TypeScript Next.js API routes to Python FastAPI. The migration aims to improve performance, maintainability, and leverage Python's rich ecosystem for AI/ML operations.

## Current Architecture

### Technology Stack
- **Framework**: Next.js 15 (API Routes)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI/ML**: LangChain, OpenAI, Google GenAI, Anthropic
- **Email**: MailerSend
- **Documentation**: Swagger/OpenAPI

### Current API Structure
- 50+ API endpoints organized in 14 modules
- File-based routing: `/pages/api/{module}/{action}.ts`
- Middleware for authentication
- Supabase client for database operations
- Swagger exports for API documentation

---

## Target Architecture

### Technology Stack
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Database**: Supabase (PostgreSQL) - **No Change**
- **ORM**: SQLAlchemy 2.0+ with async support
- **Authentication**: Supabase Auth - **No Change**
- **Storage**: Supabase Storage - **No Change**
- **AI/ML**: LangChain, OpenAI, Google GenAI, Anthropic - **No Change**
- **Email**: MailerSend - **No Change**
- **Documentation**: FastAPI auto-generated OpenAPI + Swagger UI
- **Validation**: Pydantic v2
- **Async Runtime**: Uvicorn + Gunicorn
- **Testing**: Pytest + httpx

### Project Structure
```
travel-buddy-api/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Dependency injection
│   ├── middleware.py           # Custom middleware
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # API dependencies
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py       # API router aggregation
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   └── services.py
│   │   │   │
│   │   │   ├── companies/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── models.py
│   │   │   │   └── services.py
│   │   │   │
│   │   │   ├── experiences/
│   │   │   ├── stories/
│   │   │   ├── profile/
│   │   │   ├── storage/
│   │   │   ├── agents/
│   │   │   ├── analytics/
│   │   │   ├── activities/
│   │   │   ├── attraction/
│   │   │   ├── channel/
│   │   │   ├── destination/
│   │   │   ├── locations/
│   │   │   └── email/
│   │   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py         # JWT validation
│   │   ├── config.py           # Settings
│   │   └── exceptions.py       # Custom exceptions
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py             # SQLAlchemy base
│   │   ├── session.py          # Database session management
│   │   └── models/             # SQLAlchemy models
│   │       ├── __init__.py
│   │       ├── company.py
│   │       ├── experience.py
│   │       ├── story.py
│   │       ├── user.py
│   │       └── ...
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── supabase.py         # Supabase client wrapper
│   │   ├── storage.py          # Storage service
│   │   ├── email.py            # Email service
│   │   └── agents/             # AI agent services
│   │       ├── __init__.py
│   │       ├── search.py
│   │       ├── intent.py
│   │       └── chat.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── validators.py
│       └── helpers.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── test_auth.py
│   │   │   ├── test_companies.py
│   │   │   └── ...
│   ├── services/
│   └── db/
│
├── scripts/
│   ├── migrate_db.py           # Database migration helper
│   └── seed_data.py
│
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
│
├── .env.example
├── .gitignore
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Migration Strategy

### Phase 1: Foundation (Week 1-2)

#### 1.1 Project Setup
- [ ] Initialize FastAPI project structure
- [ ] Set up Python virtual environment
- [ ] Configure pyproject.toml with dependencies
- [ ] Set up development environment (VS Code, linting, formatting)
- [ ] Configure pre-commit hooks (black, ruff, mypy)
- [ ] Set up Docker for local development

**Dependencies**:
```toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
sqlalchemy = "^2.0.23"
asyncpg = "^0.29.0"
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
supabase = "^2.3.0"
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
python-multipart = "^0.0.6"
httpx = "^0.25.0"
python-dotenv = "^1.0.0"
langchain = "^0.1.0"
openai = "^1.3.0"
anthropic = "^0.7.0"
google-generativeai = "^0.3.0"
aiofiles = "^23.2.1"
python-magic = "^0.4.27"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-asyncio = "^0.21.1"
pytest-cov = "^4.1.0"
black = "^23.12.0"
ruff = "^0.1.8"
mypy = "^1.7.1"
httpx = "^0.25.0"
```

#### 1.2 Core Infrastructure
- [ ] Implement configuration management (Pydantic Settings)
- [ ] Set up database connection pooling (SQLAlchemy async)
- [ ] Create Supabase client wrapper service
- [ ] Implement JWT authentication middleware
- [ ] Create custom exception handlers
- [ ] Set up request/response logging
- [ ] Configure CORS middleware

**Key Files**:
- `app/core/config.py`
- `app/db/session.py`
- `app/services/supabase.py`
- `app/middleware.py`
- `app/core/exceptions.py`

#### 1.3 Database Models
- [ ] Create SQLAlchemy base models
- [ ] Map existing Supabase tables to SQLAlchemy models
- [ ] Define relationships between models
- [ ] Create model validators and helpers

**Models to Create**:
- `CompanyAccount`
- `CompanyMember`
- `Experience`
- `Story`
- `Like`
- `Comment`
- `MediaAsset`
- `BusinessProfile`
- `UserProfile`
- `Channel`
- `Activity`
- `Attraction`

---

### Phase 2: Authentication Module (Week 3)

#### 2.1 Authentication Endpoints
- [ ] `POST /api/v1/auth/login`
- [ ] `POST /api/v1/auth/sign-up`
- [ ] `POST /api/v1/auth/forgot-password`
- [ ] `POST /api/v1/auth/reset-password`
- [ ] `POST /api/v1/auth/logout`
- [ ] `POST /api/v1/auth/new-session`
- [ ] `POST /api/v1/auth/oauth`
- [ ] `POST /api/v1/auth/otp-verification`
- [ ] `POST /api/v1/auth/update-email`
- [ ] `GET /api/v1/auth/callback`
- [ ] `POST /api/v1/auth/business/login`
- [ ] `POST /api/v1/auth/business/sign-up`
- [ ] `GET /api/v1/auth/business/callback`

**Implementation Notes**:
- Use Supabase Auth SDK for Python
- Implement JWT token validation
- Create Pydantic schemas for request/response validation
- Write unit tests for each endpoint

**Example Implementation**:
```python
# app/api/v1/auth/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.auth.schemas import LoginRequest, LoginResponse
from app.services.supabase import get_supabase_client
from app.core.security import verify_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    supabase = Depends(get_supabase_client)
):
    """Authenticate user with email and password"""
    result = supabase.auth.sign_in_with_password(
        email=request.email,
        password=request.password
    )
    
    if result.error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error.message
        )
    
    return LoginResponse(
        access_token=result.session.access_token,
        expires_at=result.session.expires_at,
        refresh_token=result.session.refresh_token,
        user_id=result.session.user.id
    )
```

---

### Phase 3: Companies Module (Week 4)

#### 3.1 Company Endpoints
- [ ] `POST /api/v1/companies/create`
- [ ] `GET /api/v1/companies/get-all`
- [ ] `GET /api/v1/companies/get`
- [ ] `PUT /api/v1/companies/update`
- [ ] `DELETE /api/v1/companies/delete`
- [ ] `POST /api/v1/companies/members/create`
- [ ] `GET /api/v1/companies/members/get`
- [ ] `DELETE /api/v1/companies/members/delete`
- [ ] `POST /api/v1/companies/members/send-email`
- [ ] `GET /api/v1/companies/admins/get-all`
- [ ] `PUT /api/v1/companies/admins/update`
- [ ] `POST /api/v1/companies/editors/create`
- [ ] `GET /api/v1/companies/editors/get`

**Implementation Notes**:
- Implement company CRUD operations
- Handle member management with role-based access
- Implement email notifications for member invitations
- Use SQLAlchemy for database operations
- Implement soft delete pattern

---

### Phase 4: Experiences Module (Week 5)

#### 4.1 Experience Endpoints
- [ ] `POST /api/v1/experiences/create`
- [ ] `GET /api/v1/experiences/get-all`
- [ ] `GET /api/v1/experiences/public/get-all`
- [ ] `GET /api/v1/experiences/get`
- [ ] `PUT /api/v1/experiences/update`
- [ ] `DELETE /api/v1/experiences/delete`

**Implementation Notes**:
- Implement experience CRUD with media handling
- Support public and authenticated views
- Filter by status and ownership
- Implement complex queries with joins

---

### Phase 5: Stories Module (Week 6)

#### 5.1 Story Endpoints
- [ ] `POST /api/v1/story/create`
- [ ] `GET /api/v1/story/get-all`
- [ ] `GET /api/v1/story/public/get-all`
- [ ] `GET /api/v1/story/get`
- [ ] `PUT /api/v1/story/update`
- [ ] `DELETE /api/v1/story/delete`
- [ ] `POST /api/v1/story/likes/create`
- [ ] `DELETE /api/v1/story/likes/delete`
- [ ] `POST /api/v1/story/comments/create`
- [ ] `GET /api/v1/story/comments/get`
- [ ] `DELETE /api/v1/story/comments/delete`

**Implementation Notes**:
- Implement story CRUD with media attachments
- Handle likes/comments with transactional operations
- Support draft and published states
- Implement SEO fields

---

### Phase 6: Profile Module (Week 7)

#### 6.1 Profile Endpoints
- [ ] `GET /api/v1/profile/business`
- [ ] `PUT /api/v1/profile/business/update`
- [ ] `GET /api/v1/profile/user`
- [ ] `PUT /api/v1/profile/user/update`

**Implementation Notes**:
- Implement profile retrieval with company associations
- Handle first-time user detection
- Support profile updates with validation

---

### Phase 7: Storage Module (Week 8)

#### 7.1 Storage Endpoints
- [ ] `POST /api/v1/storage/upload_image`
- [ ] `POST /api/v1/storage/upload_video`
- [ ] `POST /api/v1/storage/upload-images/create`
- [ ] `POST /api/v1/storage/upload-image/resumable/create`
- [ ] `POST /api/v1/storage/upload-image/initialize/create`

**Implementation Notes**:
- Implement file upload with validation
- Support resumable uploads for large files
- Generate signed URLs
- Handle base64 to binary conversion
- Implement file type validation

---

### Phase 8: Agents Module (Week 9)

#### 8.1 Agent Endpoints
- [ ] `POST /api/v1/agents/search/create`
- [ ] `POST /api/v1/agents/intent-classifier/create`
- [ ] `POST /api/v1/agents/foreignServer`
- [ ] `GET /api/v1/agents/chat/history/get-all`

**Implementation Notes**:
- Migrate LangChain agents to Python
- Implement async agent execution
- Handle streaming responses
- Implement chat history management

---

### Phase 9: Analytics Module (Week 10)

#### 9.1 Analytics Endpoints
- [ ] `GET /api/v1/analytics/business/overview/experiences/get`
- [ ] `GET /api/v1/analytics/business/overview/explorers/get`
- [ ] `GET /api/v1/analytics/business/overview/stories/get`
- [ ] `GET /api/v1/analytics/business/daily/stories-photos/get`
- [ ] `GET /api/v1/analytics/business/daily/unique-users/get`
- [ ] `GET /api/v1/analytics/business/all/experiences/get`
- [ ] `GET /api/v1/analytics/business/top/stories/get`
- [ ] `GET /api/v1/analytics/business/top/visitors/get`

**Implementation Notes**:
- Implement aggregation queries
- Use PostgreSQL window functions
- Cache frequently accessed analytics
- Implement time-based filtering

---

### Phase 10: Remaining Modules (Week 11)

#### 10.1 Activities Module
- [ ] `POST /api/v1/activities/create`
- [ ] `GET /api/v1/activities/get`
- [ ] `GET /api/v1/activities/experience/get`
- [ ] `PUT /api/v1/activities/update`
- [ ] `DELETE /api/v1/activities/delete`

#### 10.2 Attraction Module
- [ ] `POST /api/v1/attraction/create`
- [ ] `GET /api/v1/attraction/get`
- [ ] `PUT /api/v1/attraction/update`
- [ ] `DELETE /api/v1/attraction/delete`

#### 10.3 Channel Module
- [ ] `POST /api/v1/channel/create`
- [ ] `GET /api/v1/channel/get-all`
- [ ] `PUT /api/v1/channel/update`

#### 10.4 Destination Module (23 endpoints)
- [ ] Implement all destination CRUD operations
- [ ] Implement nested resource endpoints

#### 10.5 Locations Module
- [ ] `GET /api/v1/locations/get`
- [ ] `GET /api/v1/locations/get-all`
- [ ] `POST /api/v1/locations/create`
- [ ] `PUT /api/v1/locations/update`

#### 10.6 Email Module
- [ ] `POST /api/v1/email/send`

---

### Phase 11: Testing & Quality Assurance (Week 12)

#### 11.1 Unit Testing
- [ ] Write unit tests for all services
- [ ] Write unit tests for all endpoints
- [ ] Achieve 80%+ code coverage

#### 11.2 Integration Testing
- [ ] Test database operations
- [ ] Test authentication flow
- [ ] Test external service integrations

#### 11.3 Performance Testing
- [ ] Load test critical endpoints
- [ ] Optimize database queries
- [ ] Implement caching where needed

#### 11.4 Security Testing
- [ ] Test authentication/authorization
- [ ] Test input validation
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention

---

### Phase 12: Deployment & Monitoring (Week 13-14)

#### 12.1 Deployment Setup
- [ ] Configure Docker containers
- [ ] Set up CI/CD pipeline
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure load balancing

#### 12.2 Monitoring & Logging
- [ ] Implement structured logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring
- [ ] Set up uptime monitoring

#### 12.3 Documentation
- [ ] Update API documentation
- [ ] Create deployment guide
- [ ] Create troubleshooting guide
- [ ] Create developer onboarding guide

---

## Key Implementation Details

### Authentication Flow

```python
# app/core/security.py
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

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
            algorithms=["HS256"]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

### Database Operations

```python
# app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db() -> AsyncSession:
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

### Supabase Client Wrapper

```python
# app/services/supabase.py
from supabase import create_client, Client
from app.core.config import settings

class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        self.admin_client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
    
    async def get_user(self, token: str):
        """Get user from token"""
        return self.client.auth.get_user(token)
    
    async def sign_in(self, email: str, password: str):
        """Sign in user"""
        return self.client.auth.sign_in_with_password(
            email=email,
            password=password
        )

# Singleton instance
supabase_service = SupabaseService()
```

### Pydantic Schemas

```python
# app/api/v1/companies/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: str
    created_by: str
    owned_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    
    class Config:
        from_attributes = True
```

### FastAPI Router

```python
# app/api/v1/companies/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.api.v1.companies.schemas import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse
)
from app.api.v1.companies.services import CompanyService

router = APIRouter(prefix="/companies", tags=["companies"])

@router.post("/create", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    """Create a new company"""
    service = CompanyService(db)
    return await service.create_company(company, user_id)

@router.get("/get-all", response_model=List[CompanyResponse])
async def get_all_companies(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token)
):
    """Get all companies"""
    service = CompanyService(db)
    return await service.get_all_companies()
```

---

## Database Migration Strategy

### Option 1: Keep Supabase Direct Access
- Use Supabase Python SDK for all database operations
- No SQLAlchemy ORM needed
- Simpler migration, less code
- Pros: Faster migration, less refactoring
- Cons: Less type safety, no query optimization

### Option 2: Use SQLAlchemy ORM (Recommended)
- Map Supabase tables to SQLAlchemy models
- Use SQLAlchemy for all database operations
- Better type safety and query optimization
- Pros: Better maintainability, type safety
- Cons: More initial work

**Recommendation**: Use Option 2 (SQLAlchemy ORM) for long-term maintainability.

---

## API Compatibility

### Endpoint Mapping

| Next.js Endpoint | FastAPI Endpoint | Status |
|------------------|------------------|---------|
| `/api/auth/login` | `/api/v1/auth/login` | ✓ |
| `/api/companies/create` | `/api/v1/companies/create` | ✓ |
| `/api/companies/get-all` | `/api/v1/companies/get-all` | ✓ |
| `/api/companies/get` | `/api/v1/companies/get` | ✓ |
| `/api/companies/update` | `/api/v1/companies/update` | ✓ |
| `/api/companies/delete` | `/api/v1/companies/delete` | ✓ |
| `/api/experiences/create` | `/api/v1/experiences/create` | ✓ |
| `/api/story/create` | `/api/v1/story/create` | ✓ |
| ... | ... | ... |

### Response Format Compatibility

All responses will maintain the same structure:
```json
{
  "data": {},
  "success": true
}
```

or

```json
{
  "error": "Error message"
}
```

---

## Testing Strategy

### Unit Tests
```python
# tests/api/v1/test_companies.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_company():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/companies/create",
            json={"name": "Test Company", "description": "Test"},
            headers={"Authorization": "Bearer test_token"}
        )
        assert response.status_code == 201
        assert response.json()["data"]["name"] == "Test Company"
```

### Integration Tests
```python
# tests/integration/test_auth_flow.py
@pytest.mark.asyncio
async def test_complete_auth_flow():
    # Sign up
    # Login
    # Access protected endpoint
    # Logout
    pass
```

---

## Deployment Strategy

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
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
      - DATABASE_URL=postgresql+asyncpg://...
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - redis
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
    restart: always
```

---

## Rollback Plan

### Rollback Triggers
- Critical bugs discovered in production
- Performance degradation > 50%
- Security vulnerabilities
- Data corruption issues

### Rollback Procedure
1. Stop FastAPI deployment
2. Switch DNS to Next.js API
3. Monitor system health
4. Investigate and fix issues
5. Re-deploy FastAPI after fixes

---

## Risk Assessment

### High Risk
- **Authentication compatibility**: Supabase Auth SDK differences
  - Mitigation: Thorough testing of auth flows
- **Database query performance**: SQLAlchemy vs Supabase SDK
  - Mitigation: Performance testing and query optimization

### Medium Risk
- **LangChain compatibility**: Python vs TypeScript versions
  - Mitigation: Test all agent endpoints
- **File upload handling**: Different multipart handling
  - Mitigation: Test all storage endpoints

### Low Risk
- **API response format**: Maintain exact compatibility
- **CORS configuration**: Standard FastAPI setup

---

## Success Criteria

- [ ] All 50+ endpoints migrated and functional
- [ ] 100% API compatibility with Next.js version
- [ ] 80%+ test coverage
- [ ] Response time < 200ms for 95th percentile
- [ ] Zero critical bugs in production
- [ ] Complete documentation
- [ ] Successful deployment to production

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Foundation | Week 1-2 | Project setup, core infrastructure |
| Authentication | Week 3 | All auth endpoints |
| Companies | Week 4 | All company endpoints |
| Experiences | Week 5 | All experience endpoints |
| Stories | Week 6 | All story endpoints |
| Profile | Week 7 | All profile endpoints |
| Storage | Week 8 | All storage endpoints |
| Agents | Week 9 | All agent endpoints |
| Analytics | Week 10 | All analytics endpoints |
| Remaining Modules | Week 11 | All remaining endpoints |
| Testing & QA | Week 12 | Complete test suite |
| Deployment | Week 13-14 | Production deployment |

**Total Duration**: 14 weeks

---

## Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Pydantic v2 Documentation](https://docs.pydantic.dev/latest/)
- [Supabase Python SDK](https://supabase.com/docs/reference/python)

### Tools
- Poetry for dependency management
- Black for code formatting
- Ruff for linting
- MyPy for type checking
- Pytest for testing
- Docker for containerization

---

## Next Steps

1. **Review and Approve**: Stakeholder review of migration plan
2. **Resource Allocation**: Assign developers to phases
3. **Environment Setup**: Set up development and staging environments
4. **Begin Phase 1**: Start foundation setup
5. **Weekly Progress Reviews**: Track progress and adjust timeline as needed

---

## Contact

For questions or concerns about this migration plan, contact the development team.
