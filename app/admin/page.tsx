import Image from "next/image";

import {
  redirect,
} from "next/navigation";

import {
  BarChart3,
  ImageIcon,
  Settings,
  Smartphone,
} from "lucide-react";

import LogoutButton
  from "./logout-button";

import {
  getCurrentWebUser,
} from "@/lib/web-auth";


export default async function AdminPage() {

  const user =
    await getCurrentWebUser();


  if (!user) {

    redirect(
      "/admin/login"
    );
  }


  return (
    <main className="admin-dashboard-page">

      <header className="admin-dashboard-header">

        <div className="admin-dashboard-shell admin-header-inner">

          <div className="admin-header-brand">

            <Image
              src="/images/logo-meneses.png"
              alt="Espectaculares Meneses"
              width={54}
              height={54}
              className="admin-header-logo"
            />


            <div>

              <span>
                Espectaculares Meneses
              </span>

              <strong>
                Panel administrativo
              </strong>

            </div>

          </div>


          <LogoutButton />

        </div>

      </header>


      <section className="admin-dashboard-shell admin-dashboard-content">

        <div className="admin-welcome">

          <span>
            Bienvenido
          </span>


          <h1>
            {user.fullName}
          </h1>


          <p>
            Desde aquí podrás administrar la
            información pública de la feria,
            consultar reportes de operación,
            supervisar los dispositivos y
            configurar el contenido del sitio.
          </p>

        </div>


        <div className="admin-module-grid">

          <a
            href="/admin/configuracion"
            className="admin-module-card"
          >

            <div className="admin-module-icon blue">

              <Settings
                size={25}
              />

            </div>


            <div>

              <h2>
                Configuración
              </h2>

              <p>
                Ubicación, horarios, teléfono
                y datos públicos de la feria.
              </p>

            </div>

          </a>


          <a
            href="/admin/reportes"
            className="admin-module-card"
          >

            <div className="admin-module-icon gold">

              <BarChart3
                size={25}
              />

            </div>


            <div>

              <h2>
                Reportes
              </h2>

              <p>
                Consulta recargas, consumo en
                juegos, personas, taquillas y
                actividad de los dispositivos.
              </p>

            </div>

          </a>


          <a
            href="/admin/dispositivos"
            className="admin-module-card"
          >

            <div className="admin-module-icon red">

              <Smartphone
                size={25}
              />

            </div>


            <div>

              <h2>
                Dispositivos
              </h2>

              <p>
                Registra, provisiona, bloquea
                y supervisa los Ulefone
                utilizados en la feria.
              </p>

            </div>

          </a>


          <a
            href="/admin/contenido"
            className="admin-module-card"
          >

            <div className="admin-module-icon purple">

              <ImageIcon
                size={25}
              />

            </div>


            <div>

              <h2>
                Contenido del sitio
              </h2>

              <p>
                Administra la imagen de portada
                y las atracciones que aparecen
                en la página pública.
              </p>

            </div>

          </a>

        </div>

      </section>

    </main>
  );
}
