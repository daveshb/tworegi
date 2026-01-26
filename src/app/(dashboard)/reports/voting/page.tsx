"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Vote, Users, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

type VoteData = {
  _id: string;
  candidateName: string;
  candidateZone: string;
  votes: number;
}

type VoteSummary = {
  totalVotes: number;
  totalCandidates: number;
  votesByZone: {
    [key: string]: number;
  };
  votesByCandidate: VoteData[];
}

const ZONES = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6'];

export default function VotingPage() {
  const router = useRouter();
  const [voteSummary, setVoteSummary] = useState<VoteSummary | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVotingData();
  }, []);

  const fetchVotingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/votes');
      if (!response.ok) throw new Error('Error al cargar los datos de votación');
      const data = await response.json();
      setVoteSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = voteSummary?.votesByCandidate?.filter(
    candidate => selectedZone === 'all' || candidate.candidateZone === selectedZone
  ) || [];

  const zoneVotes = selectedZone === 'all' 
    ? voteSummary?.totalVotes || 0
    : voteSummary?.votesByZone[selectedZone] || 0;

  const maxVotes = filteredCandidates.length > 0 
    ? Math.max(...filteredCandidates.map(c => c.votes))
    : 1;

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/reports')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Reportes
            </Button>
            <Button
              onClick={fetchVotingData}
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🗳️ Votación de Delegados
          </h1>
          <p className="text-slate-600 text-lg">
            Resultados en tiempo real de la votación electoral
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold">Total de Votos</p>
                <p className="text-4xl font-bold mt-2 text-slate-900">
                  {loading ? '-' : voteSummary?.totalVotes || 0}
                </p>
              </div>
              <Vote className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold">Candidatos</p>
                <p className="text-4xl font-bold mt-2 text-slate-900">
                  {loading ? '-' : voteSummary?.totalCandidates || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold">Participación</p>
                <p className="text-4xl font-bold mt-2 text-slate-900">
                  {loading ? '-' : voteSummary && voteSummary.totalVotes > 0 
                    ? `${((voteSummary.totalVotes / (voteSummary.totalCandidates * 10)) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-400" />
            </div>
          </div>
        </div>

        {/* Zone Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Filtrar por Zona</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedZone('all')}
              className={selectedZone === 'all' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'}
            >
              Todas las Zonas
            </Button>
            {ZONES.map(zone => (
              <Button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={selectedZone === zone 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'}
              >
                {zone}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-2" />
            <p className="text-slate-700 font-medium">Cargando resultados...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-8 text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Candidates Results */}
        {!loading && !error && (
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Resultados de Votación {selectedZone !== 'all' && `- ${selectedZone}`}
            </h2>

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">
                  No hay votos registrados {selectedZone !== 'all' && `en ${selectedZone}`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCandidates.sort((a, b) => b.votes - a.votes).map((candidate, index) => (
                  <div key={candidate._id} className="flex items-end gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold text-slate-900 w-6">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {candidate.candidateName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {candidate.candidateZone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden border border-slate-300">
                          <div
                            className="bg-linear-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 flex items-center justify-end pr-3"
                            style={{
                              width: `${(candidate.votes / maxVotes) * 100}%`,
                              minWidth: candidate.votes > 0 ? '30px' : '0px'
                            }}
                          >
                            {candidate.votes > 0 && (
                              <span className="text-white font-bold text-sm">
                                {candidate.votes}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-slate-900 font-bold w-12 text-right">
                          {candidate.votes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Stats */}
            {filteredCandidates.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Votos (Zona)</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {zoneVotes}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-medium">Candidatos (Zona)</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {filteredCandidates.length}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-medium">Promedio Votos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(zoneVotes / filteredCandidates.length).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-medium">Candidato Líder</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {filteredCandidates[0]?.votes || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
