# Rakshak Security Platform

Rakshak is a comprehensive, multi-tenant B2B Security Operations & Management Platform built for modern security agencies to track guards, manage clients, and monitor platform telemetry.

## 🚀 Features

- **Multi-Tenant Architecture**: Robust data isolation using Supabase RLS (Row Level Security).
- **Role-Based Portals**:
  - **Super Admin**: Monitor global MRR, manage tenant registrations, view system-wide audit logs, and manage support tickets via a live Kanban board.
  - **Client Owner**: Manage specific organizational billing (in INR/₹), sites, and guard deployments.
  - **Supervisor**: Manage daily operational tasks, incidents, and active guard tracking.
- **Glassmorphism UI**: A stunning, modern, premium interface using TailwindCSS, featuring mesh gradients, frosted glass panels (`backdrop-blur`), and dynamic theme toggling (Light/Dark mode).
- **Live Telemetry & Sync**: Real-time DB querying with Supabase for metrics, support queues, and audits.
- **Indian Localization**: Built-in global IST (`Asia/Kolkata`) clocks and INR (`₹`) billing localization formats.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Icons**: Google Material Symbols

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project (with the corresponding tables: `tenants`, `guards`, `support_tickets`, `audit_logs`, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rakshak-software-web.git
   cd rakshak-software-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```text
src/
├── app/
│   ├── (portals)/
│   │   ├── admin/      # Super Admin Portal (Dashboard, Tenants, Support, Audit)
│   │   ├── org/        # Client Owner Portal (Billing, Sites, Schedules)
│   │   └── ops/        # Supervisor Portal (Live Tracking, Incidents)
│   ├── auth/           # Login & Registration flows
│   └── globals.css     # Global theme & Glassmorphism styles
├── components/
│   ├── shell/          # Core layout components (TopBar, Sidebar)
│   └── ui/rakshak/     # Specialized UI components (Clocks, PricingCards)
└── config/             # Navigation & RBAC constants
```

## 🔒 Security & Database

This project relies on Supabase for data integrity. Make sure your Row Level Security (RLS) policies are correctly configured so that:
- `SUPER_ADMIN` can read all schemas.
- `CLIENT_OWNER` can only read/write rows matching their `tenant_id`.

## 📄 License

This project is proprietary software belonging to Rakshak Security.
