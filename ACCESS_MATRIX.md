## 📊 Authorized User Access Control Matrix | Only applicable on Dashboard

| Category           | Feature                        | Director | Project Manager | Admin | User | Subscriber |
| ------------------ | ------------------------------ | -------- | --------------- | ----- | ---- | ---------- |
| 🖥 Dashboard       | **Analytics Dashboard Access** | ✅       | ✅              | ✅    | ❌   | ❌         |
|                    | **User Dashboard Access**      | ❌       | ❌              | ❌    | ✅   | ❌         |
| 📊 Analytics       | Full Analytics                 | ✅       | ❌              | ❌    | ❌   | ❌         |
|                    | Limited Analytics              | ✅       | ✅              | ✅    | ❌   | ❌         |
| 🧪 App Management  | Create Apps/Projects           | ✅       | ❌              | ❌    | ❌   | ❌         |
|                    | Manage Apps/Projects           | ✅       | ✅              | ✅    | ❌   | ❌         |
|                    | Assign App/Projects Manager    | ✅       | ❌              | ❌    | ❌   | ❌         |
|                    | App/Projects Management        | ✅       | ✅              | ✅    | ❌   | ❌         |
|                    | Feature Request Management     | ✅       | ✅              | ✅    | ❌   | ❌         |
| 🙋 Requests        | Create App Request             | ✅       | ✅              | ✅    | ✅   | ❌         |
|                    | Create Feature Request         | ❌       | ❌              | ❌    | ✅   | ❌         |
| 💼 User Management | User Management                | ✅       | ✅              | ✅    | ❌   | ❌         |
| 🛠 Settings        | System Settings                | ✅       | ❌              | ❌    | ❌   | ❌         |
|                    | Access Toggle Settings         | ✅       | ❌              | ❌    | ❌   | ❌         |
| 💳 Billing         | Billing Management             | ✅       | ❌              | ❌    | ❌   | ❌         |
|                    | Billing History                | ✅       | ✅              | ✅    | ❌   | ❌         |
|                    | Personal Billing               | ❌       | ❌              | ❌    | ✅   | ❌         |
| ✍️ Content         | Director Blog Management       | ✅       | ❌              | ❌    | ❌   | ❌         |
|                    | General Blog Management        | ✅       | ✅              | ✅    | ❌   | ❌         |
|                    | Director Portfolio Management  | ✅       | ❌              | ❌    | ❌   | ❌         |
| 📇 Profile         | Profile Management             | ✅       | ✅              | ✅    | ✅   | ❌         |
| 📬 Support         | Provide Support                | ✅       | ✅              | ✅    | ❌   | ❌         |
|                    | Receive Support                | ❌       | ❌              | ❌    | ✅   | ❌         |
| 📢 Marketing       | Marketing Mail Management      | ✅       | ✅              | ✅    | ❌   | ❌         |
|                    | Receive Marketing Mails        | ❌       | ❌              | ❌    | ✅   | ✅         |

## 🧩 Five-Tier User System (Updated)

### 🔑 Director (Founder)

- **Access**: Analytics Dashboard
- **Analytics**: Full system analytics
- **App/Project**:
  - Create new apps/projects
  - Manage assigned apps/projects
  - Assign App/Project Managers
- **Role & User Management**:
  - Manage all roles (Project Managers, Admins)
  - Manage all users
- **Content**:
  - Director blog management
  - Director portfolio management
  - General blog management
- **Billing**:
  - Manage system billing
  - View billing history
- **Settings**:
  - Access and manage system settings
  - Feature access toggle
- **Marketing**:
  - Marketing mail management
- **Support**:
  - Provide support to users
- ❌ Cannot access the User Dashboard (not applicable)

---

### 👨‍🔧 Project Manager

- **Access**: Analytics Dashboard
- **Analytics**: Limited analytics (project-related)
- **App/Project**:
  - Manage existing apps/projects
  - View app/feature requests
- **User Management**:
  - Manage Users and Subscribers
- **Content**:
  - General blog management
- **Billing**:
  - View billing history
- **Marketing**:
  - Marketing mail management
- **Support**:
  - Provide support to users
- ❌ Cannot:
  - Create new apps/projects
  - Assign managers
  - Access system settings or toggle features
  - Manage Director blog or portfolio
  - Access User Dashboard

---

### 👨‍💼 Admin

- **Access**: Analytics Dashboard
- **Analytics**: Limited analytics (project-related)
- **App/Project**:
  - Manage existing apps/projects
  - View app/feature requests
- **User Management**:
  - Manage Users and Subscribers
- **Content**:
  - General blog management
- **Billing**:
  - View billing history
- **Marketing**:
  - Marketing mail management
- **Support**:
  - Provide support to users
- ❌ Cannot:
  - Create new apps/projects
  - Assign managers
  - Access system settings or toggle features
  - Manage Director blog or portfolio
  - Access User Dashboard

---

### 👤 User

- **Access**: User Dashboard
- **Requests**:
  - Create app requests
  - Create feature requests
  - View request history
- **Billing**:
  - Personal billing and order management
- **Profile**:
  - Manage personal profile
- **Support**:
  - Receive support
- **Marketing**:
  - Receive marketing emails
- ❌ Cannot:
  - Access Analytics Dashboard
  - View analytics
  - Manage or create apps/projects
  - Moderate content
  - Manage users or system settings

---

### 📧 Subscriber

- ❌ No dashboard access
- **Marketing**:
  - Receive marketing emails
- **Public Access**:
  - Read-only access to public content
- **Newsletter**:
  - Receive newsletter via emails
- ❌ Cannot:
  - Submit requests
  - Access analytics
  - Manage apps/projects
  - Access any dashboard
  - Moderate content or manage users
