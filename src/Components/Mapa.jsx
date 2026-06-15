import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function Mapa() {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    console.log("TOKEN:", import.meta.env.VITE_MAPBOX_TOKEN)

    if (map.current) return

    const timeout = setTimeout(() => {
      if (!mapContainer.current) return

      const mapa = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/nico-sxchez/cmngv8iz9001h01qw0e5fe0lo", // 👈 TU ESTILO
        center: [-70.6693, -33.4489],
        zoom: 5
      })

      mapa.on("load", () => {
        console.log("Mapa cargado ✅")

        mapa.addSource("incendios", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: { intensidad: "alta" },
                geometry: {
                  type: "Point",
                  coordinates: [-70.5, -33.4]
                }
              }
            ]
          }
        })

        mapa.addLayer({
          id: "incendios-layer",
          type: "circle",
          source: "incendios",
          paint: {
            "circle-radius": 10,
            "circle-color": [
              "match",
              ["get", "intensidad"],
              "alta", "red",
              "media", "orange",
              "baja", "yellow",
              "gray"
            ]
          }
        })

        mapa.resize()
      })

      map.current = mapa
    }, 300)

    return () => {
      clearTimeout(timeout)
      map.current?.remove()
    }
  }, [])

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh"
      }}
    />
  )
}