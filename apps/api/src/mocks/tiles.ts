export const mockVectorTileCapabilities = {
    "tiles": [
        "https://mock-api/vector-tiles/{z}/{x}/{y}.pbf"
    ],
    "name": "Mock Vector Tiles",
    "description": "Mock vector tiles for development",
    "version": "1.0.0",
    "attribution": "Mock Data",
    "scheme": "xyz",
    "format": "pbf",
    "bounds": [13.0, 42.0, 20.0, 47.0],
    "center": [16.5, 44.5, 8],
    "minzoom": 0,
    "maxzoom": 18,
    "vector_layers": [
        {
            "id": "cadastral_parcels",
            "description": "Cadastral parcels layer",
            "fields": {
                "id": "Number",
                "parcel_number": "String",
                "cadastral_municipality": "String",
                "area": "String"
            },
            "minzoom": 6,
            "maxzoom": 18
        },
        {
            "id": "cadastral_municipalities",
            "description": "Cadastral municipalities layer",
            "fields": {
                "municipality_number": "String",
                "area": "String"
            },
            "minzoom": 0,
            "maxzoom": 18
        }
    ]
};

export const mockWMSCapabilities = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms" xmlns:xlink="http://www.w3.org/1999/xlink">
  <Service>
    <Name>WMS</Name>
    <Title>Mock WMS Service</Title>
    <Abstract>Mock Web Map Service for development</Abstract>
    <OnlineResource xlink:type="simple" xlink:href="https://mock-wms/service"/>
  </Service>
  <Capability>
    <Request>
      <GetCapabilities>
        <Format>text/xml</Format>
        <DCPType>
          <HTTP>
            <Get><OnlineResource xlink:type="simple" xlink:href="https://mock-wms/service?"/></Get>
          </HTTP>
        </DCPType>
      </GetCapabilities>
      <GetMap>
        <Format>image/png</Format>
        <Format>image/jpeg</Format>
        <DCPType>
          <HTTP>
            <Get><OnlineResource xlink:type="simple" xlink:href="https://mock-wms/service?"/></Get>
          </HTTP>
        </DCPType>
      </GetMap>
    </Request>
    <Layer>
      <Name>OSM-WMS</Name>
      <Title>Mock OpenStreetMap WMS</Title>
      <Abstract>Mock OpenStreetMap tiles via WMS</Abstract>
      <CRS>EPSG:3857</CRS>
      <CRS>EPSG:4326</CRS>
      <EX_GeographicBoundingBox>
        <westBoundLongitude>13.0</westBoundLongitude>
        <eastBoundLongitude>20.0</eastBoundLongitude>
        <southBoundLatitude>42.0</southBoundLatitude>
        <northBoundLatitude>47.0</northBoundLatitude>
      </EX_GeographicBoundingBox>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

// Mock PNG image as base64 for WMS GetMap responses
export const mockWMSImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

// Mock vector tile (empty PBF)
export const mockVectorTile = Buffer.from([]);