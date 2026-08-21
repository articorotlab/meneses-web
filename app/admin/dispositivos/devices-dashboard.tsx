"use client";


import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  CircleOff,
  Clock3,
  KeyRound,
  Laptop2,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wifi,
  X,
} from "lucide-react";


type DeviceStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED";


type CurrentMode =
  | "IDLE"
  | "ADMIN"
  | "GAME"
  | "RECHARGE";


type ConnectionStatus =
  | "ONLINE"
  | "IDLE"
  | "OFFLINE"
  | "NEVER";


type PendingProvisioning = {
  id: string;

  expiresAt:
    string;
};


type Device = {
  deviceId:
    string;

  code:
    string;

  name:
    string;

  legacyMode:
    string;

  currentMode:
    CurrentMode;

  status:
    DeviceStatus;

  provisioned:
    boolean;

  provisionedAt:
    string | null;

  lastSeenAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;

  pendingProvisioning:
    PendingProvisioning | null;
};


type DevicesResponse = {
  devices?: Device[];

  error?: string;

  message?: string;
};


type ProvisioningResult = {
  created:
    boolean;

  device: {
    deviceId:
      string;

    code:
      string;

    name:
      string;
  };

  provisioning: {
    id:
      string;

    code:
      string;

    expiresAt:
      string;
  };
};


type Props = {
  userName:
    string;
};


function getStatusLabel(
  status: DeviceStatus
) {

  switch (
    status
  ) {

    case "ACTIVE":
      return "Activo";

    case "INACTIVE":
      return "Inactivo";

    case "BLOCKED":
      return "Bloqueado";
  }
}


function getModeLabel(
  mode: CurrentMode
) {

  switch (
    mode
  ) {

    case "ADMIN":
      return "Administrador";

    case "GAME":
      return "Juego";

    case "RECHARGE":
      return "Taquilla";

    case "IDLE":
      return "Sin operación";
  }
}


function formatDateTime(
  value: string | null
) {

  if (!value) {
    return "Sin conexión registrada";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;
  }


  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    date
  );
}


const ONLINE_THRESHOLD_MS =
  90 * 1000;


const IDLE_THRESHOLD_MS =
  10 * 60 * 1000;


function getConnectionStatus(
  lastSeenAt: string | null,
  nowMs: number
): ConnectionStatus {

  if (!lastSeenAt) {
    return "NEVER";
  }


  const lastSeenMs =
    new Date(
      lastSeenAt
    ).getTime();


  if (
    Number.isNaN(
      lastSeenMs
    )
  ) {

    return "NEVER";
  }


  const elapsed =
    Math.max(
      0,
      nowMs - lastSeenMs
    );


  if (
    elapsed <=
    ONLINE_THRESHOLD_MS
  ) {

    return "ONLINE";
  }


  if (
    elapsed <=
    IDLE_THRESHOLD_MS
  ) {

    return "IDLE";
  }


  return "OFFLINE";
}


function getConnectionLabel(
  status: ConnectionStatus
) {

  switch (
    status
  ) {

    case "ONLINE":
      return "En línea";

    case "IDLE":
      return "Sin actividad";

    case "OFFLINE":
      return "Desconectado";

    case "NEVER":
      return "Nunca conectado";
  }
}


function formatRelativeLastSeen(
  value: string | null,
  nowMs: number
) {

  if (!value) {
    return "Nunca";
  }


  const date =
    new Date(
      value
    );


  const lastSeenMs =
    date.getTime();


  if (
    Number.isNaN(
      lastSeenMs
    )
  ) {

    return value;
  }


  const elapsedSeconds =
    Math.max(
      0,
      Math.floor(
        (
          nowMs -
          lastSeenMs
        ) / 1000
      )
    );


  if (
    elapsedSeconds <
    10
  ) {

    return "Hace unos segundos";
  }


  if (
    elapsedSeconds <
    60
  ) {

    return `Hace ${elapsedSeconds} segundos`;
  }


  const elapsedMinutes =
    Math.floor(
      elapsedSeconds / 60
    );


  if (
    elapsedMinutes ===
    1
  ) {

    return "Hace 1 minuto";
  }


  if (
    elapsedMinutes <
    60
  ) {

    return `Hace ${elapsedMinutes} minutos`;
  }


  const elapsedHours =
    Math.floor(
      elapsedMinutes / 60
    );


  if (
    elapsedHours ===
    1
  ) {

    return "Hace 1 hora";
  }


  if (
    elapsedHours <
    24
  ) {

    return `Hace ${elapsedHours} horas`;
  }


  return formatDateTime(
    value
  );
}


export default function DevicesDashboard({
  userName,
}: Props) {

  const [
    devices,
    setDevices,
  ] =
    useState<Device[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false
    );


  const [
    nowMs,
    setNowMs,
  ] =
    useState(
      () =>
        Date.now()
    );


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  const [
    showCreate,
    setShowCreate,
  ] =
    useState(
      false
    );


  const [
    newName,
    setNewName,
  ] =
    useState(
      ""
    );


  const [
    creating,
    setCreating,
  ] =
    useState(
      false
    );


  const [
    busyDeviceId,
    setBusyDeviceId,
  ] =
    useState<string | null>(
      null
    );


  const [
    provisioningResult,
    setProvisioningResult,
  ] =
    useState<ProvisioningResult | null>(
      null
    );


  /*
   * =======================================================
   * LOAD
   * =======================================================
   */

  const loadDevices =
    useCallback(
      async (
        silent = false
      ) => {

        if (silent) {

          setRefreshing(
            true
          );

        } else {

          setLoading(
            true
          );
        }


        setError(
          null
        );


        try {

          const response =
            await fetch(
              "/api/admin/devices",
              {
                cache:
                  "no-store",
              }
            );


          const data =
            (
              await response.json()
            ) as DevicesResponse;


          if (
            !response.ok
          ) {

            throw new Error(
              data.message ??
              data.error ??
              "No fue posible consultar los dispositivos."
            );
          }


          setDevices(
            data.devices ??
            []
          );


        } catch (
          loadError
        ) {

          setError(
            loadError instanceof Error
              ? loadError.message
              : "No fue posible consultar los dispositivos."
          );


        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );


  useEffect(
    () => {

      void loadDevices();

    },
    [
      loadDevices,
    ]
  );


  /*
   * =======================================================
   * LIVE CONNECTION STATUS
   * =======================================================
   *
   * - El reloj local actualiza los textos relativos.
   * - La lista se vuelve a consultar cada 30 segundos para
   *   recibir el heartbeat más reciente de cada Ulefone.
   * =======================================================
   */

  useEffect(
    () => {

      const clockInterval =
        window.setInterval(
          () => {

            setNowMs(
              Date.now()
            );

          },
          10_000
        );


      const refreshInterval =
        window.setInterval(
          () => {

            void loadDevices(
              true
            );

          },
          30_000
        );


      return () => {

        window.clearInterval(
          clockInterval
        );

        window.clearInterval(
          refreshInterval
        );
      };

    },
    [
      loadDevices,
    ]
  );


  /*
   * =======================================================
   * CREATE
   * =======================================================
   */

  async function createDevice() {

    const name =
      newName.trim();


    if (
      name.length < 3
    ) {

      setError(
        "Escribe un nombre de al menos 3 caracteres."
      );

      return;
    }


    setCreating(
      true
    );

    setError(
      null
    );


    try {

      const response =
        await fetch(
          "/api/admin/devices",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name,
              }),
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ??
          data.error ??
          "No fue posible registrar el dispositivo."
        );
      }


      setNewName(
        ""
      );

      setShowCreate(
        false
      );


      await loadDevices(
        true
      );


    } catch (
      createError
    ) {

      setError(
        createError instanceof Error
          ? createError.message
          : "No fue posible registrar el dispositivo."
      );


    } finally {

      setCreating(
        false
      );
    }
  }


  /*
   * =======================================================
   * STATUS
   * =======================================================
   */

  async function updateStatus(
    device: Device,
    status: DeviceStatus
  ) {

    const action =
      status === "BLOCKED"
        ? "bloquear"
        : status === "INACTIVE"
          ? "desactivar"
          : "reactivar";


    const confirmed =
      window.confirm(
        `¿Deseas ${action} ${device.code}?`
      );


    if (
      !confirmed
    ) {

      return;
    }


    setBusyDeviceId(
      device.deviceId
    );

    setError(
      null
    );


    try {

      const response =
        await fetch(
          `/api/admin/devices/${device.deviceId}/status`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status,
              }),
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ??
          data.error ??
          "No fue posible cambiar el estado."
        );
      }


      await loadDevices(
        true
      );


    } catch (
      statusError
    ) {

      setError(
        statusError instanceof Error
          ? statusError.message
          : "No fue posible cambiar el estado."
      );


    } finally {

      setBusyDeviceId(
        null
      );
    }
  }


  /*
   * =======================================================
   * GENERATE CODE
   * =======================================================
   */

  async function generateProvisioningCode(
    device: Device
  ) {

    setBusyDeviceId(
      device.deviceId
    );

    setError(
      null
    );


    try {

      const response =
        await fetch(
          `/api/admin/devices/${device.deviceId}/provisioning-code`,
          {
            method:
              "POST",
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ??
          data.error ??
          "No fue posible generar el código."
        );
      }


      setProvisioningResult(
        data as ProvisioningResult
      );


      await loadDevices(
        true
      );


    } catch (
      generationError
    ) {

      setError(
        generationError instanceof Error
          ? generationError.message
          : "No fue posible generar el código."
      );


    } finally {

      setBusyDeviceId(
        null
      );
    }
  }


  /*
   * =======================================================
   * REVOKE CODE
   * =======================================================
   */

  async function revokeProvisioningCode(
    device: Device
  ) {

    const confirmed =
      window.confirm(
        `¿Deseas revocar el código pendiente de ${device.code}?`
      );


    if (
      !confirmed
    ) {

      return;
    }


    setBusyDeviceId(
      device.deviceId
    );

    setError(
      null
    );


    try {

      const response =
        await fetch(
          `/api/admin/devices/${device.deviceId}/provisioning-code`,
          {
            method:
              "DELETE",
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ??
          data.error ??
          "No fue posible revocar el código."
        );
      }


      await loadDevices(
        true
      );


    } catch (
      revokeError
    ) {

      setError(
        revokeError instanceof Error
          ? revokeError.message
          : "No fue posible revocar el código."
      );


    } finally {

      setBusyDeviceId(
        null
      );
    }
  }


  /*
   * =======================================================
   * UI
   * =======================================================
   */

  return (
    <main className="devices-page">

      <header className="devices-header">

        <div className="devices-shell devices-header-inner">

          <div>

            <a
              href="/admin"
              className="devices-back"
            >
              <ArrowLeft
                size={17}
              />

              Panel administrativo
            </a>


            <span className="devices-user">
              {userName}
            </span>

          </div>


          <button
            type="button"
            className="devices-refresh"
            disabled={
              refreshing
            }
            onClick={
              () =>
                void loadDevices(
                  true
                )
            }
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "devices-spin"
                  : ""
              }
            />

            Actualizar
          </button>

        </div>

      </header>


      <section className="devices-shell devices-content">

        <div className="devices-title-row">

          <div>

            <span className="devices-kicker">
              Administración
            </span>

            <h1>
              Dispositivos
            </h1>

            <p>
              Registra y supervisa los Ulefone
              utilizados para juegos, taquillas
              y administración de la feria.
            </p>

          </div>


          <button
            type="button"
            className="devices-primary-button"
            onClick={
              () =>
                setShowCreate(
                  true
                )
            }
          >
            <Plus
              size={18}
            />

            Registrar Ulefone
          </button>

        </div>


        <div className="devices-summary">

          <div>

            <Smartphone
              size={20}
            />

            <span>
              Total
            </span>

            <strong>
              {devices.length}
            </strong>

          </div>


          <div>

            <CheckCircle2
              size={20}
            />

            <span>
              Activos
            </span>

            <strong>
              {
                devices.filter(
                  (device) =>
                    device.status ===
                    "ACTIVE"
                ).length
              }
            </strong>

          </div>


          <div>

            <Wifi
              size={20}
            />

            <span>
              En línea
            </span>

            <strong>
              {
                devices.filter(
                  (device) =>
                    getConnectionStatus(
                      device.lastSeenAt,
                      nowMs
                    ) === "ONLINE"
                ).length
              }
            </strong>

          </div>


          <div>

            <ShieldCheck
              size={20}
            />

            <span>
              Provisionados
            </span>

            <strong>
              {
                devices.filter(
                  (device) =>
                    device.provisioned
                ).length
              }
            </strong>

          </div>


          <div>

            <Clock3
              size={20}
            />

            <span>
              Pendientes
            </span>

            <strong>
              {
                devices.filter(
                  (device) =>
                    !device.provisioned
                ).length
              }
            </strong>

          </div>

        </div>


        {error && (

          <div className="devices-error">
            {error}
          </div>
        )}


        {loading ? (

          <div className="devices-loading">

            <Loader2
              size={28}
              className="devices-spin"
            />

            Cargando dispositivos...

          </div>

        ) : (

          <div className="devices-grid">

            {devices.map(
              (device) => {

                const busy =
                  busyDeviceId ===
                  device.deviceId;


                const legacy =
                  device.code.startsWith(
                    "ULEFONE-DEV-"
                  );


                const connectionStatus =
                  getConnectionStatus(
                    device.lastSeenAt,
                    nowMs
                  );


                return (

                  <article
                    className="device-card"
                    key={
                      device.deviceId
                    }
                  >

                    <div className="device-card-top">

                      <div className="device-icon">

                        <Smartphone
                          size={26}
                        />

                      </div>


                      <div className="device-identity">

                        <div className="device-code-row">

                          <strong>
                            {device.code}
                          </strong>


                          <span
                            className={
                              `device-status ` +
                              `device-status-${device.status.toLowerCase()}`
                            }
                          >
                            {getStatusLabel(
                              device.status
                            )}
                          </span>

                        </div>


                        <h2>
                          {device.name}
                        </h2>

                      </div>

                    </div>


                    <div className="device-badges">

                      {legacy && (

                        <span className="device-badge legacy">
                          Legacy
                        </span>

                      )}


                      <span
                        className={
                          device.provisioned
                            ? "device-badge provisioned"
                            : "device-badge pending"
                        }
                      >

                        {device.provisioned
                          ? "Provisionado"
                          : "Pendiente de activación"}

                      </span>


                      <span className="device-badge mode">

                        <Wifi
                          size={12}
                        />

                        {getModeLabel(
                          device.currentMode
                        )}

                      </span>


                      <span
                        className={
                          `device-badge connection ` +
                          `connection-${connectionStatus.toLowerCase()}`
                        }
                      >
                        <span
                          className="connection-dot"
                          aria-hidden="true"
                        />

                        {getConnectionLabel(
                          connectionStatus
                        )}
                      </span>

                    </div>


                    <div className="device-details">

                      <div>

                        <span>
                          Última conexión
                        </span>

                        <strong>
                          {formatRelativeLastSeen(
                            device.lastSeenAt,
                            nowMs
                          )}
                        </strong>

                        {device.lastSeenAt && (

                          <small className="device-detail-secondary">
                            {formatDateTime(
                              device.lastSeenAt
                            )}
                          </small>

                        )}

                      </div>


                      <div>

                        <span>
                          Provisionado
                        </span>

                        <strong>
                          {device.provisionedAt
                            ? formatDateTime(
                                device.provisionedAt
                              )
                            : "No"}
                        </strong>

                      </div>

                    </div>


                    {device.pendingProvisioning && (

                      <div className="device-pending-code">

                        <KeyRound
                          size={17}
                        />

                        <div>

                          <strong>
                            Código de activación pendiente
                          </strong>

                          <span>
                            Expira:{" "}
                            {formatDateTime(
                              device
                                .pendingProvisioning
                                .expiresAt
                            )}
                          </span>

                        </div>

                      </div>

                    )}


                    <div className="device-actions">

                      {!device.provisioned &&
                        !legacy &&
                        !device.pendingProvisioning && (

                          <button
                            type="button"
                            className="device-action primary"
                            disabled={
                              busy
                            }
                            onClick={
                              () =>
                                void generateProvisioningCode(
                                  device
                                )
                            }
                          >
                            {busy ? (
                              <Loader2
                                size={15}
                                className="devices-spin"
                              />
                            ) : (
                              <KeyRound
                                size={15}
                              />
                            )}

                            Generar código
                          </button>

                        )}


                      {!device.provisioned &&
                        !legacy &&
                        device.pendingProvisioning && (

                          <button
                            type="button"
                            className="device-action secondary"
                            disabled={
                              busy
                            }
                            onClick={
                              () =>
                                void revokeProvisioningCode(
                                  device
                                )
                            }
                          >
                            <X
                              size={15}
                            />

                            Revocar código
                          </button>

                        )}


                      {device.provisioned &&
                        device.status ===
                          "ACTIVE" && (

                          <button
                            type="button"
                            className="device-action danger"
                            disabled={
                              busy
                            }
                            onClick={
                              () =>
                                void updateStatus(
                                  device,
                                  "BLOCKED"
                                )
                            }
                          >
                            <Ban
                              size={15}
                            />

                            Bloquear
                          </button>

                        )}


                      {device.provisioned &&
                        (
                          device.status ===
                            "BLOCKED" ||
                          device.status ===
                            "INACTIVE"
                        ) && (

                          <button
                            type="button"
                            className="device-action primary"
                            disabled={
                              busy
                            }
                            onClick={
                              () =>
                                void updateStatus(
                                  device,
                                  "ACTIVE"
                                )
                            }
                          >
                            <CheckCircle2
                              size={15}
                            />

                            Reactivar
                          </button>

                        )}


                      {!device.provisioned &&
                        !legacy && (

                          <span className="device-awaiting">

                            <CircleOff
                              size={14}
                            />

                            Esperando activación

                          </span>

                        )}

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>


      {/* ===================================================
          CREATE MODAL
          =================================================== */}

      {showCreate && (

        <div className="devices-modal-backdrop">

          <div className="devices-modal">

            <button
              type="button"
              className="devices-modal-close"
              onClick={
                () =>
                  setShowCreate(
                    false
                  )
              }
            >
              <X
                size={20}
              />
            </button>


            <div className="devices-modal-icon">

              <Laptop2
                size={27}
              />

            </div>


            <span className="devices-kicker">
              Nuevo dispositivo
            </span>


            <h2>
              Registrar Ulefone
            </h2>


            <p>
              El sistema asignará automáticamente
              el siguiente código disponible.
            </p>


            <label className="devices-field">

              <span>
                Nombre del dispositivo
              </span>

              <input
                type="text"
                value={
                  newName
                }
                placeholder="Ej. Ulefone Taquilla Norte"
                maxLength={
                  100
                }
                autoFocus
                onChange={
                  (
                    event
                  ) =>
                    setNewName(
                      event.target.value
                    )
                }
                onKeyDown={
                  (
                    event
                  ) => {

                    if (
                      event.key ===
                      "Enter"
                    ) {

                      void createDevice();
                    }
                  }
                }
              />

            </label>


            <button
              type="button"
              className="devices-primary-button devices-modal-submit"
              disabled={
                creating
              }
              onClick={
                () =>
                  void createDevice()
              }
            >
              {creating ? (

                <Loader2
                  size={17}
                  className="devices-spin"
                />

              ) : (

                <Plus
                  size={17}
                />
              )}

              {creating
                ? "Registrando..."
                : "Registrar dispositivo"}

            </button>

          </div>

        </div>
      )}


      {/* ===================================================
          PROVISIONING CODE MODAL
          =================================================== */}

      {provisioningResult && (

        <div className="devices-modal-backdrop">

          <div className="devices-modal provisioning-modal">

            <button
              type="button"
              className="devices-modal-close"
              onClick={
                () =>
                  setProvisioningResult(
                    null
                  )
              }
            >
              <X
                size={20}
              />
            </button>


            <div className="devices-modal-icon success">

              <KeyRound
                size={27}
              />

            </div>


            <span className="devices-kicker">
              Código generado
            </span>


            <h2>
              {
                provisioningResult
                  .device
                  .code
              }
            </h2>


            <p>
              Introduce este código en el
              Ulefone que deseas activar.
            </p>


            <div className="provisioning-code">

              {
                provisioningResult
                  .provisioning
                  .code
              }

            </div>


            <div className="provisioning-expiration">

              <Clock3
                size={16}
              />

              Expira{" "}
              {
                formatDateTime(
                  provisioningResult
                    .provisioning
                    .expiresAt
                )
              }

            </div>


            <p className="provisioning-warning">
              El código sólo puede utilizarse
              una vez y deja de ser válido
              después de la activación.
            </p>


            <button
              type="button"
              className="devices-primary-button devices-modal-submit"
              onClick={
                () =>
                  setProvisioningResult(
                    null
                  )
              }
            >
              Entendido
            </button>

          </div>

        </div>
      )}

    </main>
  );
}