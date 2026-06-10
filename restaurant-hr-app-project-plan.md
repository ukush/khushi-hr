# Restaurant HR App - Professional Development Plan

## Overview
This document outlines a production-grade approach to building your restaurant HR application, structured as a professional software engineering project suitable for portfolio demonstration.

---

## 1. Tech Stack Recommendation

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS (modern, maintainable, responsive)
- **State Management**: React Context + React Query (for server state)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod (validation)
- **Date/Time**: date-fns or Day.js

### Backend
- **Runtime**: Node.js with Express.js + TypeScript
- **Database**: PostgreSQL (production-grade, relational data fits your use case)
- **ORM**: Prisma (type-safe, great DX)
- **Authentication**: JWT + bcrypt
- **File Storage**: AWS S3 or Cloudflare R2 (for document uploads)

### Testing
- **Unit Tests**: Vitest (faster than Jest)
- **Integration Tests**: Supertest (API testing)
- **E2E Tests**: Playwright (modern, reliable)
- **Coverage**: NYC/Istanbul

### DevOps & Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + Docker Compose
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Documentation**: Swagger/OpenAPI for API docs

---

## 2. Project Structure

```
restaurant-hr-app/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   └── pr-checks.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── __tests__/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── models/
│   │   ├── utils/
│   │   └── __tests__/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 3. Development Phases & Epic Breakdown

### **Epic 1: Project Foundation & Setup**
*Goal: Establish development environment and infrastructure*

### **Epic 2: Authentication & User Management**
*Goal: Secure login system for employees and admins*

### **Epic 3: Employee Onboarding**
*Goal: Document upload and profile completion*

### **Epic 4: Shift Management (Employee View)**
*Goal: Clock in/out, breaks, shift history*

### **Epic 5: Admin Dashboard**
*Goal: Manager oversight and reporting*

### **Epic 6: Time-Off Requests**
*Goal: Employee requests + admin approval workflow*

### **Epic 7: Testing & Quality Assurance**
*Goal: Comprehensive test coverage*

### **Epic 8: Production Deployment**
*Goal: Live, production-ready application*

---

## 4. Detailed Ticket Breakdown

### Epic 1: Project Foundation (Week 1)

#### Ticket #1: Initialize Monorepo Structure
**Type**: Task  
**Story Points**: 3  
**Priority**: P0 (Blocker)

**Description**: Set up monorepo with frontend and backend directories, configure package managers, and establish base configurations.

**Acceptance Criteria**:
- [ ] Repository initialized with proper .gitignore
- [ ] Frontend directory with Vite + React + TypeScript
- [ ] Backend directory with Express + TypeScript
- [ ] ESLint + Prettier configured for both
- [ ] README with setup instructions

**Claude Code Prompt**:
```
Create a monorepo structure for a restaurant HR app with:
- Frontend: Vite + React 18 + TypeScript + Tailwind CSS
- Backend: Express + TypeScript + Prisma
- Shared ESLint/Prettier configs
- Docker Compose for local PostgreSQL
- README with setup instructions
```

---

#### Ticket #2: Setup CI/CD Pipeline
**Type**: Task  
**Story Points**: 5  
**Priority**: P0

**Description**: Configure GitHub Actions for automated testing, linting, and deployment.

**Acceptance Criteria**:
- [ ] CI workflow runs on every PR (lint + test)
- [ ] Branch protection rules enforced
- [ ] CD workflow deploys on merge to main
- [ ] Status badges in README

**Claude Code Prompt**:
```
Set up GitHub Actions workflows for:
1. CI: Run ESLint, Prettier check, and tests on PRs
2. CD: Deploy to staging on merge to main
3. Include caching for node_modules
4. Add status badges to README
```

---

#### Ticket #3: Database Schema Design
**Type**: Task  
**Story Points**: 5  
**Priority**: P0

**Description**: Design Prisma schema for users, shifts, documents, time-off requests.

**Acceptance Criteria**:
- [ ] Prisma schema with all required models
- [ ] Relationships properly defined
- [ ] Initial migration created
- [ ] Seed script for test data

**Schema Models**:
```prisma
// Users (employees + admins)
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  firstName     String
  lastName      String
  role          Role     @default(EMPLOYEE)
  phoneNumber   String?
  hourlyRate    Decimal  @db.Decimal(10, 2)
  position      String?  // e.g., "Server", "Cook", "Manager"
  onboardingComplete Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  documents     Document[]
  shifts        Shift[]
  timeOffRequests TimeOffRequest[]
}

enum Role {
  EMPLOYEE
  MANAGER
  ADMIN
}

// Document uploads (ID, right to work)
model Document {
  id          String   @id @default(uuid())
  userId      String
  type        DocumentType
  fileUrl     String
  fileName    String
  uploadedAt  DateTime @default(now())
  verified    Boolean  @default(false)
  
  user        User     @relation(fields: [userId], references: [id])
}

enum DocumentType {
  ID
  RIGHT_TO_WORK
  OTHER
}

// Shift records
model Shift {
  id          String   @id @default(uuid())
  userId      String
  clockIn     DateTime
  clockOut    DateTime?
  breakStart  DateTime?
  breakEnd    DateTime?
  totalHours  Decimal? @db.Decimal(5, 2)
  status      ShiftStatus @default(IN_PROGRESS)
  notes       String?
  
  user        User     @relation(fields: [userId], references: [id])
}

enum ShiftStatus {
  IN_PROGRESS
  COMPLETED
  APPROVED
}

// Time off requests
model TimeOffRequest {
  id          String   @id @default(uuid())
  userId      String
  startDate   DateTime
  endDate     DateTime
  reason      String?
  status      RequestStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  
  user        User     @relation(fields: [userId], references: [id])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**Claude Code Prompt**:
```
Create a Prisma schema for a restaurant HR app with models for:
- Users (employees & admins with roles, hourly rates, positions)
- Documents (ID, right to work uploads)
- Shifts (clock in/out, breaks, hours tracking)
- TimeOffRequests (employee requests with approval workflow)

Include proper relationships, indexes, and a seed script with sample data.
```

---

### Epic 2: Authentication (Week 1-2)

#### Ticket #4: Backend Auth API
**Type**: Feature  
**Story Points**: 8  
**Priority**: P0

**Description**: Implement JWT-based authentication with registration, login, and token refresh.

**Acceptance Criteria**:
- [ ] POST /api/auth/register endpoint
- [ ] POST /api/auth/login endpoint (returns JWT)
- [ ] POST /api/auth/refresh endpoint
- [ ] Password hashing with bcrypt
- [ ] JWT middleware for protected routes
- [ ] Unit tests with 80%+ coverage

**Claude Code Prompt**:
```
Build authentication endpoints for the backend:
1. POST /api/auth/register - create new user with hashed password
2. POST /api/auth/login - validate credentials, return JWT
3. POST /api/auth/refresh - refresh access token
4. JWT middleware to protect routes
5. Include validation with Zod
6. Write unit tests with Vitest
```

---

#### Ticket #5: Frontend Auth Flow
**Type**: Feature  
**Story Points**: 8  
**Priority**: P0

**Description**: Build login/register UI with protected routes and auth context.

**Acceptance Criteria**:
- [ ] Login page with form validation
- [ ] Register page for new employees
- [ ] Auth context for global state
- [ ] Protected route wrapper
- [ ] Token storage in httpOnly cookies
- [ ] Logout functionality

**Claude Code Prompt**:
```
Create frontend authentication flow:
1. Login page with React Hook Form + Zod validation
2. Auth context provider with JWT storage
3. Protected route wrapper component
4. Automatic token refresh logic
5. Modern UI with Tailwind CSS
6. Loading and error states
```

---

### Epic 3: Employee Onboarding (Week 2)

#### Ticket #6: Document Upload Backend
**Type**: Feature  
**Story Points**: 8  
**Priority**: P1

**Description**: API endpoints for document upload with S3/R2 integration.

**Acceptance Criteria**:
- [ ] POST /api/documents/upload endpoint
- [ ] File validation (type, size)
- [ ] S3/R2 upload integration
- [ ] Database record creation
- [ ] GET /api/documents/:userId endpoint
- [ ] Tests for upload flow

**Claude Code Prompt**:
```
Build document upload system:
1. POST /api/documents/upload - handle multipart/form-data
2. Integrate with AWS S3 or Cloudflare R2
3. Validate file types (PDF, JPG, PNG) and size limits
4. Store metadata in PostgreSQL via Prisma
5. GET /api/documents/:userId to retrieve user documents
6. Include error handling and tests
```

---

#### Ticket #7: Document Upload UI
**Type**: Feature  
**Story Points**: 5  
**Priority**: P1

**Description**: Onboarding page with drag-and-drop document upload.

**Acceptance Criteria**:
- [ ] Drag-and-drop file upload component
- [ ] Progress indicators
- [ ] Document type selection (ID vs Right to Work)
- [ ] Preview uploaded documents
- [ ] Mark onboarding as complete

**Claude Code Prompt**:
```
Create employee onboarding page with:
1. Drag-and-drop file upload (react-dropzone)
2. Upload progress indicators
3. Document type selection dropdown
4. List of uploaded documents with preview
5. "Complete Onboarding" button
6. Responsive mobile-friendly design
```

---

### Epic 4: Shift Management - Employee View (Week 3)

#### Ticket #8: Shift API Endpoints
**Type**: Feature  
**Story Points**: 8  
**Priority**: P1

**Description**: CRUD endpoints for shift management.

**Acceptance Criteria**:
- [ ] POST /api/shifts/clock-in
- [ ] PUT /api/shifts/:id/clock-out
- [ ] PUT /api/shifts/:id/break-start
- [ ] PUT /api/shifts/:id/break-end
- [ ] GET /api/shifts/my-shifts (filtered by user)
- [ ] Automatic hours calculation
- [ ] Tests for all endpoints

**Claude Code Prompt**:
```
Build shift management API:
1. POST /api/shifts/clock-in - create new shift record
2. PUT /api/shifts/:id/clock-out - end shift, calculate total hours
3. PUT /api/shifts/:id/break-start and break-end
4. GET /api/shifts/my-shifts - return shifts for authenticated user
5. Auto-calculate total hours (clock-out minus clock-in minus breaks)
6. Include validation and error handling
7. Write integration tests
```

---

#### Ticket #9: Clock In/Out UI
**Type**: Feature  
**Story Points**: 8  
**Priority**: P1

**Description**: Employee dashboard with clock in/out functionality.

**Acceptance Criteria**:
- [ ] Large clock in/out button
- [ ] Display current shift status
- [ ] Break start/end buttons (when clocked in)
- [ ] Real-time clock display
- [ ] Shift history list
- [ ] Mobile-optimized design

**Claude Code Prompt**:
```
Create employee shift management page:
1. Large "Clock In" / "Clock Out" button based on current status
2. Display live clock and current shift timer
3. Break start/end buttons (only visible when clocked in)
4. List of recent shifts with dates, hours, and earnings
5. Use React Query for server state management
6. Clean, mobile-first UI with Tailwind
```

---

### Epic 5: Admin Dashboard (Week 4)

#### Ticket #10: Admin Analytics API
**Type**: Feature  
**Story Points**: 8  
**Priority**: P2

**Description**: Endpoints for shift analytics and wage calculations.

**Acceptance Criteria**:
- [ ] GET /api/admin/shifts?startDate&endDate
- [ ] GET /api/admin/analytics/daily
- [ ] GET /api/admin/analytics/weekly
- [ ] GET /api/admin/analytics/monthly
- [ ] Wage calculation per employee
- [ ] Export to CSV endpoint

**Claude Code Prompt**:
```
Build admin analytics API:
1. GET /api/admin/shifts - return all shifts with filters (date range, employee)
2. GET /api/admin/analytics/summary - daily/weekly/monthly breakdowns
3. Calculate total wages per employee (hours × hourly rate)
4. Aggregation queries using Prisma
5. Include pagination for large datasets
6. Add CSV export functionality
```

---

#### Ticket #11: Admin Dashboard UI
**Type**: Feature  
**Story Points**: 13  
**Priority**: P2

**Description**: Manager dashboard with shift overview and wage calculations.

**Acceptance Criteria**:
- [ ] Dashboard with key metrics (employees working, hours today, weekly costs)
- [ ] Date range selector
- [ ] Shift timeline/calendar view
- [ ] Employee list with shift stats
- [ ] One-click wage calculation
- [ ] Charts for visual analytics (Recharts)

**Claude Code Prompt**:
```
Create admin dashboard with:
1. Key metrics cards (employees clocked in, today's hours, weekly wage costs)
2. Date range picker for custom periods
3. Shift calendar/timeline view
4. Employee table with sortable columns (name, hours, wages)
5. Bar/line charts for daily/weekly trends using Recharts
6. "Calculate Wages" button that shows breakdown per employee
7. Modern, data-dense UI design
```

---

### Epic 6: Time-Off Requests (Week 5)

#### Ticket #12: Time-Off API
**Type**: Feature  
**Story Points**: 5  
**Priority**: P2

**Description**: CRUD endpoints for time-off requests with approval workflow.

**Acceptance Criteria**:
- [ ] POST /api/time-off - create request
- [ ] GET /api/time-off/my-requests
- [ ] GET /api/admin/time-off/pending
- [ ] PUT /api/admin/time-off/:id/approve
- [ ] PUT /api/admin/time-off/:id/reject

**Claude Code Prompt**:
```
Build time-off request system:
1. POST /api/time-off - employees create requests
2. GET /api/time-off/my-requests - view own requests
3. GET /api/admin/time-off/pending - admins see all pending
4. PUT /api/admin/time-off/:id/approve - approve with manager ID
5. PUT /api/admin/time-off/:id/reject - reject with reason
6. Include date validation (no past dates, no overlaps)
```

---

#### Ticket #13: Time-Off UI
**Type**: Feature  
**Story Points**: 5  
**Priority**: P2

**Description**: Employee time-off request form and admin approval interface.

**Acceptance Criteria**:
- [ ] Request form with date pickers
- [ ] List of user's requests with status
- [ ] Admin view: pending requests list
- [ ] Approve/reject buttons for admins
- [ ] Calendar view of approved time off

**Claude Code Prompt**:
```
Create time-off request interface:
1. Employee form: date range picker, reason textarea
2. Display user's requests with status badges (pending/approved/rejected)
3. Admin view: table of pending requests with approve/reject actions
4. Calendar showing all approved time-off periods
5. Toast notifications on success/error
```

---

### Epic 7: Testing & Quality (Ongoing)

#### Ticket #14: Frontend Unit Tests
**Type**: Testing  
**Story Points**: 8  
**Priority**: P1

**Description**: Achieve 80%+ coverage on frontend components and hooks.

**Acceptance Criteria**:
- [ ] Component tests with React Testing Library
- [ ] Custom hooks tests
- [ ] Form validation tests
- [ ] 80%+ code coverage

**Claude Code Prompt**:
```
Write comprehensive frontend tests:
1. Component tests for login, clock in/out, admin dashboard
2. Test custom hooks (useAuth, useShifts)
3. Form validation tests with React Hook Form
4. Mock API calls with MSW
5. Target 80%+ coverage
6. Configure coverage reports
```

---

#### Ticket #15: E2E Tests
**Type**: Testing  
**Story Points**: 8  
**Priority**: P2

**Description**: Critical user journey tests with Playwright.

**Acceptance Criteria**:
- [ ] Employee login → clock in → clock out flow
- [ ] Admin login → view dashboard → approve time-off
- [ ] Onboarding → document upload flow
- [ ] Tests run in CI pipeline

**Claude Code Prompt**:
```
Write Playwright E2E tests for:
1. Employee journey: login, clock in, take break, clock out
2. Admin journey: login, view shifts, approve time-off request
3. Onboarding: new user uploads documents
4. Configure to run in GitHub Actions CI
5. Include screenshots on failure
```

---

### Epic 8: Production Deployment (Week 6)

#### Ticket #16: Containerization
**Type**: Infrastructure  
**Story Points**: 5  
**Priority**: P1

**Description**: Dockerize application for production deployment.

**Acceptance Criteria**:
- [ ] Dockerfile for frontend (Nginx)
- [ ] Dockerfile for backend
- [ ] Docker Compose for local dev
- [ ] Multi-stage builds for optimization
- [ ] Environment variable configuration

**Claude Code Prompt**:
```
Create Docker setup:
1. Frontend Dockerfile with multi-stage build (Vite build → Nginx)
2. Backend Dockerfile with Node.js
3. Docker Compose for local development (app + PostgreSQL)
4. Production-ready with environment variables
5. Optimize image sizes
```

---

#### Ticket #17: Deploy to Cloud
**Type**: Infrastructure  
**Story Points**: 8  
**Priority**: P1

**Description**: Deploy to cloud platform (Railway, Render, or AWS).

**Acceptance Criteria**:
- [ ] Frontend deployed with CDN
- [ ] Backend deployed with auto-scaling
- [ ] Database (managed PostgreSQL)
- [ ] Environment secrets configured
- [ ] Custom domain setup
- [ ] SSL certificates

**Claude Code Prompt**:
```
Guide me through deploying the restaurant HR app to Railway/Render:
1. Deploy PostgreSQL database
2. Deploy backend with environment variables
3. Deploy frontend with proper build config
4. Set up custom domain
5. Configure SSL
6. Set up monitoring/logging
```

---

## 5. GitHub Project Board Setup

### Board Columns
1. **Backlog** - All tickets not yet started
2. **Ready** - Tickets ready to be worked on (dependencies met)
3. **In Progress** - Currently being developed
4. **In Review** - PR open, awaiting review
5. **Testing** - Passed review, in QA
6. **Done** - Merged and deployed

### Labels
- `epic: foundation`, `epic: auth`, `epic: onboarding`, etc.
- `type: feature`, `type: bug`, `type: testing`, `type: docs`
- `priority: p0` (blocker), `priority: p1` (high), `priority: p2` (medium)
- `size: small` (1-3 pts), `size: medium` (5-8 pts), `size: large` (13+ pts)
- `needs: review`, `needs: testing`, `blocked`

---

## 6. Branching Strategy

### Branch Naming Convention
```
<type>/<ticket-number>-<short-description>

Examples:
- feature/4-backend-auth-api
- feature/9-clock-in-out-ui
- fix/23-wage-calculation-bug
- test/14-frontend-unit-tests
```

### Workflow
1. Create branch from `main`
2. Commit with conventional commits: `feat:`, `fix:`, `test:`, `docs:`
3. Push and open PR
4. Wait for CI checks to pass
5. Request review
6. Address feedback
7. Merge via squash (keeps history clean)

---

## 7. Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
Brief description of changes

## Related Ticket
Closes #[ticket number]

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Tests
- [ ] Documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] E2E tests pass

## Screenshots (if UI changes)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors/warnings
```

---

## 8. How to Use Claude Code Effectively

### For Each Ticket:

1. **Start with the prompt from the ticket**
   - Copy the "Claude Code Prompt" directly into VS Code
   - Claude Code will generate the initial implementation

2. **Iterative refinement**
   ```
   "Add error handling for network failures in the clock-in endpoint"
   "Refactor the auth context to use useReducer instead of useState"
   "Add loading skeletons to the admin dashboard"
   ```

3. **Ask for tests**
   ```
   "Write unit tests for the shift controller with 80% coverage"
   "Add Playwright test for the complete employee onboarding flow"
   ```

4. **Code review assistance**
   ```
   "Review this component for accessibility issues"
   "Check if this API endpoint has any security vulnerabilities"
   "Suggest performance optimizations for this dashboard query"
   ```

5. **Documentation**
   ```
   "Generate JSDoc comments for all functions in this file"
   "Create API documentation for the shift endpoints"
   "Write a README section explaining the auth flow"
   ```

### Claude Code Best Practices:
- **Be specific**: "Add pagination to the shifts table with 20 items per page"
- **Reference files**: "Update UserController.ts to include email validation"
- **Ask for explanations**: "Explain why you chose this approach for state management"
- **Request alternatives**: "Show me 2 different ways to implement the wage calculation"

---

## 9. Quality Gates (CI Pipeline)

Every PR must pass:

1. **Linting**: ESLint + Prettier
2. **Type checking**: TypeScript with strict mode
3. **Unit tests**: 80%+ coverage
4. **Build**: Frontend and backend compile successfully
5. **Security**: Dependency audit (npm audit)

Optional (as project matures):
- E2E tests on critical paths
- Lighthouse performance scores
- Bundle size limits

---

## 10. Timeline Estimate

**Total: 6-8 weeks** (working part-time, ~15-20 hrs/week)

- Week 1: Foundation + Auth
- Week 2: Onboarding + Document Upload
- Week 3: Shift Management (Employee)
- Week 4: Admin Dashboard
- Week 5: Time-Off + Polish
- Week 6: Testing + Deployment

---

## 11. Portfolio Presentation Tips

When showcasing this project:

### In Your README:
- Architecture diagram (show frontend, backend, database, S3)
- Feature screenshots/GIFs
- Tech stack badges
- "Why I built this" section
- Live demo link + test credentials

### In Interviews:
- **Talk about trade-offs**: "I chose PostgreSQL over MongoDB because..."
- **Discuss testing**: "Achieved 85% coverage with Vitest and Playwright"
- **Highlight DevOps**: "Set up CI/CD with GitHub Actions, deploys on every merge"
- **Show problem-solving**: "Initially had race conditions in clock-in, solved by..."
- **Demonstrate growth**: "Started with Context, migrated to React Query for better caching"

---

## 12. Next Steps

1. **Create GitHub repo** and initialize with this structure
2. **Set up GitHub Project board** with columns and labels
3. **Create all tickets** (you can batch-create from CSV or manually)
4. **Start with Ticket #1** and work through sequentially
5. **Use Claude Code** for each ticket's implementation

---

## Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [GitHub Actions Examples](https://github.com/actions/starter-workflows)
- [Playwright Documentation](https://playwright.dev/)

---

## How to Use Claude Code for maximum productivity & learning:

- Start every feature with:

"Before any code, explain how [feature] works:
- What's the concept?
- What are the gotchas?
- Show me ONE simple example with comments
- Then I'll build the rest myself"

- After wriing the code:

"Review my [component/endpoint] for:
- Bugs and security issues
- Better patterns I should know
- Explain WHY your suggestions are better"

- Test your understanding:

"Quiz me on what I just built. Don't give answers immediately - 
let me explain it first, then tell me what I got wrong"