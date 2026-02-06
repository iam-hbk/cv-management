# CV Template Generation Tool

A sophisticated web-based platform that streamlines the CV creation process by offering both AI-assisted and manual paths for generating standardized CVs.

## Application Flow
![Application Flow Diagram](/app-flow.png)

## 🌟 Key Features

### Two Flexible Paths

#### 1. AI-Assisted Generation
- Upload existing CV (PDF, DOC, DOCX)
- AI-powered information extraction
- Auto-filled forms with extracted data
- Review and edit capabilities
- Smart confidence indicators for extracted data

#### 2. Manual Entry
- Structured multi-step form interface
- Real-time validation
- Progress saving
- Intuitive section organization

### Common Features
- Standardized company template application
- Real-time document preview
- Downloadable Word document output
- Comprehensive form sections:
  - Executive Summary
  - Personal Information
  - Work Experience
  - Education
  - Skills
  - Additional custom fields

## 🛠 Technical Stack

### Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend
- Convex (database & backend)
- Better-Auth (authentication)
- Mistral LLM for AI processing
- Document parsing engine
- Template generation system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Convex account (https://convex.dev)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cv-templater
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL
- `CONVEX_DEPLOY_KEY` - Convex deploy key (for production)
- `BETTER_AUTH_SECRET` - Secret key for authentication
- `MISTRAL_API_KEY` - API key for AI extraction features

4. Initialize Convex:
```bash
npx convex dev
```

5. Bootstrap the first admin user (see below)

6. Start the development server:
```bash
pnpm dev
```

## 👤 Admin User Setup

This application does not have public registration. Users must be created by an administrator. To bootstrap the first admin user:

### Using Default Credentials

Run the seed command with default credentials:

```bash
npx convex run users:seedAdmin
```

This creates an admin with:
- **Email:** `admin@intobeing.com`
- **Password:** `AdminTemp123!`

### Using Custom Credentials

Specify your own email and password:

```bash
npx convex run users:seedAdmin '{"email": "your@email.com", "password": "YourSecurePassword123!", "name": "Your Name"}'
```

### After Seeding

1. Go to your app login page (`/login`)
2. Sign in with the admin credentials
3. **IMPORTANT:** Change your password immediately via Dashboard → Users → (Your User) → Change Password
4. Create additional users via Dashboard → Users → Add User

### Notes

- The seed command is safe to run multiple times - it will not create duplicate users
- If users already exist, it returns a message and takes no action
- Only use this for initial setup; create subsequent users via the UI
