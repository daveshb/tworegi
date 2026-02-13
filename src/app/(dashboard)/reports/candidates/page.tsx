"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Loader2, Mail, Phone, MapPin, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

type Candidate = {
  _id: string;
  fullName: string;
  cedula: string;
  electoralZone: string;
  email: string;
  cellPhone: string;
  imageUrl?: string;
  proposalDescription?: string;
  position?: string;
  locality?: string;
};

type CandidatesByZone = {
  [key: string]: Candidate[];
};

const ZONES = [
  'FONCOR',
  'COLCERAMICA',
  'EX-CORONAS',
  'ALMACENES CORONA',
  'LOGISTICA Y TRANSPORTE',
  'OTROS'
];

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('all');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/candidates");
      if (!response.ok) throw new Error("Error al cargar candidatos");
      const data = await response.json();
      setCandidates(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Agrupar candidatos por zona
  const candidatesByZone: CandidatesByZone = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.electoralZone]) {
      acc[candidate.electoralZone] = [];
    }
    acc[candidate.electoralZone].push(candidate);
    return acc;
  }, {} as CandidatesByZone);

  // Filtrar candidatos según la zona seleccionada
  const displayZones = selectedZone === 'all' ? ZONES : [selectedZone];
  const filteredCandidates = displayZones.reduce((acc, zone) => {
    if (candidatesByZone[zone]) {
      acc[zone] = candidatesByZone[zone];
    }
    return acc;
  }, {} as CandidatesByZone);

  const totalCandidates = candidates.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => router.push("/reports")}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Reportes
            </Button>
            <Button
              onClick={fetchCandidates}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            👥 Candidatos Postulados
          </h1>
          <p className="text-slate-600 text-lg">
            Lista de todos los asociados que se han postulado para delegados
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">Total de Candidatos</p>
              <p className="text-4xl font-bold mt-2 text-slate-900">
                {loading ? '-' : totalCandidates}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        {/* Zone Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Filtrar por Zona</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedZone('all')}
              className={`cursor-pointer ${
                selectedZone === 'all' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              Todas las Zonas {totalCandidates > 0 && `(${totalCandidates})`}
            </Button>
            {ZONES.map(zone => {
              const zoneCount = candidatesByZone[zone]?.length || 0;
              return (
                <Button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`cursor-pointer ${
                    selectedZone === zone 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                  disabled={zoneCount === 0}
                >
                  {zone} {zoneCount > 0 && `(${zoneCount})`}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-2" />
            <p className="text-slate-700 font-medium">Cargando candidatos...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-8 text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Candidates by Zone */}
        {!loading && !error && (
          <div className="space-y-8">
            {Object.entries(filteredCandidates).map(([zone, zoneCandidates]) => (
              <div key={zone} className="bg-white rounded-xl p-8 border border-slate-200 shadow-md">
                <div className="mb-6 pb-4 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {zone}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {zoneCandidates.length} candidato{zoneCandidates.length !== 1 ? 's' : ''} en esta zona
                  </p>
                </div>

                {zoneCandidates.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg font-medium">
                      No hay candidatos en esta zona
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {zoneCandidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        {/* Candidate Image */}
                        <div className="mb-4">
                          {candidate.imageUrl ? (
                            <Image
                              src={candidate.imageUrl}
                              alt={candidate.fullName}
                              width={400}
                              height={320}
                              className="w-full h-80 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-80 bg-slate-200 rounded-lg flex items-center justify-center">
                              <Users className="w-12 h-12 text-slate-400" />
                            </div>
                          )}
                        </div>

                        {/* Candidate Info */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {candidate.fullName}
                            </h3>
                            {candidate.position && (
                              <p className="text-sm text-slate-600 mt-1">
                                {candidate.position}
                              </p>
                            )}
                          </div>

                          {/* Cedula */}
                          <div className="flex items-center text-sm text-slate-600">
                            <span className="font-medium mr-2">Cédula:</span>
                            <span>{candidate.cedula}</span>
                          </div>

                          {/* Locality */}
                          {candidate.locality && (
                            <div className="flex items-center text-sm text-slate-600">
                              <MapPin className="w-4 h-4 mr-2 shrink-0" />
                              <span>{candidate.locality}</span>
                            </div>
                          )}

                          {/* Proposal */}
                          {candidate.proposalDescription && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-700 line-clamp-3">
                                  {candidate.proposalDescription}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Contact Info */}
                          <div className="space-y-2 pt-3 border-t border-slate-200">
                            <a
                              href={`mailto:${candidate.email}`}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              {candidate.email}
                            </a>
                            <a
                              href={`tel:${candidate.cellPhone}`}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              {candidate.cellPhone}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {Object.keys(filteredCandidates).length === 0 && !loading && (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  No hay candidatos registrados
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
