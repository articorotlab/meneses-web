"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  Banknote,
  CalendarDays,
  CreditCard,
  Gift,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Store,
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


type RechargePointDailyBreakdown = {
  date: string;
  cashReceived: number;
  cardReceived: number;
  cashRechargeAmount: number;
  cardRechargeAmount: number;
  legacyUnclassifiedReceived: number;
  paidRechargeAmount: number;
  promotionalGiven: number;
  creditedAmount: number;
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
  operationsCount: number;
};


type RechargePointDetailResponse = {
  from: string;
  to: string;
  timezone: string;

  rechargePoint: {
    rechargePointId: string;
    name: string;
  };

  summary: {
    cashReceived: number;
    cardReceived: number;
    cashRechargeAmount: number;
    cardRechargeAmount: number;
    legacyUnclassifiedReceived: number;
    paidRechargeAmount: number;
    promotionalGiven: number;
    creditedAmount: number;
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
    operationsCount: number;
  };

  dailyBreakdown:
    RechargePointDailyBreakdown[];
};


type Props = {
  rechargePointId: string;
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


function dateRange(
  from: string,
  to: string
) {
  const dates: string[] = [];

  const current =
    new Date(
      `${from}T12:00:00Z`
    );

  const end =
    new Date(
      `${to}T12:00:00Z`
    );

  while (
    current <= end
  ) {
    dates.push(
      current
        .toISOString()
        .slice(0, 10)
    );

    current.setUTCDate(
      current.getUTCDate() + 1
    );
  }

  return dates;
}


function completeDailyBreakdown(
  from: string,
  to: string,
  dailyBreakdown:
    RechargePointDailyBreakdown[]
) {
  const byDate =
    new Map(
      dailyBreakdown.map(
        (day) => [
          day.date,
          day,
        ]
      )
    );

  return dateRange(
    from,
    to
  ).map(
    (date) =>
      byDate.get(date) ?? {
        date,
        cashReceived: 0,
        cardReceived: 0,
        cashRechargeAmount: 0,
        cardRechargeAmount: 0,
        legacyUnclassifiedReceived: 0,
        paidRechargeAmount: 0,
        promotionalGiven: 0,
        creditedAmount: 0,
        activationAmount: 0,
        totalIncomeAmount: 0,
        cardRefundAmount: 0,
        discardedCash: 0,
        discardedPromotional: 0,
        discardedAdminCredit: 0,
        discardedLegacy: 0,
        discardedTotal: 0,
        activationsCount: 0,
        returnsCount: 0,
        rechargeOriginReturnsCount: 0,
        adminOriginReturnsCount: 0,
        operationsCount: 0,
      }
  );
}


export default function RechargePointReportDetail({
  rechargePointId,
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
      RechargePointDetailResponse | null
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
              `/api/admin/reports/recharge-points/${encodeURIComponent(rechargePointId)}?${params.toString()}`,
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
                "No fue posible cargar el reporte de la taquilla."
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
              : "No fue posible cargar el reporte de la taquilla."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        rechargePointId,
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

        return `/admin/reportes?${params.toString()}#taquillas`;
      },
      [
        from,
        to,
        searchParams,
      ]
    );


  const completeDays =
    useMemo(
      () =>
        report
          ? completeDailyBreakdown(
              report.from,
              report.to,
              report.dailyBreakdown
            )
          : [],
      [report]
    );


  const chartData =
    useMemo(
      () =>
        completeDays.map(
          (day) => ({
            label:
              shortDate(
                day.date
              ),
            income:
              day.totalIncomeAmount,
            paidRecharge:
              day.paidRechargeAmount,
            credited:
              day.creditedAmount,
          })
        ),
      [completeDays]
    );


  const creditEquationDifference =
    report
      ? report.summary
          .creditedAmount -
        (
          report.summary
            .paidRechargeAmount +
          report.summary
            .promotionalGiven
        )
      : 0;


  return (
    <main className="recharge-report-page">

      <div className="recharge-report-shell">

        <header className="recharge-report-topbar">

          <Link
            className="recharge-report-back"
            href={backHref}
          >
            <ArrowLeft
              size={16}
            />

            Reportes
          </Link>


          <div className="recharge-report-user">
            <span>
              Administrador
            </span>

            <strong>
              {userName}
            </strong>
          </div>

        </header>


        <section className="recharge-report-content">

          {loading &&
          report === null ? (

            <div className="recharge-report-state">

              <LoaderCircle
                className="recharge-report-spinner"
                size={30}
              />

              <strong>
                Cargando auditoría...
              </strong>

              <span>
                Consultando información financiera de la taquilla.
              </span>

            </div>

          ) : error &&
            report === null ? (

            <div className="recharge-report-state error">

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

              <div className="recharge-report-heading">

                <div className="recharge-report-heading-icon">
                  <Store
                    size={27}
                  />
                </div>


                <div>

                  <span>
                    Auditoría de taquilla
                  </span>

                  <h1>
                    {
                      report
                        .rechargePoint
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


              <section className="recharge-report-financial-overview">

                <article className="recharge-report-income-hero">

                  <div>
                    <span>
                      Ingreso real total
                    </span>

                    <strong>
                      {
                        formatMoney(
                          report
                            .summary
                            .totalIncomeAmount
                        )
                      }
                    </strong>

                    <small>
                      Pagos con tarjeta + Pagos en efectivo + Venta de tarjetas
                    </small>
                  </div>

                  <BadgeDollarSign
                    size={24}
                  />

                </article>


                <div className="recharge-report-income-components">

                  <article className="recharge-report-metric">

                    <div>
                      <span>
                        Pagos en efectivo
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .cashRechargeAmount
                          )
                        }
                      </strong>

                      <small>
                        Recargas pagadas en efectivo · no incluye venta de tarjetas
                      </small>
                    </div>

                    <Banknote
                      size={23}
                    />

                  </article>


                  <article className="recharge-report-metric">

                    <div>
                      <span>
                        Pagos con tarjeta
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .cardRechargeAmount
                          )
                        }
                      </strong>

                      <small>
                        Recargas pagadas con tarjeta bancaria · no incluye venta de tarjetas
                      </small>
                    </div>

                    <CreditCard
                      size={23}
                    />

                  </article>


                  <article className="recharge-report-metric">

                    <div>
                      <span>
                        Venta de tarjetas
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .activationAmount
                          )
                        }
                      </strong>

                      <small>
                        Cuotas de activación confirmadas
                      </small>
                    </div>

                    <CreditCard
                      size={23}
                    />

                  </article>

                </div>


                <div className="recharge-report-credit-section">

                  <article className="recharge-report-credit-hero">

                    <div>
                      <span>
                        Crédito entregado
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .creditedAmount
                          )
                        }
                      </strong>

                      <small>
                        Recargas pagadas + Promocional otorgado
                      </small>
                    </div>

                    <WalletCards
                      size={24}
                    />

                  </article>


                  <div className="recharge-report-credit-components">

                    <article className="recharge-report-metric">

                      <div>
                        <span>
                          Recargas pagadas
                        </span>

                        <strong>
                          {
                            formatMoney(
                              report
                                .summary
                                .paidRechargeAmount
                            )
                          }
                        </strong>

                        <small>
                          Dinero pagado por recargas, incluyendo la parte pagada de promociones
                        </small>
                      </div>

                      <Banknote
                        size={23}
                      />

                    </article>


                    <article className="recharge-report-metric">

                      <div>
                        <span>
                          Promocional otorgado
                        </span>

                        <strong>
                          {
                            formatMoney(
                              report
                                .summary
                                .promotionalGiven
                            )
                          }
                        </strong>

                        <small>
                          Saldo adicional otorgado como promoción
                        </small>
                      </div>

                      <Gift
                        size={23}
                      />

                    </article>

                  </div>

                </div>

              </section>


              <section className="recharge-report-return-audit">

                <div className="recharge-report-return-audit-heading">

                  <div className="recharge-report-return-audit-icon">
                    <RotateCcw size={22} />
                  </div>

                  <div>
                    <span>
                      Auditoría de devoluciones
                    </span>

                    <h2>
                      Reset y devolución de tarjetas
                    </h2>

                    <p>
                      Separamos el dinero devuelto al cliente del saldo virtual eliminado
                      para que ambos movimientos puedan auditarse sin mezclarse.
                    </p>
                  </div>

                </div>


                <div className="recharge-report-return-overview">

                  <article className="recharge-report-return-metric refund">

                    <span>
                      Efectivo devuelto
                    </span>

                    <strong>
                      {
                        formatMoney(
                          report
                            .summary
                            .cardRefundAmount
                        )
                      }
                    </strong>

                    <small>
                      Importe realmente devuelto por las tarjetas desactivadas
                    </small>

                  </article>


                  <article className="recharge-report-return-metric">

                    <span>
                      Tarjetas desactivadas
                    </span>

                    <strong>
                      {
                        report
                          .summary
                          .returnsCount
                      }
                    </strong>

                    <div className="recharge-report-origin-breakdown">

                      <span>
                        Origen TAQUILLA
                        <strong>
                          {
                            report
                              .summary
                              .rechargeOriginReturnsCount
                          }
                        </strong>
                      </span>

                      <span>
                        Origen ADMIN
                        <strong>
                          {
                            report
                              .summary
                              .adminOriginReturnsCount
                          }
                        </strong>
                      </span>

                    </div>

                  </article>

                </div>


                <div className="recharge-report-discard-section">

                  <article className="recharge-report-discard-hero">

                    <div>
                      <span>
                        Saldo eliminado total
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .discardedTotal
                          )
                        }
                      </strong>

                      <small>
                        CASH + Promocional + ADMIN_CREDIT
                        {
                          report.summary.discardedLegacy > 0
                            ? " + Legacy"
                            : ""
                        }
                      </small>
                    </div>

                    <WalletCards
                      size={24}
                    />

                  </article>


                  <div className="recharge-report-discard-breakdown">

                    <div>
                      <span>
                        CASH eliminado
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .discardedCash
                          )
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Promocional eliminado
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .discardedPromotional
                          )
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        ADMIN_CREDIT eliminado
                      </span>

                      <strong>
                        {
                          formatMoney(
                            report
                              .summary
                              .discardedAdminCredit
                          )
                        }
                      </strong>
                    </div>

                    {
                      report.summary.discardedLegacy > 0 ? (

                        <div>
                          <span>
                            Legacy eliminado
                          </span>

                          <strong>
                            {
                              formatMoney(
                                report
                                  .summary
                                  .discardedLegacy
                              )
                            }
                          </strong>
                        </div>

                      ) : null
                    }

                  </div>

                </div>

              </section>


              {creditEquationDifference !==
                0 && (

                <div className="recharge-report-integrity-note">

                  <AlertTriangle
                    size={18}
                  />

                  <div>
                    <strong>
                      La composición del crédito no cuadra.
                    </strong>

                    <p>
                      Crédito entregado debería ser igual a recargas pagadas más promocional otorgado. La diferencia actual es{" "}
                      {
                        formatMoney(
                          creditEquationDifference
                        )
                      }.
                    </p>
                  </div>

                </div>

              )}


              <section className="recharge-report-panel">

                <div className="recharge-report-section-heading">

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

                  <div className="recharge-report-empty">
                    No hay movimientos durante este periodo.
                  </div>

                ) : (

                  <div className="recharge-report-chart">

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
                          dataKey="income"
                          name="Ingreso real total"
                          stroke="#16824d"
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
                          dataKey="paidRecharge"
                          name="Recargas pagadas"
                          stroke="#2563eb"
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
                          dataKey="credited"
                          name="Crédito entregado"
                          stroke="#7c3aed"
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


              <section className="recharge-report-panel">

                <div className="recharge-report-section-heading">

                  <div>

                    <span>
                      Auditoría diaria
                    </span>

                    <h2>
                      Desglose financiero
                    </h2>

                  </div>

                </div>


                {completeDays.length ===
                  0 ? (

                  <div className="recharge-report-empty">
                    No hay movimientos durante este periodo.
                  </div>

                ) : (

                  <div className="recharge-report-table-wrap">

                    <table className="recharge-report-table">

                      <thead>
                        <tr>
                          <th>
                            Fecha
                          </th>

                          <th>
                            Ingreso real
                          </th>

                          <th>
                            Pagos en efectivo
                          </th>

                          <th>
                            Pagos con tarjeta
                          </th>

                          <th>
                            Recargas pagadas
                          </th>

                          <th>
                            Venta tarjetas
                          </th>

                          <th>
                            Crédito entregado
                          </th>

                          <th>
                            Promocional
                          </th>

                          <th>
                            Tarjetas desactivadas
                          </th>

                          <th>
                            Efectivo devuelto
                          </th>

                          <th>
                            Saldo eliminado
                          </th>
                        </tr>
                      </thead>


                      <tbody>

                        {completeDays
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
                                        .totalIncomeAmount
                                    )
                                  }
                                </strong>
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .cashRechargeAmount
                                  )
                                }
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .cardRechargeAmount
                                  )
                                }
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .paidRechargeAmount
                                  )
                                }
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .activationAmount
                                  )
                                }
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .creditedAmount
                                  )
                                }
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .promotionalGiven
                                  )
                                }
                              </td>

                              <td>
                                {day.returnsCount}
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .cardRefundAmount
                                  )
                                }
                              </td>

                              <td>
                                {
                                  formatMoney(
                                    day
                                      .discardedTotal
                                  )
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
                            {
                              formatMoney(
                                report.summary
                                  .totalIncomeAmount
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report.summary
                                  .cashRechargeAmount
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report.summary
                                  .cardRechargeAmount
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report.summary
                                  .paidRechargeAmount
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report.summary
                                  .activationAmount
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report.summary
                                  .creditedAmount
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report.summary
                                  .promotionalGiven
                              )
                            }
                          </td>

                          <td>
                            {report.summary.returnsCount}
                          </td>

                          <td>
                            {
                              formatMoney(
                                report.summary
                                  .cardRefundAmount
                              )
                            }
                          </td>

                          <td>
                            {
                              formatMoney(
                                report.summary
                                  .discardedTotal
                              )
                            }
                          </td>
                        </tr>
                      </tfoot>

                    </table>

                  </div>

                )}

              </section>


              <div className="recharge-report-equations">

                <article>
                  <strong>
                    Ingreso real total
                  </strong>

                  <span>
                    Pagos con tarjeta + Pagos en efectivo + Venta de tarjetas
                  </span>
                </article>

                <article>
                  <strong>
                    Crédito entregado
                  </strong>

                  <span>
                    Recargas pagadas + Promocional otorgado
                  </span>
                </article>

                <article>
                  <strong>
                    Recargas pagadas
                  </strong>

                  <span>
                    Dinero normal pagado por recargas + parte pagada de promociones
                  </span>
                </article>

                <article>
                  <strong>
                    Efectivo devuelto
                  </strong>

                  <span>
                    Suma real de los importes reembolsados al desactivar tarjetas
                  </span>
                </article>

                <article>
                  <strong>
                    Saldo eliminado total
                  </strong>

                  <span>
                    CASH + Promocional + ADMIN_CREDIT
                    {report.summary.discardedLegacy > 0
                      ? " + Legacy"
                      : ""}
                  </span>
                </article>

                <article>
                  <strong>
                    Origen de tarjetas desactivadas
                  </strong>

                  <span>
                    TAQUILLA {report.summary.rechargeOriginReturnsCount}
                    {" · "}
                    ADMIN {report.summary.adminOriginReturnsCount}
                  </span>
                </article>

              </div>

            </>

          ) : null}

        </section>

      </div>

    </main>
  );
}
