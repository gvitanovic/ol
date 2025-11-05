import { MapProvider } from './domain/map/context/MapContext'
import { MapComponent } from './components/organisms/MapComponent'
import './App.css'

function App() {
  return (
    <MapProvider>
      <div className="map-container">
        <MapComponent />
      </div>
    </MapProvider>
  )
}

export default App
