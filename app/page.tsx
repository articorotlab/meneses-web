import Image from "next/image";

import {
  CalendarDays,
  Clock3,
  ImageIcon,
  MapPin,
  Navigation,
} from "lucide-react";

import FairMap from "@/components/fair-map";

import {
  getPublicEvents,
  getPublicFair,
  type FairHour,
} from "@/lib/public-fair";

import {
  getPublicContent,
} from "@/lib/public-content";

import "./map.css";
import "./public-content.css";


export const dynamic =
  "force-dynamic";


export const revalidate =
  0;


const DAY_NAMES: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};


function formatTime(
  value: string | null
) {
  if (!value) {
    return "";
  }

  const [
    hoursText,
    minutes,
  ] = value.split(":");

  const hours =
    Number(hoursText);

  const suffix =
    hours >= 12
      ? "PM"
      : "AM";

  const normalized =
    hours % 12 || 12;

  return (
    `${normalized}:` +
    `${minutes} ` +
    `${suffix}`
  );
}


function formatSchedule(
  hour: FairHour | null
) {
  if (!hour) {
    return "Horario por confirmar";
  }

  if (hour.isClosed) {
    return "Cerrado";
  }

  return (
    `${formatTime(hour.opensAt)} – ` +
    `${formatTime(hour.closesAt)}`
  );
}


function locationLabel(
  city: string | null,
  state: string | null,
  country: string | null
) {
  return [
    city,
    state,
    country,
  ]
    .filter(Boolean)
    .join(", ");
}


export default async function Home() {
  const [
    fairData,
    eventsData,
    contentData,
  ] =
    await Promise.all([
      getPublicFair(),
      getPublicEvents(),
      getPublicContent(),
    ]);

  const {
    fair,
  } =
    fairData;

  const events =
    eventsData.events;


  const attractions =
    contentData.attractions;


  const coverImageUrl =
    contentData.coverImageUrl;


  /* =========================================================
     LOCATION
     ========================================================= */

  const shortLocation =
    locationLabel(
      fair.location.city,
      fair.location.state,
      null
    ) ||
    "Ubicación por confirmar";

  const fullLocation =
    [
      fair.location.address,
      fair.location.city,
      fair.location.state,
      fair.location.country,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Ubicación por confirmar";


  /* =========================================================
     TODAY
     ========================================================= */

  const todaySchedule =
    formatSchedule(
      fair.todayHours
    );


  /* =========================================================
     MAP
     ========================================================= */

  const canShowMap =
    fair.location.latitude !== null &&
    fair.location.longitude !== null &&
    Boolean(
      process.env
        .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    );

  const mapFairName =
    fair.location.name ||
    fair.name;


  return (
    <main>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="site-header">
        <div className="site-shell nav-wrap">

          <a
            href="#inicio"
            className="brand"
            aria-label={fair.name}
          >
            <Image
              src="/images/logo-meneses.png"
              alt={fair.name}
              width={68}
              height={68}
              priority
              className="brand-logo"
            />
          </a>

          <nav
            className="main-nav"
            aria-label="Navegación principal"
          >
            <a href="#visitanos">
              Ubicación
            </a>

            <a href="#horarios">
              Horarios
            </a>

            <a href="#atracciones">
              Atracciones
            </a>

            {events.length > 0 && (
              <a href="#eventos">
                Eventos
              </a>
            )}
          </nav>

          <a
            className="admin-link"
            href="/admin"
          >
            Administrador
          </a>

        </div>
      </header>


      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        id="inicio"
        className="hero"
      >
        <div
          className="hero-background"
          style={
            coverImageUrl
              ? {
                  backgroundImage:
                    `url("${coverImageUrl}")`,
                }
              : undefined
          }
        />

        <div className="hero-overlay" />

        <div className="site-shell hero-content">

          <Image
            src="/images/logo-meneses.png"
            alt=""
            width={152}
            height={152}
            priority
            className="hero-logo"
          />

          <h1>
            {fair.name}
          </h1>

          <p className="hero-tagline">
            Diversión para toda la familia
          </p>


          {/* =================================================
              HERO INFORMATION CARDS
              ================================================= */}

          <div className="hero-facts">

            <div className="hero-fact-card">
              <MapPin
                size={22}
              />

              <span>
                <small>
                  Ubicación actual
                </small>

                <strong>
                  {shortLocation}
                </strong>
              </span>
            </div>


            <div className="hero-fact-card">
              <Clock3
                size={22}
              />

              <span>
                <small>
                  Horario de hoy
                </small>

                <strong>
                  {todaySchedule}
                </strong>
              </span>
            </div>

          </div>


          {fair.location.mapsUrl ? (
            <a
              className="button button-primary"
              href={fair.location.mapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation
                size={18}
              />

              Cómo llegar
            </a>
          ) : (
            <a
              className="button button-primary"
              href="#visitanos"
            >
              <Navigation
                size={18}
              />

              Ver ubicación
            </a>
          )}

        </div>
      </section>


      {/* =====================================================
          UBICACIÓN + HORARIOS
          ===================================================== */}

      <section
        id="visitanos"
        className="section visit-section"
      >
        <div className="site-shell visit-grid">


          {/* =================================================
              UBICACIÓN
              ================================================= */}

          <div className="location-card">

            <div className="section-icon red">
              <MapPin
                size={23}
              />
            </div>

            <span className="section-kicker">
              Ubicación actual
            </span>

            <h2>
              {mapFairName}
            </h2>

            <p>
              {fullLocation}
            </p>

            {canShowMap &&
              fair.location.latitude !== null &&
              fair.location.longitude !== null && (
                <div className="location-map">
                  <FairMap
                    latitude={
                      fair.location.latitude
                    }
                    longitude={
                      fair.location.longitude
                    }
                    fairName={
                      mapFairName
                    }
                  />
                </div>
              )}

            {fair.location.mapsUrl && (
              <a
                className="button button-primary"
                href={fair.location.mapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation
                  size={18}
                />

                Abrir en Maps
              </a>
            )}

          </div>


          {/* =================================================
              HORARIOS
              ================================================= */}

          <div
            id="horarios"
            className="hours-card"
          >
            <div className="section-icon blue">
              <Clock3
                size={23}
              />
            </div>

            <span className="section-kicker">
              Horarios
            </span>

            <h2>
              Planea tu visita
            </h2>

            <div className="hours-list">

              {fair.hours.map(
                (
                  hour
                ) => {
                  const isToday =
                    fair.todayHours
                      ?.dayOfWeek ===
                    hour.dayOfWeek;

                  return (
                    <div
                      key={
                        hour.dayOfWeek
                      }
                      className={
                        isToday
                          ? "today"
                          : ""
                      }
                    >
                      <span>
                        {
                          DAY_NAMES[
                            hour.dayOfWeek
                          ] ??
                          `Día ${hour.dayOfWeek}`
                        }

                        {isToday && (
                          <small>
                            HOY
                          </small>
                        )}
                      </span>

                      <strong>
                        {
                          formatSchedule(
                            hour
                          )
                        }
                      </strong>
                    </div>
                  );
                }
              )}

            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          ATRACCIONES
          ===================================================== */}

      <section
        id="atracciones"
        className="section attractions-section"
      >
        <div className="site-shell">

          <div className="section-heading">
            <div>
              <span className="section-kicker">
                Atracciones
              </span>

              <h2>
                Vive la feria
              </h2>
            </div>
          </div>


          {attractions.length > 0 ? (

            <div className="public-attraction-grid">

              {attractions.map(
                (
                  attraction
                ) => {

                  const mainImage =
                    attraction.images[0]
                      ?.url ??
                    null;


                  return (

                    <article
                      className="public-attraction-card"
                      key={
                        attraction.id
                      }
                    >

                      <div className="public-attraction-main-image">

                        {mainImage ? (

                          <img
                            src={
                              mainImage
                            }
                            alt={
                              attraction.name
                            }
                          />

                        ) : (

                          <div className="public-attraction-placeholder">

                            <ImageIcon
                              size={36}
                            />

                            <span>
                              Imagen por agregar
                            </span>

                          </div>

                        )}

                      </div>


                      <div className="public-attraction-copy">

                        <h3>
                          {attraction.name}
                        </h3>


                        {attraction.images.length > 1 && (

                          <span>
                            {attraction.images.length} imágenes
                          </span>

                        )}

                      </div>


                      {attraction.images.length > 1 && (

                        <div className="public-attraction-thumbnails">

                          {attraction.images
                            .slice(
                              1,
                              4
                            )
                            .map(
                              (
                                image
                              ) => (

                                <img
                                  key={
                                    image.id
                                  }
                                  src={
                                    image.url
                                  }
                                  alt=""
                                />

                              )
                            )}


                          {attraction.images.length > 4 && (

                            <div className="public-attraction-more">
                              +{
                                attraction.images.length -
                                4
                              }
                            </div>

                          )}

                        </div>

                      )}

                    </article>

                  );
                }
              )}

            </div>

          ) : (

            <div className="public-attractions-empty">

              <ImageIcon
                size={32}
              />

              <strong>
                Atracciones próximamente
              </strong>

              <span>
                Estamos preparando la galería de la feria.
              </span>

            </div>

          )}

        </div>
      </section>


      {/* =====================================================
          EVENTOS
          ===================================================== */}

      {events.length > 0 && (
        <section
          id="eventos"
          className="section events-section"
        >
          <div className="site-shell">

            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  Próximamente
                </span>

                <h2>
                  Eventos
                </h2>
              </div>
            </div>


            <div className="events-grid">

              {events.map(
                (
                  event
                ) => (
                  <article
                    className="event-card"
                    key={event.id}
                  >
                    <CalendarDays
                      size={24}
                    />

                    <div>
                      <span>
                        {event.date}
                      </span>

                      <h3>
                        {event.title}
                      </h3>

                      {event.startTime && (
                        <p>
                          {
                            formatTime(
                              event.startTime
                            )
                          }
                        </p>
                      )}
                    </div>
                  </article>
                )
              )}

            </div>

          </div>
        </section>
      )}


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="footer">

        <div className="site-shell footer-content">

          <Image
            src="/images/logo-meneses.png"
            alt=""
            width={64}
            height={64}
            className="footer-logo"
          />

          <div>
            <strong>
              {fair.name}
            </strong>

            <span>
              {shortLocation}
            </span>
          </div>

          <p>
            © 2026 Espectaculares Meneses
          </p>

        </div>

      </footer>

    </main>
  );
}