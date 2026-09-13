"use client";


import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Clock3,
  Gamepad2,
  Gift,
  LoaderCircle,
  MonitorSmartphone,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Ticket,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


/* =========================================================
   TYPES
   ========================================================= */


type ReportSummary = {
  /* Compatibilidad mantenida por backend. */
  rechargePointAmount: number;
  rechargePointRechargeAmount: number;
  rechargePointActivationAmount: number;
  gameConsumptionAmount: number;
  gamePeopleCount: number;

  rechargePoints: {
    cashReceived: number;
    promotionalGiven: number;
    creditedAmount: number;
    activationAmount: number;
    totalIncomeAmount: number;
  };

  games: {
    consumptionAmount: number;
    cashConsumed: number;
    promotionalConsumed: number;
    adminCreditConsumed: number;
    legacyConsumed: number;
    unclassifiedConsumed: number;
    peopleCount: number;
  };

  admin: {
    rechargeAmount: number;
    adjustmentAmount: number;
  };

  cards: {
    rechargeActivationsCount: number;
    adminActivationsCount: number;
    returnsCount: number;
    rechargeOriginReturnsCount: number;
    adminOriginReturnsCount: number;
  };

  cardReturns: {
    refundAmount: number;
    discardedCash: number;
    discardedPromotional: number;
    discardedAdminCredit: number;
    discardedLegacy: number;
    discardedTotal: number;
    returnsCount: number;
    rechargeOriginReturnsCount: number;
    adminOriginReturnsCount: number;
  };
};


type SummaryResponse = {
  from: string;
  to: string;
  timezone: string;
  summary: ReportSummary;
};


type GameDailyBreakdown = {
  date: string;
  consumptionAmount: number;
  peopleCount: number;
};


type ReportGame = {
  gameId: string;
  name: string;
  currentPrice: number;
  consumptionAmount: number;
  peopleCount: number;
  dailyBreakdown: GameDailyBreakdown[];
};


type GamesResponse = {
  from: string;
  to: string;
  timezone: string;
  games: ReportGame[];
};


type RechargeDailyBreakdown = {
  date: string;
  cashReceived: number;
  cardReceived: number;
  cashRechargeAmount: number;
  cardRechargeAmount: number;
  promotionalGiven: number;
  creditedAmount: number;
  rechargedAmount: number;
  activationAmount: number;
  totalIncomeAmount: number;
  cardRefundAmount: number;
  discardedCash: number;
  discardedPromotional: number;
  discardedAdminCredit: number;
  discardedLegacy: number;
  discardedTotal: number;
  activationsCount: number;
  returnsCount: number;
  rechargeOriginReturnsCount: number;
  adminOriginReturnsCount: number;
};


type ReportRechargePoint = {
  rechargePointId: string;
  name: string;
  cashReceived: number;
  cardReceived: number;
  cashRechargeAmount: number;
  cardRechargeAmount: number;
  promotionalGiven: number;
  creditedAmount: number;
  rechargedAmount: number;
  activationAmount: number;
  totalIncomeAmount: number;
  cardRefundAmount: number;
  discardedCash: number;
  discardedPromotional: number;
  discardedAdminCredit: number;
  discardedLegacy: number;
  discardedTotal: number;
  activationsCount: number;
  returnsCount: number;
  rechargeOriginReturnsCount: number;
  adminOriginReturnsCount: number;
  dailyBreakdown: RechargeDailyBreakdown[];
};


type RechargePointsResponse = {
  from: string;
  to: string;
  timezone: string;
  rechargePoints: ReportRechargePoint[];
};


type ReportDevice = {
  deviceId: string;
  code: string;
  name: string;
  status: string;
  sessionSeconds: number;
};


type DevicesResponse = {
  from: string;
  to: string;
  timezone: string;
  devices: ReportDevice[];
};


type DeviceSession = {
  sessionId: string;

  mode:
    | "GAME"
    | "RECHARGE"
    | "ADMIN";

  status: string;

  startedAt: string;
  endedAt: string | null;

  visibleStartedAt: string;
  visibleEndedAt: string;

  durationSeconds: number;

  game:
    | {
        gameId: string;
        name: string;
      }
    | null;

  rechargePoint:
    | {
        rechargePointId: string;
        name: string;
      }
    | null;

  admin:
    | {
        cardId: number | null;
      }
    | null;

  metrics: {
    gameConsumptionAmount: number;
    gamePeopleCount: number;
    rechargeAmount: number;
    adminRechargeAmount: number;
    adminAdjustmentAmount: number;
  };
};


type DeviceHistoryResponse = {
  from: string;
  to: string;
  timezone: string;

  device: {
    deviceId: string;
    code: string;
    name: string;
    status: string;
  };

  sessions: DeviceSession[];
};


type RangePreset =
  | "TODAY"
  | "7_DAYS"
  | "30_DAYS"
  | "CUSTOM";


type ReportsDashboardProps = {
  userName: string;
  initialDate: string;
};


/* =========================================================
   CONSTANTS
   ========================================================= */


const LINE_COLORS = [
  "#123a8c",
  "#e31b23",
  "#f5b51b",
  "#7444bd",
  "#14966f",
  "#e56b17",
  "#2b8fa3",
  "#ba3b72",
  "#6574cd",
  "#477a37",
];


const SHORT_MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];


/* =========================================================
   DATE HELPERS
   ========================================================= */


function parseLocalDate(
  value: string
) {

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);


  return new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
    0
  );
}


function formatDateInput(
  date: Date
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}-` +
    `${month}-` +
    `${day}`
  );
}


function subtractDays(
  value: string,
  days: number
) {

  const date =
    parseLocalDate(
      value
    );


  date.setDate(
    date.getDate() -
    days
  );


  return formatDateInput(
    date
  );
}


function formatDisplayDate(
  value: string
) {

  const date =
    parseLocalDate(
      value
    );


  return (
    `${String(
      date.getDate()
    ).padStart(
      2,
      "0"
    )} ` +
    `${SHORT_MONTHS[
      date.getMonth()
    ]} ` +
    `${date.getFullYear()}`
  );
}


function formatChartDate(
  value: string
) {

  const date =
    parseLocalDate(
      value
    );


  return (
    `${date.getDate()} ` +
    `${SHORT_MONTHS[
      date.getMonth()
    ]}`
  );
}


function getDatesBetween(
  from: string,
  to: string
) {

  const dates:
    string[] = [];


  const current =
    parseLocalDate(
      from
    );


  const last =
    parseLocalDate(
      to
    );


  while (
    current <= last
  ) {

    dates.push(
      formatDateInput(
        current
      )
    );


    current.setDate(
      current.getDate() +
      1
    );
  }


  return dates;
}


/* =========================================================
   FORMATTERS
   ========================================================= */


function formatMoney(
  value: number
) {

  return new Intl
    .NumberFormat(
      "es-MX",
      {
        style:
          "currency",

        currency:
          "MXN",

        maximumFractionDigits:
          0,
      }
    )
    .format(
      value
    );
}


function formatDuration(
  seconds: number
) {

  const totalMinutes =
    Math.floor(
      seconds /
      60
    );


  const hours =
    Math.floor(
      totalMinutes /
      60
    );


  const minutes =
    totalMinutes %
    60;


  if (
    hours === 0
  ) {

    if (
      minutes === 0
    ) {

      return `${seconds} s`;
    }


    return `${minutes} min`;
  }


  if (
    minutes === 0
  ) {

    return `${hours} h`;
  }


  return (
    `${hours} h ` +
    `${minutes} min`
  );
}


function formatDateTime(
  value: string
) {

  return new Intl
    .DateTimeFormat(
      "es-MX",
      {
        timeZone:
          "America/Mexico_City",

        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          true,
      }
    )
    .format(
      new Date(
        value
      )
    );
}


/* =========================================================
   CHART DATA
   ========================================================= */


function buildGamesChartData(
  games: ReportGame[],
  from: string,
  to: string
) {

  const dates =
    getDatesBetween(
      from,
      to
    );


  return dates.map(
    (
      date
    ) => {

      const item:
        Record<
          string,
          string | number
        > = {

        date,

        label:
          formatChartDate(
            date
          ),
      };


      for (
        const game of games
      ) {

        const day =
          game.dailyBreakdown
            .find(
              (
                breakdown
              ) =>
                breakdown.date ===
                date
            );


        item[
          game.gameId
        ] =
          day
            ?.consumptionAmount ??
          0;
      }


      return item;
    }
  );
}


function buildRechargeChartData(
  rechargePoints:
    ReportRechargePoint[],
  from: string,
  to: string
) {

  const dates =
    getDatesBetween(
      from,
      to
    );


  return dates.map(
    (
      date
    ) => {

      const item:
        Record<
          string,
          string | number
        > = {

        date,

        label:
          formatChartDate(
            date
          ),
      };


      for (
        const point
        of rechargePoints
      ) {

        const day =
          point.dailyBreakdown
            .find(
              (
                breakdown
              ) =>
                breakdown.date ===
                date
            );


        item[
          point.rechargePointId
        ] =
          day
            ?.totalIncomeAmount ??
          0;
      }


      return item;
    }
  );
}


/* =========================================================
   MAIN COMPONENT
   ========================================================= */


export default function ReportsDashboard({
  userName,
  initialDate,
}: ReportsDashboardProps) {

  const searchParams =
    useSearchParams();

  const [
    preset,
    setPreset,
  ] =
    useState<RangePreset>(
      "TODAY"
    );


  const [
    from,
    setFrom,
  ] =
    useState(
      initialDate
    );


  const [
    to,
    setTo,
  ] =
    useState(
      initialDate
    );


  const [
    appliedFrom,
    setAppliedFrom,
  ] =
    useState(
      initialDate
    );


  const [
    appliedTo,
    setAppliedTo,
  ] =
    useState(
      initialDate
    );


  const [
    summary,
    setSummary,
  ] =
    useState<
      ReportSummary |
      null
    >(
      null
    );


  const [
    games,
    setGames,
  ] =
    useState<
      ReportGame[]
    >(
      []
    );


  const [
    rechargePoints,
    setRechargePoints,
  ] =
    useState<
      ReportRechargePoint[]
    >(
      []
    );


  const [
    devices,
    setDevices,
  ] =
    useState<
      ReportDevice[]
    >(
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
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(
      null
    );


  const [
    selectedDevice,
    setSelectedDevice,
  ] =
    useState<
      DeviceHistoryResponse |
      null
    >(
      null
    );


  const [
    historyLoading,
    setHistoryLoading,
  ] =
    useState(
      false
    );


  /* =======================================================
     LOAD REPORTS
     ======================================================= */


  const loadReports =
    useCallback(
      async (
        rangeFrom: string,
        rangeTo: string
      ) => {

        setLoading(
          true
        );

        setError(
          null
        );


        try {

          const query =
            new URLSearchParams({
              from:
                rangeFrom,

              to:
                rangeTo,
            })
              .toString();


          const [
            summaryResponse,
            gamesResponse,
            rechargeResponse,
            devicesResponse,
          ] =
            await Promise.all([
              fetch(
                `/api/admin/reports/summary?${query}`,
                {
                  cache:
                    "no-store",
                }
              ),

              fetch(
                `/api/admin/reports/games?${query}`,
                {
                  cache:
                    "no-store",
                }
              ),

              fetch(
                `/api/admin/reports/recharge-points?${query}`,
                {
                  cache:
                    "no-store",
                }
              ),

              fetch(
                `/api/admin/reports/devices?${query}`,
                {
                  cache:
                    "no-store",
                }
              ),
            ]);


          if (
            summaryResponse.status ===
              401 ||
            gamesResponse.status ===
              401 ||
            rechargeResponse.status ===
              401 ||
            devicesResponse.status ===
              401
          ) {

            window.location.href =
              "/admin/login";

            return;
          }


          if (
            !summaryResponse.ok ||
            !gamesResponse.ok ||
            !rechargeResponse.ok ||
            !devicesResponse.ok
          ) {

            throw new Error(
              "No fue posible consultar los reportes."
            );
          }


          const summaryData =
            (
              await summaryResponse
                .json()
            ) as SummaryResponse;


          const gamesData =
            (
              await gamesResponse
                .json()
            ) as GamesResponse;


          const rechargeData =
            (
              await rechargeResponse
                .json()
            ) as RechargePointsResponse;


          const devicesData =
            (
              await devicesResponse
                .json()
            ) as DevicesResponse;


          setSummary(
            summaryData.summary
          );


          setGames(
            gamesData.games
          );


          setRechargePoints(
            rechargeData
              .rechargePoints
          );


          setDevices(
            devicesData.devices
          );


          setAppliedFrom(
            rangeFrom
          );


          setAppliedTo(
            rangeTo
          );


        } catch (
          loadError
        ) {

          console.error(
            loadError
          );


          setError(
            "No fue posible cargar los reportes. Verifica que el servidor local se encuentre disponible."
          );


        } finally {

          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(
    () => {

      const queryFrom =
        searchParams.get(
          "from"
        );

      const queryTo =
        searchParams.get(
          "to"
        );

      const queryPreset =
        searchParams.get(
          "preset"
        );

      const validDate =
        /^\d{4}-\d{2}-\d{2}$/;

      const nextFrom =
        queryFrom &&
        validDate.test(
          queryFrom
        )
          ? queryFrom
          : initialDate;

      const nextTo =
        queryTo &&
        validDate.test(
          queryTo
        )
          ? queryTo
          : initialDate;

      const nextPreset:
        RangePreset =
        queryPreset ===
          "7_DAYS" ||
        queryPreset ===
          "30_DAYS" ||
        queryPreset ===
          "CUSTOM" ||
        queryPreset ===
          "TODAY"
          ? queryPreset
          : nextFrom ===
              initialDate &&
            nextTo ===
              initialDate
            ? "TODAY"
            : "CUSTOM";

      setPreset(
        nextPreset
      );

      setFrom(
        nextFrom
      );

      setTo(
        nextTo
      );

      void loadReports(
        nextFrom,
        nextTo
      );

    },
    [
      initialDate,
      loadReports,
      searchParams,
    ]
  );


  /* =======================================================
     RANGE PRESETS
     ======================================================= */


  function selectPreset(
    nextPreset:
      RangePreset
  ) {

    setPreset(
      nextPreset
    );


    if (
      nextPreset ===
      "TODAY"
    ) {

      setFrom(
        initialDate
      );

      setTo(
        initialDate
      );


      void loadReports(
        initialDate,
        initialDate
      );

      return;
    }


    if (
      nextPreset ===
      "7_DAYS"
    ) {

      const nextFrom =
        subtractDays(
          initialDate,
          6
        );


      setFrom(
        nextFrom
      );

      setTo(
        initialDate
      );


      void loadReports(
        nextFrom,
        initialDate
      );

      return;
    }


    if (
      nextPreset ===
      "30_DAYS"
    ) {

      const nextFrom =
        subtractDays(
          initialDate,
          29
        );


      setFrom(
        nextFrom
      );

      setTo(
        initialDate
      );


      void loadReports(
        nextFrom,
        initialDate
      );
    }
  }


  function applyCustomRange() {

    if (
      !from ||
      !to
    ) {

      setError(
        "Selecciona una fecha inicial y una fecha final."
      );

      return;
    }


    if (
      from >
      to
    ) {

      setError(
        "La fecha inicial no puede ser posterior a la fecha final."
      );

      return;
    }


    setPreset(
      "CUSTOM"
    );


    void loadReports(
      from,
      to
    );
  }


  /* =======================================================
     DEVICE HISTORY
     ======================================================= */


  async function openDeviceHistory(
    device:
      ReportDevice
  ) {

    setHistoryLoading(
      true
    );

    setError(
      null
    );


    try {

      const query =
        new URLSearchParams({
          from:
            appliedFrom,

          to:
            appliedTo,
        })
          .toString();


      const response =
        await fetch(
          `/api/admin/reports/devices/${encodeURIComponent(
            device.deviceId
          )}/history?${query}`,
          {
            cache:
              "no-store",
          }
        );


      if (
        response.status ===
        401
      ) {

        window.location.href =
          "/admin/login";

        return;
      }


      if (
        !response.ok
      ) {

        throw new Error(
          "No fue posible consultar el historial."
        );
      }


      const data =
        (
          await response.json()
        ) as DeviceHistoryResponse;


      setSelectedDevice(
        data
      );


    } catch (
      historyError
    ) {

      console.error(
        historyError
      );


      setError(
        "No fue posible consultar el historial del dispositivo."
      );


    } finally {

      setHistoryLoading(
        false
      );
    }
  }


  /* =======================================================
     CHARTS
     ======================================================= */


  const gamesChartData =
    useMemo(
      () =>
        buildGamesChartData(
          games,
          appliedFrom,
          appliedTo
        ),
      [
        games,
        appliedFrom,
        appliedTo,
      ]
    );


  const rechargeChartData =
    useMemo(
      () =>
        buildRechargeChartData(
          rechargePoints,
          appliedFrom,
          appliedTo
        ),
      [
        rechargePoints,
        appliedFrom,
        appliedTo,
      ]
    );


  const rechargePaymentTotals =
    useMemo(
      () =>
        rechargePoints.reduce(
          (
            totals,
            point
          ) => ({
            cash:
              totals.cash +
              point.cashRechargeAmount,

            card:
              totals.card +
              point.cardRechargeAmount,
          }),
          {
            cash: 0,
            card: 0,
          }
        ),
      [
        rechargePoints,
      ]
    );


  /* =======================================================
     RENDER
     ======================================================= */


  return (
    <main className="admin-reports-page">

      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="admin-dashboard-header">

        <div className="admin-reports-shell admin-reports-topbar">

          <Link
            href="/admin"
            className="admin-reports-back"
          >
            <ArrowLeft
              size={17}
            />

            Panel administrativo
          </Link>


          <div className="admin-reports-user">

            <span>
              Sesión activa
            </span>

            <strong>
              {userName}
            </strong>

          </div>

        </div>

      </header>


      <div className="admin-reports-shell admin-reports-content">


        {/* =================================================
            TITLE
            ================================================= */}

        <section className="admin-reports-heading">

          <div className="admin-reports-heading-icon">

            <BarChart3
              size={26}
            />

          </div>


          <div>

            <span>
              Reportes
            </span>

            <h1>
              Operación de la feria
            </h1>

            <p>
              Consulta recargas, consumo en juegos,
              personas y actividad de los dispositivos.
            </p>

          </div>

        </section>


        {/* =================================================
            FILTERS
            ================================================= */}

        <section className="admin-reports-filters">

          <div className="admin-reports-preset-row">

            <button
              type="button"
              className={
                preset ===
                "TODAY"
                  ? "active"
                  : ""
              }
              onClick={
                () =>
                  selectPreset(
                    "TODAY"
                  )
              }
            >
              Hoy
            </button>


            <button
              type="button"
              className={
                preset ===
                "7_DAYS"
                  ? "active"
                  : ""
              }
              onClick={
                () =>
                  selectPreset(
                    "7_DAYS"
                  )
              }
            >
              7 días
            </button>


            <button
              type="button"
              className={
                preset ===
                "30_DAYS"
                  ? "active"
                  : ""
              }
              onClick={
                () =>
                  selectPreset(
                    "30_DAYS"
                  )
              }
            >
              30 días
            </button>


            <button
              type="button"
              className={
                preset ===
                "CUSTOM"
                  ? "active"
                  : ""
              }
              onClick={
                () =>
                  setPreset(
                    "CUSTOM"
                  )
              }
            >
              Personalizado
            </button>

          </div>


          {preset ===
            "CUSTOM" && (

            <div className="admin-reports-custom-range">

              <label>

                <span>
                  Desde
                </span>

                <input
                  type="date"
                  value={
                    from
                  }
                  max={
                    to
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setFrom(
                        event.target
                          .value
                      )
                  }
                />

              </label>


              <label>

                <span>
                  Hasta
                </span>

                <input
                  type="date"
                  value={
                    to
                  }
                  min={
                    from
                  }
                  max={
                    initialDate
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setTo(
                        event.target
                          .value
                      )
                  }
                />

              </label>


              <button
                type="button"
                className="admin-reports-apply"
                onClick={
                  applyCustomRange
                }
              >
                <CalendarDays
                  size={17}
                />

                Aplicar rango
              </button>

            </div>

          )}


          <div className="admin-reports-current-range">

            <CalendarDays
              size={16}
            />

            <span>
              {
                formatDisplayDate(
                  appliedFrom
                )
              }

              {" — "}

              {
                formatDisplayDate(
                  appliedTo
                )
              }
            </span>


            <button
              type="button"
              aria-label="Actualizar reportes"
              title="Actualizar reportes"
              disabled={
                loading
              }
              onClick={
                () =>
                  void loadReports(
                    appliedFrom,
                    appliedTo
                  )
              }
            >
              <RefreshCw
                size={16}
              />
            </button>

          </div>

        </section>


        {/* =================================================
            ERROR
            ================================================= */}

        {error && (

          <div className="admin-reports-error">
            {error}
          </div>

        )}


        {/* =================================================
            LOADING
            ================================================= */}

        {loading ? (

          <div className="admin-reports-loading">

            <LoaderCircle
              size={30}
              className="admin-reports-spinner"
            />

            <span>
              Cargando reportes…
            </span>

          </div>

        ) : (

          <>

            {/* ===============================================
                SUMMARY
                =============================================== */}

            <section className="admin-report-summary-grid">

              <article className="admin-report-summary-card admin-report-summary-card-income">

                <div className="admin-report-summary-icon blue">

                  <WalletCards
                    size={23}
                  />

                </div>

                <span>
                  Ingreso total taquilla
                </span>

                <strong>
                  {
                    formatMoney(
                      summary
                        ?.rechargePoints
                        .totalIncomeAmount ??
                      0
                    )
                  }
                </strong>


                <div className="admin-report-income-breakdown">

                  <div>
                    <span>
                      Pago con tarjeta
                    </span>

                    <b>
                      {
                        formatMoney(
                          rechargePaymentTotals.card
                        )
                      }
                    </b>
                  </div>

                  <div>
                    <span>
                      Pago en efectivo
                    </span>

                    <b>
                      {
                        formatMoney(
                          rechargePaymentTotals.cash
                        )
                      }
                    </b>
                  </div>

                  <div>
                    <span>
                      Venta de tarjetas
                    </span>

                    <b>
                      {
                        formatMoney(
                          summary
                            ?.rechargePoints
                            .activationAmount ??
                          0
                        )
                      }
                    </b>
                  </div>

                </div>

              </article>


              <article className="admin-report-summary-card">

                <div className="admin-report-summary-icon red">

                  <Gamepad2
                    size={23}
                  />

                </div>

                <span>
                  Consumo total en juegos
                </span>

                <strong>
                  {
                    formatMoney(
                      summary
                        ?.games
                        .consumptionAmount ??
                      0
                    )
                  }
                </strong>

              </article>


              <article className="admin-report-summary-card">

                <div className="admin-report-summary-icon gold">

                  <Gift
                    size={23}
                  />

                </div>

                <span>
                  Promocional otorgado
                </span>

                <strong>
                  {
                    formatMoney(
                      summary
                        ?.rechargePoints
                        .promotionalGiven ??
                      0
                    )
                  }
                </strong>

                <small>
                  Bono entregado en recargas promocionales
                </small>

              </article>


              <article className="admin-report-summary-card admin-report-summary-card-admin">

                <div className="admin-report-summary-icon purple">

                  <ShieldCheck
                    size={23}
                  />

                </div>

                <span>
                  Operaciones ADMIN
                </span>

                <strong>
                  {
                    formatMoney(
                      summary
                        ?.admin
                        .rechargeAmount ??
                      0
                    )
                  }
                </strong>

                <small>
                  Recargas ADMIN
                </small>

                <div className="admin-report-admin-adjustment">
                  Quitar saldo:{" "}
                  <b>
                    {
                      formatMoney(
                        summary
                          ?.admin
                          .adjustmentAmount ??
                        0
                      )
                    }
                  </b>
                </div>

              </article>


              <article className="admin-report-summary-card admin-report-summary-card-returns">

                <div className="admin-report-summary-icon orange">

                  <RotateCcw
                    size={23}
                  />

                </div>

                <span>
                  Saldo eliminado en devoluciones
                </span>

                <strong>
                  {
                    formatMoney(
                      summary
                        ?.cardReturns
                        .discardedTotal ??
                      0
                    )
                  }
                </strong>

                <small>
                  CASH:{" "}
                  <b>
                    {
                      formatMoney(
                        summary
                          ?.cardReturns
                          .discardedCash ??
                        0
                      )
                    }
                  </b>

                  <br />

                  Promocional:{" "}
                  <b>
                    {
                      formatMoney(
                        summary
                          ?.cardReturns
                          .discardedPromotional ??
                        0
                      )
                    }
                  </b>

                  <br />

                  ADMIN_CREDIT:{" "}
                  <b>
                    {
                      formatMoney(
                        summary
                          ?.cardReturns
                          .discardedAdminCredit ??
                        0
                      )
                    }
                  </b>
                </small>

                <div className="admin-report-return-refund">
                  Efectivo devuelto por tarjetas:{" "}
                  <b>
                    {
                      formatMoney(
                        summary
                          ?.cardReturns
                          .refundAmount ??
                        0
                      )
                    }
                  </b>
                </div>

              </article>

            </section>


            <section className="admin-report-card-movement-grid">

              <article className="admin-report-card-movement-card activated">

                <div className="admin-report-card-movement-top">

                  <div className="admin-report-card-movement-icon">
                    <Ticket
                      size={22}
                    />
                  </div>

                  <div>
                    <span>
                      Tarjetas activadas
                    </span>

                    <strong>
                      {
                        (
                          summary
                            ?.cards
                            .rechargeActivationsCount ??
                          0
                        ) +
                        (
                          summary
                            ?.cards
                            .adminActivationsCount ??
                          0
                        )
                      }
                    </strong>
                  </div>

                </div>


                <div className="admin-report-card-origin-grid">

                  <div>
                    <span>
                      Origen TAQUILLA
                    </span>

                    <strong>
                      {
                        summary
                          ?.cards
                          .rechargeActivationsCount ??
                        0
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Origen ADMIN
                    </span>

                    <strong>
                      {
                        summary
                          ?.cards
                          .adminActivationsCount ??
                        0
                      }
                    </strong>
                  </div>

                </div>

              </article>


              <article className="admin-report-card-movement-card deactivated">

                <div className="admin-report-card-movement-top">

                  <div className="admin-report-card-movement-icon">
                    <Ticket
                      size={22}
                    />
                  </div>

                  <div>
                    <span>
                      Tarjetas desactivadas
                    </span>

                    <strong>
                      {
                        summary
                          ?.cards
                          .returnsCount ??
                        0
                      }
                    </strong>
                  </div>

                </div>


                <div className="admin-report-card-origin-grid">

                  <div>
                    <span>
                      Origen TAQUILLA
                    </span>

                    <strong>
                      {
                        summary
                          ?.cards
                          .rechargeOriginReturnsCount ??
                        0
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Origen ADMIN
                    </span>

                    <strong>
                      {
                        summary
                          ?.cards
                          .adminOriginReturnsCount ??
                        0
                      }
                    </strong>
                  </div>

                </div>

              </article>

            </section>


            {/* ===============================================
                GAMES
                =============================================== */}

            <section id="juegos" className="admin-report-section">

              <div className="admin-report-section-heading">

                <div>

                  <span>
                    Juegos
                  </span>

                  <h2>
                    Rendimiento por juego
                  </h2>

                </div>


                <div className="admin-report-section-count">
                  {games.length} juegos
                </div>

              </div>


              {games.length ===
                0 ? (

                <div className="admin-report-empty">
                  No hay consumos registrados en este periodo.
                </div>

              ) : (

                <>
                  <div className="admin-report-list">

                    {games.map(
                      (
                        game
                      ) => (

                        <Link
                          className="admin-report-list-link"
                          href={
                            `/admin/reportes/juegos/${encodeURIComponent(game.gameId)}` +
                            `?from=${encodeURIComponent(appliedFrom)}` +
                            `&to=${encodeURIComponent(appliedTo)}` +
                            `&preset=${encodeURIComponent(preset)}`
                          }
                          key={
                            game.gameId
                          }
                        >

                          <article
                            className="admin-report-list-card"
                          >

                          <div className="admin-report-list-main">

                            <div className="admin-report-list-icon game">

                              <Gamepad2
                                size={20}
                              />

                            </div>


                            <div>

                              <h3>
                                {
                                  game.name
                                }
                              </h3>

                              <p>
                                {
                                  game.peopleCount
                                }{" "}
                                personas
                              </p>

                            </div>

                          </div>


                          <div className="admin-report-list-values">

                            <strong>
                              {
                                formatMoney(
                                  game
                                    .consumptionAmount
                                )
                              }
                            </strong>

                            <span>
                              Precio actual:{" "}
                              {
                                formatMoney(
                                  game
                                    .currentPrice
                                )
                              }
                            </span>

                          </div>

                          </article>

                        </Link>

                      )
                    )}

                  </div>


                  <div className="admin-report-chart-card">

                    <div className="admin-report-chart-heading">

                      <div>

                        <span>
                          Comparativa diaria
                        </span>

                        <h3>
                          Ingresos por juego
                        </h3>

                      </div>

                    </div>


                    <div className="admin-report-chart">

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <LineChart
                          data={
                            gamesChartData
                          }
                          margin={{
                            top:
                              15,

                            right:
                              20,

                            left:
                              5,

                            bottom:
                              5,
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={
                              false
                            }
                            stroke="rgba(18,58,140,.10)"
                          />


                          <XAxis
                            dataKey="label"
                            tick={{
                              fontSize:
                                11,
                            }}
                            tickLine={
                              false
                            }
                            axisLine={
                              false
                            }
                          />


                          <YAxis
                            tickFormatter={
                              (
                                value
                              ) =>
                                `$${value}`
                            }
                            tick={{
                              fontSize:
                                11,
                            }}
                            tickLine={
                              false
                            }
                            axisLine={
                              false
                            }
                          />


                          <Tooltip
                            formatter={
                              (
                                value,
                                name
                              ) => [
                                formatMoney(
                                  Number(
                                    value
                                  )
                                ),

                                String(
                                  name
                                ),
                              ]
                            }
                            labelFormatter={
                              (
                                label
                              ) =>
                                String(
                                  label
                                )
                            }
                          />


                          <Legend />


                          {games.map(
                            (
                              game,
                              index
                            ) => (

                              <Line
                                key={
                                  game.gameId
                                }
                                type="monotone"
                                dataKey={
                                  game.gameId
                                }
                                name={
                                  game.name
                                }
                                stroke={
                                  LINE_COLORS[
                                    index %
                                    LINE_COLORS
                                      .length
                                  ]
                                }
                                strokeWidth={
                                  3
                                }
                                dot={{
                                  r:
                                    4,
                                }}
                                activeDot={{
                                  r:
                                    6,
                                }}
                                connectNulls
                              />

                            )
                          )}

                        </LineChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                </>

              )}

            </section>


            {/* ===============================================
                RECHARGE POINTS
                =============================================== */}

            <section id="taquillas" className="admin-report-section">

              <div className="admin-report-section-heading">

                <div>

                  <span>
                    Taquillas
                  </span>

                  <h2>
                    Ingresos por taquilla
                  </h2>

                </div>


                <div className="admin-report-section-count">
                  {
                    rechargePoints.length
                  }{" "}
                  taquillas
                </div>

              </div>


              {rechargePoints.length ===
                0 ? (

                <div className="admin-report-empty">
                  No hay ingresos de taquilla registrados en este periodo.
                </div>

              ) : (

                <>
                  <div className="admin-report-list">

                    {rechargePoints.map(
                      (
                        point
                      ) => (

                        <Link
                          className="admin-report-list-link"
                          href={
                            `/admin/reportes/taquillas/${encodeURIComponent(point.rechargePointId)}` +
                            `?from=${encodeURIComponent(appliedFrom)}` +
                            `&to=${encodeURIComponent(appliedTo)}` +
                            `&preset=${encodeURIComponent(preset)}`
                          }
                          key={
                            point
                              .rechargePointId
                          }
                        >

                          <article
                            className="admin-report-list-card"
                          >

                          <div className="admin-report-list-main">

                            <div className="admin-report-list-icon recharge">

                              <Ticket
                                size={20}
                              />

                            </div>


                            <div>

                              <h3>
                                {
                                  point.name
                                }
                              </h3>

                              <p>
                                Recargas y activaciones
                              </p>

                            </div>

                          </div>


                          <div className="admin-report-recharge-values">

                            <div>

                              <span>
                                Ingreso real total
                              </span>

                              <strong>
                                {
                                  formatMoney(
                                    point
                                      .totalIncomeAmount
                                  )
                                }
                              </strong>

                            </div>


                            <div>

                              <span>
                                Efectivo devuelto
                              </span>

                              <strong>
                                {
                                  formatMoney(
                                    point
                                      .cardRefundAmount
                                  )
                                }
                              </strong>

                            </div>

                          </div>

                          </article>

                        </Link>

                      )
                    )}

                  </div>


                  <div className="admin-report-chart-card">

                    <div className="admin-report-chart-heading">

                      <div>

                        <span>
                          Comparativa diaria
                        </span>

                        <h3>
                          Ingresos por taquilla
                        </h3>

                      </div>

                    </div>


                    <div className="admin-report-chart">

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <LineChart
                          data={
                            rechargeChartData
                          }
                          margin={{
                            top:
                              15,

                            right:
                              20,

                            left:
                              5,

                            bottom:
                              5,
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={
                              false
                            }
                            stroke="rgba(18,58,140,.10)"
                          />


                          <XAxis
                            dataKey="label"
                            tick={{
                              fontSize:
                                11,
                            }}
                            tickLine={
                              false
                            }
                            axisLine={
                              false
                            }
                          />


                          <YAxis
                            tickFormatter={
                              (
                                value
                              ) =>
                                `$${value}`
                            }
                            tick={{
                              fontSize:
                                11,
                            }}
                            tickLine={
                              false
                            }
                            axisLine={
                              false
                            }
                          />


                          <Tooltip
                            formatter={
                              (
                                value,
                                name
                              ) => [
                                formatMoney(
                                  Number(
                                    value
                                  )
                                ),

                                String(
                                  name
                                ),
                              ]
                            }
                          />


                          <Legend />


                          {rechargePoints.map(
                            (
                              point,
                              index
                            ) => (

                              <Line
                                key={
                                  point
                                    .rechargePointId
                                }
                                type="monotone"
                                dataKey={
                                  point
                                    .rechargePointId
                                }
                                name={
                                  point.name
                                }
                                stroke={
                                  LINE_COLORS[
                                    index %
                                    LINE_COLORS
                                      .length
                                  ]
                                }
                                strokeWidth={
                                  3
                                }
                                dot={{
                                  r:
                                    4,
                                }}
                                activeDot={{
                                  r:
                                    6,
                                }}
                                connectNulls
                              />

                            )
                          )}

                        </LineChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                </>

              )}

            </section>


            {/* ===============================================
                DEVICES
                =============================================== */}

            <section className="admin-report-section">

              <div className="admin-report-section-heading">

                <div>

                  <span>
                    Dispositivos
                  </span>

                  <h2>
                    Actividad por Ulefone
                  </h2>

                </div>


                <div className="admin-report-section-count">
                  {
                    devices.length
                  }{" "}
                  dispositivos
                </div>

              </div>


              {devices.length ===
                0 ? (

                <div className="admin-report-empty">
                  No hay dispositivos registrados.
                </div>

              ) : (

                <div className="admin-report-device-list">

                  {devices.map(
                    (
                      device
                    ) => (

                      <article
                        className="admin-report-device-card"
                        key={
                          device.deviceId
                        }
                      >

                        <div className="admin-report-device-main">

                          <div className="admin-report-list-icon device">

                            <MonitorSmartphone
                              size={21}
                            />

                          </div>


                          <div>

                            <div className="admin-report-device-title">

                              <h3>
                                {
                                  device.name
                                }
                              </h3>


                              <span
                                className={
                                  device.status ===
                                  "ACTIVE"
                                    ? "active"
                                    : ""
                                }
                              >
                                {
                                  device.status
                                }
                              </span>

                            </div>


                            <p>
                              {
                                device.code
                              }
                            </p>


                            <div className="admin-report-device-time">

                              <Clock3
                                size={15}
                              />

                              Tiempo registrado:{" "}

                              <strong>
                                {
                                  formatDuration(
                                    device
                                      .sessionSeconds
                                  )
                                }
                              </strong>

                            </div>

                          </div>

                        </div>


                        <button
                          type="button"
                          className="admin-report-history-button"
                          disabled={
                            historyLoading
                          }
                          onClick={
                            () =>
                              void openDeviceHistory(
                                device
                              )
                          }
                        >
                          Ver historial
                        </button>

                      </article>

                    )
                  )}

                </div>

              )}

            </section>

          </>

        )}

      </div>


      {/* ===================================================
          HISTORY MODAL
          =================================================== */}

      {selectedDevice && (

        <div
          className="admin-history-overlay"
          role="presentation"
          onMouseDown={
            () =>
              setSelectedDevice(
                null
              )
          }
        >

          <section
            className="admin-history-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Historial del dispositivo"
            onMouseDown={
              (
                event
              ) =>
                event.stopPropagation()
            }
          >

            <header className="admin-history-header">

              <div>

                <span>
                  Historial del dispositivo
                </span>

                <h2>
                  {
                    selectedDevice
                      .device.name
                  }
                </h2>

                <p>
                  {
                    selectedDevice
                      .device.code
                  }
                  {" · "}
                  {
                    formatDisplayDate(
                      selectedDevice
                        .from
                    )
                  }
                  {" — "}
                  {
                    formatDisplayDate(
                      selectedDevice
                        .to
                    )
                  }
                </p>

              </div>


              <button
                type="button"
                aria-label="Cerrar historial"
                onClick={
                  () =>
                    setSelectedDevice(
                      null
                    )
                }
              >
                <X
                  size={20}
                />
              </button>

            </header>


            <div className="admin-history-content">

              {selectedDevice
                .sessions.length ===
                0 ? (

                <div className="admin-report-empty">
                  No hay sesiones dentro del periodo seleccionado.
                </div>

              ) : (

                selectedDevice
                  .sessions.map(
                    (
                      session
                    ) => {

                      const modeLabel =
                        session.mode ===
                        "GAME"
                          ? "JUEGO"
                          : session.mode ===
                            "RECHARGE"
                          ? "TAQUILLA"
                          : "ADMIN";


                      const title =
                        session.game
                          ?.name ??
                        session
                          .rechargePoint
                          ?.name ??
                        "Administración";


                      return (

                        <article
                          className={`admin-history-session mode-${session.mode.toLowerCase()}`}
                          key={
                            session.sessionId
                          }
                        >

                          <div className="admin-history-session-top">

                            <div>

                              <span>
                                {
                                  modeLabel
                                }
                              </span>

                              <h3>
                                {
                                  title
                                }
                              </h3>

                            </div>


                            <div className="admin-history-session-duration">

                              <Clock3
                                size={15}
                              />

                              {
                                formatDuration(
                                  session
                                    .durationSeconds
                                )
                              }

                            </div>

                          </div>


                          <p className="admin-history-session-date">

                            {
                              formatDateTime(
                                session
                                  .visibleStartedAt
                              )
                            }

                            {" → "}

                            {
                              formatDateTime(
                                session
                                  .visibleEndedAt
                              )
                            }

                          </p>


                          <div className="admin-history-metrics">

                            {session.mode ===
                              "GAME" && (

                              <>
                                <div>

                                  <span>
                                    Personas
                                  </span>

                                  <strong>
                                    {
                                      session
                                        .metrics
                                        .gamePeopleCount
                                    }
                                  </strong>

                                </div>


                                <div>

                                  <span>
                                    Consumo
                                  </span>

                                  <strong>
                                    {
                                      formatMoney(
                                        session
                                          .metrics
                                          .gameConsumptionAmount
                                      )
                                    }
                                  </strong>

                                </div>
                              </>

                            )}


                            {session.mode ===
                              "RECHARGE" && (

                              <div>

                                <span>
                                  Total recargado
                                </span>

                                <strong>
                                  {
                                    formatMoney(
                                      session
                                        .metrics
                                        .rechargeAmount
                                    )
                                  }
                                </strong>

                              </div>

                            )}


                            {session.mode ===
                              "ADMIN" && (

                              <>
                                <div>

                                  <span>
                                    Recargas ADMIN
                                  </span>

                                  <strong>
                                    {
                                      formatMoney(
                                        session
                                          .metrics
                                          .adminRechargeAmount
                                      )
                                    }
                                  </strong>

                                </div>


                                <div>

                                  <span>
                                    Quitar saldo
                                  </span>

                                  <strong>
                                    {
                                      formatMoney(
                                        session
                                          .metrics
                                          .adminAdjustmentAmount
                                      )
                                    }
                                  </strong>

                                </div>
                              </>

                            )}

                          </div>

                        </article>

                      );
                    }
                  )

              )}

            </div>

          </section>

        </div>

      )}

    </main>
  );
}
