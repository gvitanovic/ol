# Mock Data System

This API supports both real backend data and mock data for development and testing.

## Quick Start

### Using Mock Data
```bash
# Development with mock data
USE_MOCK_DATA=true npm run dev

# Or use the helper script
./run-mode.sh dev-mock
```

### Using Real Data
```bash
# Development with real data (default)
npm run dev

# Or use the helper script
./run-mode.sh dev-real
```

## Environment Variables

| Variable | Values | Description |
|----------|--------|-------------|
| `USE_MOCK_DATA` | `true`/`false` | Toggle between mock and real data |

## Available Endpoints

All endpoints work the same regardless of mock mode:

### Core Data
- `GET /health` - Health check (shows mock mode status)
- `GET /api/parcels` - List cadastral parcels
- `GET /api/parcels/:id` - Get specific parcel
- `GET /api/features/:id` - Get feature (legacy format)
- `GET /api/municipalities` - List municipalities
- `GET /api/municipalities/:number` - Get specific municipality

### Tiles
- `GET /api/vector-tiles/capabilities` - Vector tile capabilities
- `GET /api/vector-tiles/:z/:x/:y` - Vector tile data
- `GET /api/wms/capabilities` - WMS capabilities
- `GET /api/wms` - WMS GetMap requests

## Mock Data

The mock data includes:

### Parcels (5 samples)
- Zagreb: 2 parcels
- Split: 1 parcel
- Rijeka: 1 parcel
- Osijek: 1 parcel

### Municipalities (4 samples)
- Zagreb (10000)
- Split (21000)
- Rijeka (51000)
- Osijek (31000)

### Tiles
- Mock vector tiles (empty PBF)
- Mock WMS images (1x1 transparent PNG)
- Proper capabilities responses

## Development Benefits

### Mock Mode Advantages
✅ **Fast Development** - No network dependencies  
✅ **Predictable Data** - Consistent test scenarios  
✅ **Offline Work** - No internet required  
✅ **No Rate Limits** - Unlimited requests  
✅ **Custom Scenarios** - Easy to modify test data  

### Real Mode Advantages
✅ **Live Data** - Current real-world data  
✅ **Production Testing** - Test against actual backend  
✅ **Data Validation** - Verify real data structures  

## Helper Scripts

```bash
# Development modes
./run-mode.sh dev-mock    # Development with mock data
./run-mode.sh dev-real    # Development with real data

# Production modes  
./run-mode.sh mock        # Production with mock data
./run-mode.sh real        # Production with real data
```

## File Structure

```
apps/api/src/
├── mocks/
│   ├── index.ts          # Mock service coordinator
│   ├── parcels.ts        # Parcel mock data
│   ├── municipalities.ts # Municipality mock data
│   └── tiles.ts          # Tile mock data
├── services/
│   └── dataService.ts    # Unified data service
└── server.ts             # Main server with routing
```

## Adding New Mock Data

1. **Add to existing files**: Update arrays in `mocks/parcels.ts` or `mocks/municipalities.ts`
2. **Create new mock file**: Follow the pattern in existing mock files
3. **Update service**: Add methods to `MockDataService` in `mocks/index.ts`
4. **Update data service**: Add corresponding methods to `DataService`

## Environment Setup

### Development
```bash
# .env.development
USE_MOCK_DATA=true
```

### Production
```bash
# .env.production
USE_MOCK_DATA=false
```

### Docker
```dockerfile
ENV USE_MOCK_DATA=false
```

## Logging

Mock mode requests are logged with 🎭 emoji:
```
🎭 Using mock data for parcels list
🎭 Using mock data for parcel 1001
```

Real mode requests show actual URLs:
```
Proxying parcels list to: https://gis-dev.listlabs.net/api/dkp/parcels/
```