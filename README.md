# ELA Visualizer - ManageEngine EventLog Analyzer Training Platform

An interactive web application that visually explains the working of ManageEngine EventLog Analyzer (ELA) for training purposes. Built with React + Vite (frontend) and Python (backend), deployed on Zoho Catalyst.

## Features

- **Log Collection** - Agent-based, agentless, syslog, and cloud log collection methods
- **Log Parsing** - Raw log parsing, field extraction, and normalization
- **Alerting** - Alert profiles, conditions, real-time notifications
- **Reporting** - 1000+ predefined reports with charts and scheduling
- **Compliance** - PCI DSS, HIPAA, SOX, GDPR, FISMA, ISO 27001 support
- **Correlation** - Event correlation engine for complex threat detection

## Project Structure

```
ela-visualizer-catalyst/
├── catalyst.json              # Zoho Catalyst configuration
├── client/                    # Vite build output (Catalyst frontend)
├── functions/
│   └── ela_api/               # Python backend (Catalyst Advanced I/O)
│       ├── main.py
│       ├── requirements.txt
│       └── catalyst-config.json
├── src/                       # React source code
│   ├── components/
│   │   ├── Layout/            # Sidebar navigation
│   │   ├── Dashboard/         # Feature overview
│   │   ├── LogCollection/     # Log collection module
│   │   ├── LogParsing/        # Log parsing module
│   │   ├── Alerting/          # Alerting module
│   │   ├── Reporting/         # Reporting module
│   │   ├── Compliance/        # Compliance module
│   │   ├── Correlation/       # Correlation module
│   │   └── common/            # Shared components
│   └── ...
└── plan/                      # Project planning docs
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production (outputs to client/)
npm run build
```

## Deployment (Zoho Catalyst)

```bash
# Install Catalyst CLI
npm install -g zcatalyst-cli

# Initialize project
catalyst init

# Deploy
catalyst deploy
```

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons
- **Backend**: Python (Zoho Catalyst Advanced I/O Function)
- **Deployment**: Zoho Catalyst
