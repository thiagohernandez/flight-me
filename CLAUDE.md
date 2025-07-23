# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flight-Me is a Next.js web application that tracks real-time flights over Lliria, Spain using the OpenSky Network API. The app displays flights within a configurable radius and updates every 30 seconds.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: OpenSky Network REST API
- **Location**: Lliria, Spain (39.6103, -0.6191)

## Development Commands

```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Project Structure

- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - React components
- `/src/lib/` - Utility functions and API integrations
- `/src/types/` - TypeScript type definitions

## Key Features

- Real-time flight tracking using OpenSky Network API
- Configurable search radius (25km, 50km, 100km)
- Auto-refresh every 30 seconds
- Flight information display (callsign, altitude, speed, heading)
- Responsive design with dark mode support

## API Integration

The app uses the OpenSky Network API to fetch flights in a bounding box around Lliria. The API is free but has rate limits. The integration includes:

- Distance calculation using Haversine formula
- Filtering for airborne flights only
- Error handling for API failures
- CORS proxy may be needed for client-side requests in production

## Development Notes

- The OpenSky API may have CORS restrictions in browser environments
- Consider implementing API routes (`/api/flights`) for production deployment
- Flight data is filtered to show only airborne aircraft
- The app automatically refreshes data but users can manually refresh