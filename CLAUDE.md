# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Bo Yang's personal website - a static portfolio website showcasing professional experience, publications, and travel photography.

## Deployment

The project is automatically deployed to GitHub Pages via GitHub Actions when pushing to the main branch. The workflow:
- Uploads the `src/public/` directory contents
- Deploys to GitHub Pages at: https://yang-b.github.io/personal-web/

To enable GitHub Pages:
1. Go to repository Settings > Pages
2. Under "Build and deployment", select "GitHub Actions" as the source
3. The workflow will automatically deploy on push to main branch

## Architecture

### Main Components

**Static Content** (`src/public/`):
- HTML pages: `index.html`, `experience.html`, `publications.html`, `interest.html`
- CSS files in `/CSS/` directory
- Static assets in `/Figures/` (travel photos), `/Documents/` (CV, thesis, papers), `/Conference/` (presentations)

**Pages**:
- `index.html` - Home page with professional introduction and external links
- `experience.html` - Education history and work experience
- `publications.html` - Journal articles, patents, and conference papers
- `interest.html` - Travel photography gallery organized by year

**Key Frontend Features**:
- Google Analytics integration (UA-135500287-1)
- Responsive design with navigation between portfolio sections
- Clean, minimal HTML/CSS architecture

## Development Notes

- Pure static website with no backend dependencies
- No build process required
- All content served directly from the `src/public/` directory
- To preview locally, use any static file server (e.g., `python -m http.server` from `src/public/` directory)