# Changelog

All notable changes to SmartCrop OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Git workflow and branching strategy documentation
- CI/CD pipeline with GitHub Actions
- Pull request templates and guidelines
- Issue templates (bug report, feature request)
- Contributing guidelines
- Automated release workflow
- Comprehensive API documentation page

### Changed
- Improved landing page with IoT architecture details
- Enhanced database architecture documentation
- Updated navigation links (API docs, legal pages)

### Fixed
- Login/Register page navigation (added "Back to Home" links)
- Landing page footer Dashboard link redirects to login

---

## [1.0.0] - 2024-11-14

### Added
- Complete farm management system (CRUD operations)
- Zone management with status tracking
- Growing recipes with multi-stage environmental parameters
- Batch tracking from inoculation to harvest
- Harvest recording with flush-based yield tracking
- Environmental monitoring with IoT integration
- Real-time telemetry from ESP32 sensors
- MQTT broker integration
- Raspberry Pi gateway for sensor aggregation
- Inventory management (items, transactions, low stock alerts)
- Alerts & notifications (in-app, email, SMS, WhatsApp)
- Task management with recurrence and assignments
- Employee management with RBAC
- Labor tracking (clock in/out, work logs)
- Cost & revenue tracking
- Profitability analytics (ROI, profit margins)
- Quality control (inspections, defects, standards)
- SOP management (procedures, execution tracking)
- Equipment control (relay, PWM, auto/manual modes)
- Recipe execution with stage approval workflow
- Analytics dashboard with charts and KPIs
- Google OAuth 2.0 authentication
- JWT session management
- PostgreSQL database with Sequelize ORM
- Redis caching and session storage
- Twilio integration for SMS/WhatsApp
- Node-cron for scheduled tasks
- Docker containerization
- AWS deployment infrastructure
- API documentation page
- Legal pages (Privacy, Terms, Cookies, GDPR)
- Landing page with feature showcase
- About Us and FAQ pages
- Responsive mobile-friendly UI
- Toast notifications and confirmation modals
- Loading skeletons for better UX
- Empty state components

### Technical Stack
- **Backend**: Node.js 18, Express.js, Sequelize ORM
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand
- **Database**: PostgreSQL 15 (production), SQLite (development)
- **Cache**: Redis 7
- **IoT**: MQTT (Mosquitto), ESP32, Raspberry Pi 5
- **Auth**: JWT, Google OAuth 2.0, bcrypt
- **Notifications**: Twilio (SMS/WhatsApp), Email
- **Deployment**: Docker, AWS (Elastic Beanstalk, RDS, S3, CloudFront)
- **CI/CD**: GitHub Actions

---

## Version History

### Versioning Scheme

We use Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes, incompatible API changes
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, backward-compatible

### Release Types

- **Alpha** (`v1.1.0-alpha.1`): Early testing, unstable
- **Beta** (`v1.1.0-beta.1`): Feature complete, testing
- **Release Candidate** (`v1.1.0-rc.1`): Final testing before release
- **Stable** (`v1.1.0`): Production-ready release

---

## Upgrade Guide

### From v1.0.0 to v1.1.0

No breaking changes. Update dependencies:

```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install
```

### Database Migrations

```bash
cd backend
npm run migrate
```

---

## Links

- [GitHub Repository](https://github.com/your-org/smartcrop-os)
- [Documentation](https://docs.smartcrop.io)
- [API Reference](https://api.smartcrop.io/docs)
- [Issue Tracker](https://github.com/your-org/smartcrop-os/issues)
- [Changelog](https://github.com/your-org/smartcrop-os/blob/main/CHANGELOG.md)

---

## Contributors

Thank you to all our contributors! See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full list.

---

**Legend:**
- `Added`: New features
- `Changed`: Changes to existing functionality
- `Deprecated`: Features that will be removed
- `Removed`: Features that were removed
- `Fixed`: Bug fixes
- `Security`: Security fixes
