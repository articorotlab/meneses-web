"use client";

import {
  ArrowLeft,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Phone,
  Save,
  Settings,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


type FairHour = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};


type FairConfiguration = {
  fairName: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
  phone: string | null;
  hours: FairHour[];
};


const DAY_NAMES: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};


export default function ConfigurationForm({
  userName,
}: {
  userName: string;
}) {

  const [
    configuration,
    setConfiguration,
  ] =
    useState<FairConfiguration | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    generalSaving,
    setGeneralSaving,
  ] =
    useState(
      false
    );


  const [
    hoursSaving,
    setHoursSaving,
  ] =
    useState(
      false
    );


  const [
    generalMessage,
    setGeneralMessage,
  ] =
    useState<{
      type: "success" | "error";
      text: string;
    } | null>(
      null
    );


  const [
    hoursMessage,
    setHoursMessage,
  ] =
    useState<{
      type: "success" | "error";
      text: string;
    } | null>(
      null
    );


  /*
   * =========================================================
   * LOAD CONFIGURATION
   * =========================================================
   */

  useEffect(
    () => {

      async function load() {

        try {

          const response =
            await fetch(
              "/api/admin/fair",
              {
                cache:
                  "no-store",
              }
            );


          const data =
            await response.json();


          if (
            !response.ok
          ) {

            throw new Error(
              data.message ??
              "No fue posible cargar la configuración."
            );
          }


          setConfiguration(
            data.fair
          );


        } catch (
          currentError
        ) {

          setGeneralMessage({
            type:
              "error",

            text:
              currentError instanceof Error
                ? currentError.message
                : "Error desconocido.",
          });


        } finally {

          setLoading(
            false
          );
        }
      }


      void load();

    },
    []
  );


  /*
   * =========================================================
   * UPDATE GENERAL FIELD
   * =========================================================
   */

  function updateField(
    field:
      keyof Omit<
        FairConfiguration,
        "hours"
      >,

    value:
      string |
      number |
      null
  ) {

    setGeneralMessage(
      null
    );


    setConfiguration(
      (
        current
      ) => {

        if (
          !current
        ) {
          return current;
        }


        return {
          ...current,

          [field]:
            value,
        };
      }
    );
  }


  /*
   * =========================================================
   * UPDATE HOUR
   * =========================================================
   */

  function updateHour(
    dayOfWeek: number,

    field:
      keyof FairHour,

    value:
      string |
      boolean |
      null
  ) {

    setHoursMessage(
      null
    );


    setConfiguration(
      (
        current
      ) => {

        if (
          !current
        ) {
          return current;
        }


        return {
          ...current,

          hours:
            current.hours.map(
              (
                hour
              ) => {

                if (
                  hour.dayOfWeek !==
                  dayOfWeek
                ) {
                  return hour;
                }


                const updated:
                  FairHour = {
                    ...hour,

                    [field]:
                      value,
                  };


                if (
                  field ===
                    "isClosed" &&
                  value === true
                ) {

                  updated.opensAt =
                    null;

                  updated.closesAt =
                    null;
                }


                if (
                  field ===
                    "isClosed" &&
                  value === false
                ) {

                  updated.opensAt =
                    updated.opensAt ??
                    "18:00";

                  updated.closesAt =
                    updated.closesAt ??
                    "23:00";
                }


                return updated;
              }
            ),
        };
      }
    );
  }


  /*
   * =========================================================
   * SAVE GENERAL INFORMATION
   * =========================================================
   */

  async function handleSaveGeneral() {

    if (
      !configuration
    ) {
      return;
    }


    setGeneralSaving(
      true
    );

    setGeneralMessage(
      null
    );


    try {

      const response =
        await fetch(
          "/api/admin/fair",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                fairName:
                  configuration.fairName,

                locationName:
                  configuration.locationName,

                address:
                  configuration.address,

                city:
                  configuration.city,

                state:
                  configuration.state,

                country:
                  configuration.country,

                latitude:
                  configuration.latitude,

                longitude:
                  configuration.longitude,

                mapsUrl:
                  configuration.mapsUrl,

                phone:
                  configuration.phone,
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          result.message ??
          "No fue posible guardar la información."
        );
      }


      setGeneralMessage({
        type:
          "success",

        text:
          "Información actualizada correctamente.",
      });


    } catch (
      currentError
    ) {

      setGeneralMessage({
        type:
          "error",

        text:
          currentError instanceof Error
            ? currentError.message
            : "Error desconocido.",
      });


    } finally {

      setGeneralSaving(
        false
      );
    }
  }


  /*
   * =========================================================
   * SAVE HOURS
   * =========================================================
   */

  async function handleSaveHours() {

    if (
      !configuration
    ) {
      return;
    }


    setHoursSaving(
      true
    );

    setHoursMessage(
      null
    );


    try {

      const response =
        await fetch(
          "/api/admin/fair/hours",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                hours:
                  configuration.hours,
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          result.message ??
          "No fue posible guardar los horarios."
        );
      }


      setHoursMessage({
        type:
          "success",

        text:
          "Horarios actualizados correctamente.",
      });


    } catch (
      currentError
    ) {

      setHoursMessage({
        type:
          "error",

        text:
          currentError instanceof Error
            ? currentError.message
            : "Error desconocido.",
      });


    } finally {

      setHoursSaving(
        false
      );
    }
  }


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    loading
  ) {

    return (
      <main className="admin-config-page">

        <div className="admin-dashboard-shell admin-config-content">

          <div className="admin-config-loading">
            Cargando configuración...
          </div>

        </div>

      </main>
    );
  }


  if (
    !configuration
  ) {

    return (
      <main className="admin-config-page">

        <div className="admin-dashboard-shell admin-config-content">

          <div className="admin-config-loading error">
            No fue posible cargar la configuración.
          </div>

        </div>

      </main>
    );
  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <main className="admin-config-page">


      <header className="admin-dashboard-header">

        <div className="admin-dashboard-shell admin-header-inner">

          <div className="admin-config-header-left">

            <a
              href="/admin"
              className="admin-config-back"
            >
              <ArrowLeft
                size={18}
              />

              Panel administrativo
            </a>


            <span className="admin-config-user">
              {userName}
            </span>

          </div>


          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-config-preview"
          >
            <ExternalLink
              size={16}
            />

            Ver página pública
          </a>

        </div>

      </header>


      <div className="admin-dashboard-shell admin-config-content">


        <div className="admin-config-heading">

          <div className="admin-module-icon blue">

            <Settings
              size={25}
            />

          </div>


          <div>

            <span>
              Configuración
            </span>

            <h1>
              Información de la feria
            </h1>

            <p>
              Administra la información pública,
              ubicación y horarios de operación.
            </p>

          </div>

        </div>


        <div className="admin-config-layout">


          <section className="admin-config-card">

            <div className="admin-config-section-title">

              <Settings
                size={21}
              />


              <div>

                <span className="admin-config-section-kicker">
                  Datos principales
                </span>

                <h2>
                  Información general
                </h2>

                <p>
                  Información principal que verán
                  los visitantes de la feria.
                </p>

              </div>

            </div>


            <div className="admin-config-grid">

              <label>

                <span>
                  Nombre de la feria
                </span>

                <input
                  type="text"
                  value={
                    configuration.fairName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updateField(
                        "fairName",
                        event.target.value
                      )
                  }
                />

              </label>


              <label>

                <span>
                  Nombre de la ubicación
                </span>

                <input
                  type="text"
                  value={
                    configuration.locationName ??
                    ""
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updateField(
                        "locationName",
                        event.target.value
                      )
                  }
                />

              </label>


              <label className="admin-config-full">

                <span className="label-with-icon">

                  <Phone
                    size={14}
                  />

                  Teléfono

                </span>

                <input
                  type="tel"
                  value={
                    configuration.phone ??
                    ""
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                  }
                />

              </label>

            </div>

          </section>


          <section className="admin-config-card">

            <div className="admin-config-section-title">

              <MapPin
                size={21}
              />


              <div>

                <span className="admin-config-section-kicker">
                  Ubicación pública
                </span>

                <h2>
                  Dirección y mapa
                </h2>

                <p>
                  Datos utilizados para que los
                  visitantes encuentren la feria.
                </p>

              </div>

            </div>


            <div className="admin-config-grid">

              <label className="admin-config-full">

                <span>
                  Dirección
                </span>

                <input
                  type="text"
                  value={
                    configuration.address ??
                    ""
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updateField(
                        "address",
                        event.target.value
                      )
                  }
                />

              </label>


              <label>

                <span>
                  Ciudad
                </span>

                <input
                  type="text"
                  value={
                    configuration.city ??
                    ""
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                  }
                />

              </label>


              <label>

                <span>
                  Estado
                </span>

                <input
                  type="text"
                  value={
                    configuration.state ??
                    ""
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updateField(
                        "state",
                        event.target.value
                      )
                  }
                />

              </label>


              <label>

                <span>
                  País
                </span>

                <input
                  type="text"
                  value={
                    configuration.country ??
                    ""
                  }
                  onChange={
                    (
                      event
                    ) =>
                      updateField(
                        "country",
                        event.target.value
                      )
                  }
                />

              </label>


              <label>

                <span>
                  Enlace Google Maps
                </span>

                <input
                  type="url"
                  value={
                    configuration.mapsUrl ??
                    ""
                  }
                  placeholder="https://maps.app.goo.gl/..."
                  onChange={
                    (
                      event
                    ) =>
                      updateField(
                        "mapsUrl",
                        event.target.value
                      )
                  }
                />

              </label>

            </div>


            <div className="admin-config-coordinates">

              <div>

                <strong>
                  Coordenadas
                </strong>

                <span>
                  Información técnica opcional para
                  ubicar el punto exacto en el mapa.
                </span>

              </div>


              <div className="admin-config-coordinate-grid">

                <label>

                  <span>
                    Latitud
                  </span>

                  <input
                    type="number"
                    step="any"
                    value={
                      configuration.latitude ??
                      ""
                    }
                    placeholder="18.8945"
                    onChange={
                      (
                        event
                      ) =>
                        updateField(
                          "latitude",
                          event.target.value === ""
                            ? null
                            : Number(
                                event.target.value
                              )
                        )
                    }
                  />

                </label>


                <label>

                  <span>
                    Longitud
                  </span>

                  <input
                    type="number"
                    step="any"
                    value={
                      configuration.longitude ??
                      ""
                    }
                    placeholder="-96.9342"
                    onChange={
                      (
                        event
                      ) =>
                        updateField(
                          "longitude",
                          event.target.value === ""
                            ? null
                            : Number(
                                event.target.value
                              )
                        )
                    }
                  />

                </label>

              </div>

            </div>


            {generalMessage && (

              <div
                className={
                  `admin-config-message ${generalMessage.type}`
                }
              >
                {generalMessage.type === "success" && (

                  <Check
                    size={18}
                  />

                )}

                {generalMessage.text}
              </div>

            )}


            <div className="admin-config-card-actions">

              <button
                type="button"
                className="admin-config-save"
                disabled={
                  generalSaving
                }
                onClick={
                  () =>
                    void handleSaveGeneral()
                }
              >
                <Save
                  size={17}
                />

                {generalSaving
                  ? "Guardando..."
                  : "Guardar información"}

              </button>

            </div>

          </section>


          <section className="admin-config-card admin-config-hours-card">

            <div className="admin-config-section-title">

              <Clock3
                size={21}
              />


              <div>

                <span className="admin-config-section-kicker">
                  Operación semanal
                </span>

                <h2>
                  Horarios
                </h2>

                <p>
                  Define los días y horarios en los
                  que opera la feria.
                </p>

              </div>

            </div>


            <div className="admin-hours-editor">

              {[...configuration.hours]
                .sort(
                  (
                    a,
                    b
                  ) =>
                    a.dayOfWeek -
                    b.dayOfWeek
                )
                .map(
                  (
                    hour
                  ) => (

                    <div
                      className={
                        `admin-hour-row ${
                          hour.isClosed
                            ? "closed"
                            : "open"
                        }`
                      }
                      key={
                        hour.dayOfWeek
                      }
                    >

                      <div className="admin-hour-day">

                        <strong>
                          {
                            DAY_NAMES[
                              hour.dayOfWeek
                            ]
                          }
                        </strong>

                        <span
                          className={
                            hour.isClosed
                              ? "admin-hour-status closed"
                              : "admin-hour-status open"
                          }
                        >
                          {hour.isClosed
                            ? "Cerrado"
                            : "Abierto"}
                        </span>

                      </div>


                      <div className="admin-hour-fields">

                        {hour.isClosed ? (

                          <span className="admin-hour-closed-copy">
                            No opera este día
                          </span>

                        ) : (

                          <>

                            <label>

                              <span>
                                Apertura
                              </span>

                              <input
                                type="time"
                                value={
                                  hour.opensAt ??
                                  ""
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    updateHour(
                                      hour.dayOfWeek,
                                      "opensAt",
                                      event.target.value
                                    )
                                }
                              />

                            </label>


                            <span className="admin-hour-separator">
                              —
                            </span>


                            <label>

                              <span>
                                Cierre
                              </span>

                              <input
                                type="time"
                                value={
                                  hour.closesAt ??
                                  ""
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    updateHour(
                                      hour.dayOfWeek,
                                      "closesAt",
                                      event.target.value
                                    )
                                }
                              />

                            </label>

                          </>

                        )}

                      </div>


                      <button
                        type="button"
                        className={
                          hour.isClosed
                            ? "admin-day-toggle closed"
                            : "admin-day-toggle open"
                        }
                        onClick={
                          () =>
                            updateHour(
                              hour.dayOfWeek,
                              "isClosed",
                              !hour.isClosed
                            )
                        }
                      >
                        <span className="admin-day-toggle-track">

                          <span className="admin-day-toggle-thumb" />

                        </span>

                        {hour.isClosed
                          ? "Marcar abierto"
                          : "Marcar cerrado"}

                      </button>

                    </div>

                  )
                )}

            </div>


            {hoursMessage && (

              <div
                className={
                  `admin-config-message ${hoursMessage.type}`
                }
              >
                {hoursMessage.type === "success" && (

                  <Check
                    size={18}
                  />

                )}

                {hoursMessage.text}
              </div>

            )}


            <div className="admin-config-card-actions">

              <button
                type="button"
                className="admin-config-save"
                disabled={
                  hoursSaving
                }
                onClick={
                  () =>
                    void handleSaveHours()
                }
              >
                <Save
                  size={17}
                />

                {hoursSaving
                  ? "Guardando..."
                  : "Guardar horarios"}

              </button>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}
