"use client";

import {
  importLibrary,
  setOptions,
} from "@googlemaps/js-api-loader";

import {
  useEffect,
  useRef,
} from "react";


type FairMapProps = {
  latitude: number;
  longitude: number;
  fairName: string;
};


let loaderConfigured = false;


export default function FairMap({
  latitude,
  longitude,
  fairName,
}: FairMapProps) {

  const mapElementRef =
    useRef<HTMLDivElement | null>(
      null
    );


  useEffect(() => {

    const apiKey =
      process.env
        .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (
      !apiKey ||
      !mapElementRef.current
    ) {
      return;
    }


    /*
     * Configuramos el loader una sola vez.
     */
    if (
      !loaderConfigured
    ) {

      setOptions({
        key:
          apiKey,

        v:
          "weekly",

        language:
          "es",

        region:
          "MX",
      });

      loaderConfigured =
        true;
    }


    let cancelled =
      false;


    async function initializeMap() {

      try {

        const {
          Map,
        } =
          await importLibrary(
            "maps"
          );


        const {
          AdvancedMarkerElement,
        } =
          await importLibrary(
            "marker"
          );


        if (
          cancelled ||
          !mapElementRef.current
        ) {
          return;
        }


        const position = {
          lat:
            latitude,

          lng:
            longitude,
        };


        /*
         * Para desarrollo usamos DEMO_MAP_ID.
         *
         * Más adelante crearemos un Map ID
         * propio para producción.
         */
        const map =
          new Map(
            mapElementRef.current,
            {
              center:
                position,

              zoom:
                16,

              mapId:
                "DEMO_MAP_ID",

              mapTypeControl:
                false,

              streetViewControl:
                false,

              fullscreenControl:
                true,

              zoomControl:
                true,

              clickableIcons:
                false,

              gestureHandling:
                "greedy",
            }
          );


        /*
         * =====================================================
         * MARCADOR PERSONALIZADO
         * =====================================================
         */

        const markerRoot =
          document.createElement(
            "div"
          );

        markerRoot.className =
          "fair-google-marker";


        const markerIcon =
          document.createElement(
            "div"
          );

        markerIcon.className =
          "fair-google-marker-icon";

        markerIcon.textContent =
          "🎡";

        const markerPoint =
        document.createElement(
            "div"
        );

        markerPoint.className =
        "fair-google-marker-point";


        const markerLabel =
          document.createElement(
            "div"
          );

        markerLabel.className =
          "fair-google-marker-label";

        markerLabel.textContent =
          fairName;


        markerRoot.append(
        markerIcon,
        markerPoint,
        markerLabel
        );


        /*
         * AdvancedMarkerElement pertenece
         * realmente al mapa.
         *
         * Por eso ahora:
         *
         * - al hacer zoom, sigue en el lugar;
         * - al mover el mapa, conserva sus coordenadas;
         * - sustituimos conceptualmente el pin rojo
         *   por nuestra rueda.
         */
        const marker =
            new AdvancedMarkerElement({
                map,
                position,
                title:
                fairName,

                /*
                * El punto geográfico debe quedar
                * aproximadamente en el centro inferior
                * del icono circular.
                */
                anchorLeft:
                "-50%",

                anchorTop:
                "-50%",
            });


        /*
         * La API actual permite utilizar el propio
         * AdvancedMarkerElement como HTMLElement.
         *
         * Agregamos nuestro contenido visual
         * como children.
         */
        marker.replaceChildren(
          markerRoot
        );


      } catch (
        error
      ) {

        console.error(
          "Error cargando Google Maps:",
          error
        );
      }
    }


    void initializeMap();


    return () => {

      cancelled =
        true;
    };

  }, [
    latitude,
    longitude,
    fairName,
  ]);


  return (
    <div
      ref={
        mapElementRef
      }
      className="fair-google-map"
      role="application"
      aria-label={
        `Mapa de ${fairName}`
      }
    />
  );
}