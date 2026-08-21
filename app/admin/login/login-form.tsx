"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

export default function LoginForm() {
  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ??
            "No fue posible iniciar sesión."
        );
        return;
      }

      router.replace("/admin");
      router.refresh();

    } catch {
      setError(
        "No fue posible conectar con el servidor."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-visual">
        <div className="admin-login-overlay" />

        <div className="admin-login-brand">
          <Image
            src="/images/logo-meneses.png"
            alt="Espectaculares Meneses"
            width={100}
            height={100}
            priority
            className="admin-login-logo"
          />

          <div>
            <span>
              Panel administrativo
            </span>
            <strong>
              Espectaculares Meneses
            </strong>
          </div>
        </div>

        <div className="admin-login-message">
          <span>
            Administración privada
          </span>

          <h1>
            Todo el control de la feria,
            en un solo lugar.
          </h1>

          <p>
            Configuración, horarios,
            ubicación y reportes.
          </p>
        </div>
      </section>

      <section className="admin-login-form-side">
        <div className="admin-login-form-card">
          <div className="admin-login-form-heading">
            <span>Acceso administrativo</span>
            <h2>Iniciar sesión</h2>
            <p>
              Ingresa con tu cuenta de
              administrador.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="admin-login-form"
          >
            <label>
              Correo electrónico

              <div className="admin-input-wrap">
                <Mail size={18} />

                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="admin@meneses.mx"
                  required
                />
              </div>
            </label>

            <label>
              Contraseña

              <div className="admin-input-wrap">
                <LockKeyhole size={18} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="••••••••••••"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            {error && (
              <div className="admin-login-error">
                {error}
              </div>
            )}

            <button
              className="admin-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Ingresando..."
                : "Ingresar"}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>

          <a
            href="/"
            className="admin-login-back"
          >
            ← Volver al sitio público
          </a>
        </div>
      </section>
    </main>
  );
}
