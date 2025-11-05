#!/bin/bash

# Script to toggle between mock and real data modes

case "$1" in
  "mock")
    echo "🎭 Switching to MOCK data mode..."
    export USE_MOCK_DATA=true
    echo "Mock mode enabled. Starting server..."
    npm run start
    ;;
  "real")
    echo "🌐 Switching to REAL data mode..."
    export USE_MOCK_DATA=false
    echo "Real mode enabled. Starting server..."
    npm run start
    ;;
  "dev-mock")
    echo "🎭 Starting development server with MOCK data..."
    USE_MOCK_DATA=true npm run dev
    ;;
  "dev-real")
    echo "🌐 Starting development server with REAL data..."
    USE_MOCK_DATA=false npm run dev
    ;;
  *)
    echo "Usage: $0 {mock|real|dev-mock|dev-real}"
    echo ""
    echo "  mock      - Start production server with mock data"
    echo "  real      - Start production server with real data" 
    echo "  dev-mock  - Start development server with mock data"
    echo "  dev-real  - Start development server with real data"
    echo ""
    echo "Current environment:"
    echo "  USE_MOCK_DATA=${USE_MOCK_DATA:-false}"
    exit 1
    ;;
esac