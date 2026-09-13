"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Gamepad2,
  LoaderCircle,
  RefreshCw,
  Ticket,
  Users,
  WalletCards,
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

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


type GameDailyBreakdown = {
  date: string;
  consumptionAmount: number;
  cashConsumed: number;
  promotionalConsumed: number;
  adminCreditConsumed: number;
  legacyConsumed: number;
  unclassifiedConsumed: number;
  peopleCount: number;
  operationsCount: number;
};


type GameDetailResponse = {
  from: string;
  to: string;
  timezone: string;

  game: {
    gameId: string;
    name: string;
    currentPrice: number;
  };

  summary: {
    consumptionAmount: number;
    cashConsumed: number;
    promotionalConsumed: number;
    adminCreditConsumed: number;
    legacyConsumed: number;
    unclassifiedConsumed: number;
    peopleCount: number;
    operationsCount: number;
  };

  dailyBreakdown:
    GameDailyBreakdown[];
};


type Props = {
  gameId: string;
  from: string;
  to: string;
  userName: string;
};


function formatMoney(
  value: number
) {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style:
        "currency",
      currency:
        "MXN",
      maximumFractionDigits:
        0,
    }
  ).format(value);
}


function formatDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}


function shortDate(
  value: string
) {
  const [
    ,
    month,
    day,
  ] =
    value.split("-");

  if (
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}`;
}


export default function GameReportDetail({
  gameId,
  from,
  to,
  userName,
}: Props) {
  const searchParams =
    useSearchParams();

  const [
    report,
    setReport,
  ] =
    useState<
      GameDetailResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  const loadReport =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const params =
            new URLSearchParams({
              from,
              to,
            });

          const response =
            await fetch(
              `/api/admin/reports/games/${encodeURIComponent(gameId)}?${params.toString()}`,
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
              data?.message ??
                data?.error ??
                "No fue posible cargar el reporte del juego."
            );
          }

          setReport(
            data
          );
        } catch (
          requestError
        ) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No fue posible cargar el reporte del juego."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        gameId,
        from,
        to,
      ]
    );


  useEffect(() => {
    void loadReport();
  }, [loadReport]);


  const backHref =
    useMemo(
      () => {
        const preset =
          searchParams.get(
            "preset"
          );

        const params =
          new URLSearchParams({
            from,
            to,
          });

        if (preset) {
          params.set(
            "preset",
            preset
          );
        }

        return `/admin/reportes?${params.toString()}#juegos`;
      },
      [
        from,
        to,
        searchParams,
      ]
    );


  const chartData =
    useMemo(
      () =>
        (
          report
            ?.dailyBreakdown ??
          []
        ).map(
          (day) => ({
            label:
              shortDate(
                day.date
              ),
            cash:
              day.cashConsumed,
            promotional:
              day.promotionalConsumed,
            adminCredit:
              day.adminCreditConsumed,
          })
        ),
      [report]
    );


  const hiddenHistoricalAmount =
    report
      ? report.summary
          .legacyConsumed +
        report.summary
          .unclassifiedConsumed
      : 0;


  return (
    <main className="game-report-page">

      <div className="game-report-shell">

        <header className="game-report-topbar">

          <Link
            className="game-report-back"
            href={backHref}
          >
            <ArrowLeft
              size={16}
            />

            Reportes
          </Link>


          <div className="game-report-user">
            <span>
              Administrador
            </span>

            <strong>
              {userName}
            </strong>
          </div>

        </header>


        <section className="game-report-content">

          {loading &&
          report === null ? (

            <div className="game-report-state">

              <LoaderCircle
                className="game-report-spinner"
                size={30}
              />

              <strong>
                Cargando auditoría...
              </strong>

              <span>
                Consultando información financiera del juego.
              </span>

            </div>

          ) : error &&
            report === null ? (

            <div className="game-report-state error">

              <AlertTriangle
                size={30}
              />

              <strong>
                No fue posible cargar el reporte
              </strong>

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() => {
                  void loadReport();
                }}
              >
                <RefreshCw
                  size={15}
                />

                Reintentar
              </button>

            </div>

          ) : report ? (

            <>

              <div className="game-report-heading">

                <div className="game-report-heading-icon">
                  <Gamepad2
                    size={27}
                  />
                </div>


                <div>

                  <span>
                    Auditoría de juego
                  </span>

                  <h1>
                    {
                      report
                        .game
                        .name
                    }
                  </h1>

                  <p>
                    Periodo{" "}
                    <strong>
                      {
                        formatDate(
                          report.from
                        )
                      }
                    </strong>{" "}
                    al{" "}
                    <strong>
                      {
                        formatDate(
                          report.to
                        )
                      }
                    </strong>
                  </p>

                </div>

              </div>


              <section className="game-report-summary-layout">

                <div className="game-report-context-grid">

                  <article className="game-report-metric">

                    <div>
                      <span>
                        # de personas
                      </span>

                      <strong>
                        {
                          report
                            .summary
                            .peopleCount
                        }
                      </strong>
                    </div>

                    <Users
                      size={23}
                    />

                  </article>


                  <article className="game-report-metric">

                    <div>
                      <span>
                        Precio actual
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .game
                              .currentPrice
                          )
                        }
                      </strong>
                    </div>

                    <Gamepad2
                      size={23}
                    />

                  </article>

                </div>


                <div className="game-report-consumption-section">

                  <article className="game-report-consumption-hero">

                    <div>
                      <span>
                        Consumo total
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .consumptionAmount
                          )
                        }
                      </strong>

                      <small>
                        CASH + PROMOTIONAL + ADMIN_CREDIT
                      </small>
                    </div>

                    <WalletCards
                      size={24}
                    />

                  </article>


                  <div className="game-report-fund-grid">

                    <article className="game-report-metric">

                      <div>
                        <span>
                          CASH
                        </span>

                        <strong>
                          {
                            formatMoney(
                              report
                                .summary
                                .cashConsumed
                            )
                          }
                        </strong>
                      </div>

                      <WalletCards
                        size={23}
                      />

                    </article>


                    <article className="game-report-metric">

                      <div>
                        <span>
                          PROMOTIONAL
                        </span>

                        <strong>
                          {
                            formatMoney(
                              report
                                .summary
                                .promotionalConsumed
                            )
                          }
                        </strong>
                      </div>

                      <Ticket
                        size={23}
                      />

                    </article>


                    <article className="game-report-metric">

                      <div>
                        <span>
                          ADMIN_CREDIT
                        </span>

                        <strong>
                          {
                            formatMoney(
                              report
                                .summary
                                .adminCreditConsumed
                            )
                          }
                        </strong>
                      </div>

                      <WalletCards
                        size={23}
                      />

                    </article>

                  </div>

                </div>

              </section>


              {hiddenHistoricalAmount >
                0 && (

                <div className="game-report-integrity-note">

                  <AlertTriangle
                    size={18}
                  />

                  <div>
                    <strong>
                      Hay saldo histórico dentro del consumo total.
                    </strong>

                    <p>
                      {
                        formatMoney(
                          hiddenHistoricalAmount
                        )
                      }{" "}
                      pertenecen a saldo LEGACY o a operaciones históricas sin clasificación financiera. Se conservan dentro del total, pero no se atribuyen artificialmente a CASH, PROMOTIONAL o ADMIN_CREDIT.
                    </p>
                  </div>

                </div>

              )}


              <section className="game-report-panel">

                <div className="game-report-section-heading">

                  <div>

                    <span>
                      Tendencia financiera
                    </span>

                    <h2>
                      Composición por día
                    </h2>

                  </div>


                  <CalendarDays
                    size={21}
                  />

                </div>


                {chartData.length ===
                  0 ? (

                  <div className="game-report-empty">
                    No hay operaciones durante este periodo.
                  </div>

                ) : (

                  <div className="game-report-chart">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 18,
                          right: 18,
                          left: 4,
                          bottom: 4,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="4 4"
                          vertical={false}
                          stroke="rgba(18,58,140,.10)"
                        />

                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 11,
                          }}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          tickFormatter={(
                            value
                          ) =>
                            `$${value}`
                          }
                          tick={{
                            fontSize: 11,
                          }}
                          tickLine={false}
                          axisLine={false}
                        />

                        <Tooltip
                          formatter={(
                            value
                          ) =>
                            formatMoney(
                              Number(
                                value
                              )
                            )
                          }
                        />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="cash"
                          name="CASH"
                          stroke="#16a34a"
                          strokeWidth={3}
                          dot={{
                            r: 3,
                          }}
                          activeDot={{
                            r: 5,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="promotional"
                          name="PROMOTIONAL"
                          stroke="#7c3aed"
                          strokeWidth={3}
                          dot={{
                            r: 3,
                          }}
                          activeDot={{
                            r: 5,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="adminCredit"
                          name="ADMIN_CREDIT"
                          stroke="#123a8c"
                          strokeWidth={3}
                          dot={{
                            r: 3,
                          }}
                          activeDot={{
                            r: 5,
                          }}
                        />

                      </LineChart>
                    </ResponsiveContainer>

                  </div>

                )}

              </section>


              <section className="game-report-panel">

                <div className="game-report-section-heading">

                  <div>

                    <span>
                      Auditoría diaria
                    </span>

                    <h2>
                      Desglose financiero
                    </h2>

                  </div>

                </div>


                {report
                  .dailyBreakdown
                  .length ===
                  0 ? (

                  <div className="game-report-empty">
                    No hay operaciones durante este periodo.
                  </div>

                ) : (

                  <div className="game-report-table-wrap">

                    <table className="game-report-table">

                      <thead>
                        <tr>
                          <th>
                            Fecha
                          </th>

                          <th>
                            Consumo total
                          </th>

                          <th>
                            CASH
                          </th>

                          <th>
                            PROMOTIONAL
                          </th>

                          <th>
                            ADMIN_CREDIT
                          </th>

                          <th>
                            Personas
                          </th>
                        </tr>
                      </thead>


                      <tbody>

                        {report
                          .dailyBreakdown
                          .map(
                            (
                              day
                            ) => (

                            <tr
                              key={
                                day.date
                              }
                            >
                              <td>
                                {
                                  formatDate(
                                    day.date
                                  )
                                }
                              </td>

                              <td>
                                <strong>
                                  {
                                    formatMoney(
                                      day
                                        .consumptionAmount
                                    )
                                  }
                                </strong>
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .cashConsumed
                                  )
                                }
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .promotionalConsumed
                                  )
                                }
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .adminCreditConsumed
                                  )
                                }
                              </td>

                              <td>
                                {
                                  day
                                    .peopleCount
                                }
                              </td>
                            </tr>

                          )
                        )}

                      </tbody>

                      <tfoot>

                        <tr>

                          <td>
                            Total
                          </td>

                          <td>
                            <strong>
                              {
                                formatMoney(
                                  report
                                    .summary
                                    .consumptionAmount
                                )
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              formatMoney(
                                report
                                  .summary
                                  .cashConsumed
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report
                                  .summary
                                  .promotionalConsumed
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report
                                  .summary
                                  .adminCreditConsumed
                              )
                            }
                          </td>

                          <td>
                            {
                              report
                                .summary
                                .peopleCount
                            }
                          </td>

                        </tr>

                      </tfoot>

                    </table>

                  </div>

                )}

              </section>

            </>

          ) : null}

        </section>

      </div>

    </main>
  );
}
