"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type TipoPostulacion = "Junta Directiva" | "Control Social" | "Comité de Apelaciones";

type ArchivoAdjunto = {
  url?: string;
  original_filename?: string;
  format?: string;
  bytes?: number;
};

type Integrante = {
  cedula?: string;
  nombreCompleto?: string;
  cargoEmpresa?: string;
  sedeTrabajo?: string;
  celular?: string;
  correo?: string;
  tipoIntegrante?: "PRINCIPAL" | "SUPLENTE" | "MIEMBRO";
  asociadoStatus?: "HABIL" | "NO_REGISTRADO" | "INHABIL";
  motivoInhabilidad?: string;
  adjuntoCedula?: ArchivoAdjunto;
  certificadoEconomiaSolidaria?: ArchivoAdjunto;
  soporteFormacionAcademica?: ArchivoAdjunto;
};

type MongoId = string | { $oid?: string };
type MongoDate = string | Date | { $date?: string };

type RawPostulacion = {
  _id: MongoId;
  estado?: "DRAFT" | "ENVIADA";
  createdAt?: MongoDate;
  updatedAt?: MongoDate;
  lider?: Integrante;
  integrantes?: Integrante[];
  compromisosInstitucionales?: boolean;
  autorizacionAntecedentes?: boolean;
  responsabilidadLider?: boolean;
};

type PostulacionVista = RawPostulacion & {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  tipo: TipoPostulacion;
};

const ENDPOINTS: Array<{ tipo: TipoPostulacion; url: string }> = [
  { tipo: "Junta Directiva", url: "/api/postulaciones/junta-directiva" },
  { tipo: "Control Social", url: "/api/postulaciones/control-social" },
  { tipo: "Comité de Apelaciones", url: "/api/postulaciones/comite-apelaciones" },
];

export default function DashboardPostulacionesPage() {
  const router = useRouter();
  const [postulaciones, setPostulaciones] = useState<PostulacionVista[]>([]);
  const [selectedPostulacionKey, setSelectedPostulacionKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPostulacionKey = (postulacion: PostulacionVista) => `${postulacion.tipo}-${postulacion._id}`;

  const normalizeId = (id: MongoId): string => {
    if (typeof id === "string") return id;
    return id?.$oid || "";
  };

  const normalizeDate = (value?: MongoDate): string | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toISOString();
    return value.$date;
  };

  const cargarPostulaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const respuestas = await Promise.all(
        ENDPOINTS.map(async ({ tipo, url }) => {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) {
            throw new Error(`No se pudo consultar ${tipo}`);
          }
          const data = await response.json();
          const lista = Array.isArray(data) ? data : [];
          return lista.map((item: RawPostulacion) => ({
            ...item,
            _id: normalizeId(item._id),
            createdAt: normalizeDate(item.createdAt),
            updatedAt: normalizeDate(item.updatedAt),
            tipo,
          }));
        }),
      );

      const merged = respuestas
        .flat()
        .sort((a, b) => {
          const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return fechaB - fechaA;
        });

      setPostulaciones(merged);

      if (merged.length > 0) {
        setSelectedPostulacionKey((actual) => actual ?? getPostulacionKey(merged[0]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando postulaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPostulaciones();
  }, [cargarPostulaciones]);

  const stats = useMemo(() => {
    const enviadas = postulaciones.filter((p) => p.estado === "ENVIADA").length;
    return {
      total: postulaciones.length,
      enviadas,
      borradores: postulaciones.length - enviadas,
    };
  }, [postulaciones]);

  const postulacionSeleccionada = useMemo(() => {
    if (!selectedPostulacionKey) return null;
    return postulaciones.find((postulacion) => getPostulacionKey(postulacion) === selectedPostulacionKey) ?? null;
  }, [postulaciones, selectedPostulacionKey]);

  return (
    <div className="min-h-screen bg-voting-gradient">
      <header className="border-b bg-card-50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div className="w-10 h-10 bg-logo-gradient rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Postulaciones Registradas</h1>
              <p className="text-sm text-muted-foreground">Vista consolidada de formularios de postulación</p>
            </div>
          </div>

          <Button variant="outline" onClick={cargarPostulaciones} disabled={loading} className="cursor-pointer">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refrescar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total" value={stats.total} />
          <StatCard title="Enviadas" value={stats.enviadas} />
          <StatCard title="Borradores" value={stats.borradores} />
        </div>

        {loading && (
          <div className="bg-card rounded-xl border p-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Cargando postulaciones...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-card rounded-xl border p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-muted/30 border-b">
                  <tr className="text-left text-sm">
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Líder</th>
                    <th className="px-4 py-3 font-semibold">Cédula</th>
                    <th className="px-4 py-3 font-semibold">Integrantes</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {postulaciones.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                        No hay postulaciones registradas aún.
                      </td>
                    </tr>
                  ) : (
                    postulaciones.map((postulacion) => {
                      const key = getPostulacionKey(postulacion);
                      const isSelected = key === selectedPostulacionKey;

                      return (
                      <tr
                        key={key}
                        className={`border-b last:border-b-0 text-sm cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                        }`}
                        onClick={() => setSelectedPostulacionKey(key)}
                      >
                        <td className="px-4 py-3">{postulacion.tipo}</td>
                        <td className="px-4 py-3">{postulacion.lider?.nombreCompleto || "-"}</td>
                        <td className="px-4 py-3">{postulacion.lider?.cedula || "-"}</td>
                        <td className="px-4 py-3">{1 + (postulacion.integrantes?.length || 0)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              postulacion.estado === "ENVIADA"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {postulacion.estado === "ENVIADA" ? "Enviada" : "Borrador"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {postulacion.createdAt
                            ? new Date(postulacion.createdAt).toLocaleString("es-CO")
                            : "-"}
                        </td>
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !error && postulacionSeleccionada && (
          <div className="bg-card rounded-xl border p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold">Detalle de postulación</h2>
              <p className="text-sm text-muted-foreground">
                {postulacionSeleccionada.tipo} · ID: {postulacionSeleccionada._id}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DetailItem
                label="Estado"
                value={postulacionSeleccionada.estado === "ENVIADA" ? "Enviada" : "Borrador"}
              />
              <DetailItem
                label="Fecha creación"
                value={
                  postulacionSeleccionada.createdAt
                    ? new Date(postulacionSeleccionada.createdAt).toLocaleString("es-CO")
                    : "-"
                }
              />
              <DetailItem
                label="Última actualización"
                value={
                  postulacionSeleccionada.updatedAt
                    ? new Date(postulacionSeleccionada.updatedAt).toLocaleString("es-CO")
                    : "-"
                }
              />
              <DetailItem
                label="Total integrantes"
                value={(1 + (postulacionSeleccionada.integrantes?.length || 0)).toString()}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <BoolItem label="Compromisos institucionales" value={postulacionSeleccionada.compromisosInstitucionales} />
              <BoolItem label="Autorización antecedentes" value={postulacionSeleccionada.autorizacionAntecedentes} />
              <BoolItem label="Responsabilidad líder" value={postulacionSeleccionada.responsabilidadLider} />
            </div>

            <IntegranteCard integrante={postulacionSeleccionada.lider} title="Líder" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Integrantes ({postulacionSeleccionada.integrantes?.length || 0})
              </h3>

              {(postulacionSeleccionada.integrantes?.length || 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No hay integrantes adicionales en esta postulación.</p>
              ) : (
                <div className="grid gap-4">
                  {(postulacionSeleccionada.integrantes || []).map((integrante, index) => (
                    <IntegranteCard
                      key={`${postulacionSeleccionada._id}-int-${index}-${integrante.cedula || "sin-cedula"}`}
                      integrante={integrante}
                      title={`Integrante ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function BoolItem({ label, value }: { label: string; value?: boolean }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ? "Sí" : "No"}</p>
    </div>
  );
}

function IntegranteCard({ integrante, title }: { integrante?: Integrante; title: string }) {
  if (!integrante) {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">Sin información</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">{title}</h3>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
        <Field label="Nombre" value={integrante.nombreCompleto} />
        <Field label="Cédula" value={integrante.cedula} />
        <Field label="Tipo" value={integrante.tipoIntegrante} />
        <Field label="Cargo empresa" value={integrante.cargoEmpresa} />
        <Field label="Sede trabajo" value={integrante.sedeTrabajo} />
        <Field label="Celular" value={integrante.celular} />
        <Field label="Correo" value={integrante.correo} />
        <Field label="Estado asociado" value={integrante.asociadoStatus} />
        <Field label="Motivo inhabilidad" value={integrante.motivoInhabilidad} />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Documentos PDF</p>
        <div className="grid gap-2 md:grid-cols-3">
          <DocumentoLink label="Cédula" archivo={integrante.adjuntoCedula} />
          <DocumentoLink label="Economía Solidaria" archivo={integrante.certificadoEconomiaSolidaria} />
          <DocumentoLink label="Formación Académica" archivo={integrante.soporteFormacionAcademica} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function DocumentoLink({ label, archivo }: { label: string; archivo?: ArchivoAdjunto }) {
  if (!archivo?.url) {
    return (
      <div className="border rounded-lg px-3 py-2 text-sm text-muted-foreground">
        {label}: No adjunto
      </div>
    );
  }

  const nombre = archivo.original_filename
    ? archivo.format && !archivo.original_filename.toLowerCase().endsWith(`.${archivo.format.toLowerCase()}`)
      ? `${archivo.original_filename}.${archivo.format}`
      : archivo.original_filename
    : `${label}.pdf`;

  const proxyPdfUrl = `/api/files/pdf?url=${encodeURIComponent(archivo.url)}`;

  return (
    <a
      href={proxyPdfUrl}
      target="_blank"
      rel="noreferrer"
      className="border rounded-lg px-3 py-2 text-sm text-primary hover:underline block"
    >
      {label}: {nombre}
    </a>
  );
}
