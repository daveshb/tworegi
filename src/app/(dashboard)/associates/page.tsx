"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import CreateAssociateModal from "@/components/associates/create-associate-modal";
import EditAssociateModal from "@/components/associates/edit-associate-modal";
import SearchAssociates from "@/components/associates/search-associates";

interface Associate {
  _id: string;
  fullName: string;
  cedula: string;
  joinDate: string;
  electoralZone: string;
  email: string;
  cellPhone: string;
  isActive: boolean;
}

export default function AssociatesPage() {
  const router = useRouter();
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState<Associate | null>(null);

  const fetchAssociates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/associates");

      if (!response.ok) {
        throw new Error("Failed to fetch associates");
      }

      const data = await response.json();
      setAssociates(data.data || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociates();
  }, []);

  const handleCreateSuccess = () => {
    fetchAssociates();
  };

  return (
    <div className="min-h-screen bg-voting-gradient">
      {/* Header */}
      <header className="border-b bg-card-50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="w-10 h-10 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manage Associates</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all registered associates
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Associates ({associates.length})
          </h2>
          <Button
            className="bg-button-gradient text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Associate
          </Button>
        </div>

        <div className="mb-6 max-w-sm">
          <SearchAssociates 
            onSearch={setAssociates}
            onLoading={setLoading}
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground">Loading associates...</p>
          </div>
        ) : associates.length === 0 ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No associates registered yet
            </p>
            <Button
              className="bg-button-gradient text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Associate
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/5 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Cedula
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Cell Phone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Electoral Zone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {associates.map((associate) => (
                    <tr
                      key={associate._id}
                      className="border-b hover:bg-muted/5 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium">
                        {associate.fullName}
                      </td>
                      <td className="px-6 py-3 text-sm">{associate.cedula}</td>
                      <td className="px-6 py-3 text-sm">{associate.email}</td>
                      <td className="px-6 py-3 text-sm">
                        {associate.cellPhone}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {associate.electoralZone}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            associate.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {associate.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {new Date(associate.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAssociate(associate);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <CreateAssociateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      <EditAssociateModal
        isOpen={isEditModalOpen}
        associate={selectedAssociate}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAssociate(null);
        }}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
