# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Bo Yang's personal website - a Node.js/Express web application that serves static content and tracks visitor geolocation data. The site includes portfolio pages for experience, publications, and travel photos.

## Commands

### Development
```bash
npm start                 # Start the server (runs on port 3000 or PORT env var)
```

### Deployment
The project is automatically deployed to Azure Web App (boyang) via GitHub Actions when pushing to the main branch. The workflow:
- Installs dependencies with `npm install`
- Attempts build with `npm run build --if-present` (no build script defined)
- Attempts tests with `npm run test --if-present` (no test script defined)

## Architecture

### Main Components

**Server Entry Point** (`src/app.js`):
- Express server that serves static files from `src/public/`
- Integrates geolocation tracking middleware from `veiwerGeoLocation.js`
- Defines routes for home page and geolocation API endpoints

**Geolocation Tracking** (`src/veiwerGeoLocation.js`):
- Uses IPinfo API (token: '8b750e7046c6db') to resolve visitor locations
- Stores visitor data in Azure SQL Database (PersonalWeb database)
- Provides three main endpoints:
  - `/get-viewer-location/:pageKey` - Records and returns visitor location
  - `/get-viewer-locations` - Returns all recorded locations
  - `/get-viewer-statistics` - Returns visitor statistics over past 6 months

**Database Configuration**:
- Azure SQL Server: `personalweb.database.windows.net`
- Database: `PersonalWeb`
- Table: `ViewerGeoData` (Page, City, Region, Country, Coordinates, Timestamp)
- Credentials are hardcoded in `veiwerGeoLocation.js` (lines 11-18)

### Frontend Structure

**Static Content** (`src/public/`):
- HTML pages: `index.html`, `experience.html`, `publications.html`, `interest.html`, `visitors.html`
- CSS files in `/CSS/` and `/style/` directories
- JavaScript utilities in `/utils/` for geolocation display and updates
- Static assets in `/Figures/`, `/Documents/`, `/Conference/`

**Key Frontend Features**:
- Google Analytics integration (UA-135500287-1)
- Client-side geolocation tracking via `updateViewerGeo.js`
- Responsive design with navigation between portfolio sections

## Development Notes

- No test framework is currently configured
- No build process is defined (static file serving only)
- Database credentials are hardcoded and should be moved to environment variables
- The project uses CommonJS modules (require/module.exports)
- All static files are served directly from the `src/public/` directory