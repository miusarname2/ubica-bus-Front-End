import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"; // Añadimos iconos para acciones
import { DataTable } from "@/components/shared/DataTable"; // Asegúrate de que este componente funcione correctamente

// Importaciones para el modal y formulario
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Definimos una interfaz para el tipo de datos del bus
interface Bus {
  _id: string; // Asumimos que el ID del backend es _id (común en MongoDB/Mongoose)
  Placa: string;
  ConductorID: string;
  RutaID: string;
  FechaInicio: string; // Mantenemos como string para la API original
  FechaFin: string; // Mantenemos como string para la API original
  FechaInicioFormatted: string; // Campo para mostrar formateado
  FechaFinFormatted: string; // Campo para mostrar formateado
}

// Definimos el tipo para los datos del formulario (puede ser ligeramente diferente si es necesario)
interface BusFormData {
  Placa: string;
  ConductorID: string;
  RutaID: string;
  FechaInicio: string; // Usaremos input type="datetime-local", que emite strings en formato YYYY-MM-DDTHH:mm
  FechaFin: string; // Usaremos input type="datetime-local"
}

const API_BASE_URL = "https://swift-brena-example1-7edebccb.koyeb.app"; // URL base de tu API

const Buses = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | null>(
    null
  ); // 'add', 'edit', 'view'
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null); // Bus seleccionado para editar/ver

  // Estado para el formulario
  const [formData, setFormData] = useState<BusFormData>({
    Placa: "",
    ConductorID: "",
    RutaID: "",
    FechaInicio: "", // Formato YYYY-MM-DDTHH:mm
    FechaFin: "", // Formato YYYY-MM-DDTHH:mm
  });

  // Función para formatear fechas
  const formatBusDates = (bus: any): Bus => {
    return {
      ...bus,
      FechaInicioFormatted: bus.FechaInicio
        ? new Date(bus.FechaInicio).toLocaleString()
        : "N/A",
      FechaFinFormatted: bus.FechaFin
        ? new Date(bus.FechaFin).toLocaleString()
        : "N/A",
    };
  };

  // Función para obtener los buses
  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/buses`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: any[] = await res.json();

      // Formatear fechas al cargar
      const busesFormatted = data.map(formatBusDates);
      setBuses(busesFormatted);
    } catch (error) {
      console.error("Error fetching buses:", error);
      // Podrías añadir un estado para mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  // Cargar buses al montar el componente
  useEffect(() => {
    fetchBuses();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Filtrado simple por placa o conductorID
  const filteredBuses = buses.filter(
    (bus) =>
      bus.Placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.ConductorID &&
        bus.ConductorID.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers para las acciones CRUD

  const handleAddClick = () => {
    setModalType("add");
    setFormData({
      Placa: "",
      ConductorID: "",
      RutaID: "",
      FechaInicio: "",
      FechaFin: "",
    });
    setSelectedBus(null);
    setIsModalOpen(true);
  };

  const handleEditClick = async (bus: Bus) => {
    // Opcional: podrías obtener los datos más recientes del bus desde la API aquí
    // Si no, usamos los datos que ya tenemos en la tabla (row.original)
    setSelectedBus(bus);
    setFormData({
      Placa: bus.Placa,
      ConductorID: bus.ConductorID,
      RutaID: bus.RutaID,
      // Formatear fechas para input type="datetime-local" (YYYY-MM-DDTHH:mm)
      FechaInicio: bus.FechaInicio
        ? new Date(bus.FechaInicio).toISOString().slice(0, 16)
        : "",
      FechaFin: bus.FechaFin
        ? new Date(bus.FechaFin).toISOString().slice(0, 16)
        : "",
    });
    setModalType("edit");
    setIsModalOpen(true);
  };

  const handleViewClick = (bus: Bus) => {
    setSelectedBus(bus);
    setModalType("view");
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (bus: Bus) => {
    if (!bus._id) {
      console.error("Bus ID is missing for deletion");
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to delete bus with Plate: ${bus.Placa}?`
    );
    if (!isConfirmed) {
      return; // User cancelled deletion
    }

    try {
      const res = await fetch(`${API_BASE_URL}/buses/${bus._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // Intentar leer el error del body si está disponible
        const errorBody = await res.text(); // Leer como texto primero
        console.error(`Error deleting bus: ${res.status}`, errorBody);
        // Podrías mostrar un toast o mensaje de error al usuario
        alert(`Error deleting bus: ${res.status} - ${errorBody}`);
        return;
      }

      // Si la eliminación fue exitosa, refrescar la lista
      fetchBuses();
      // Podrías mostrar un toast de éxito
      alert(`Bus with Plate ${bus.Placa} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting bus:", error);
      // Mostrar mensaje de error general
      alert(`An error occurred while deleting the bus.`);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos mínimos (esto es básico, podrías mejorarlo)
    if (
      !formData.Placa ||
      !formData.ConductorID ||
      !formData.RutaID ||
      !formData.FechaInicio ||
      !formData.FechaFin
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Preparar los datos para la API
    // Los campos de fecha en Go son `time.Time`. Input type="datetime-local"
    // produce "YYYY-MM-DDTHH:mm". La API de Go probablemente espera un formato
    // como ISO 8601, que incluye segundos y zona horaria. Convertimos a ISO string.
    const dataToSend = {
      Placa: formData.Placa,
      ConductorID: formData.ConductorID,
      RutaID: formData.RutaID,
      // Convertir a ISO string para la API de Go
      FechaInicio: new Date(formData.FechaInicio).toISOString(),
      FechaFin: new Date(formData.FechaFin).toISOString(),
    };

    let url = `${API_BASE_URL}/buses`;
    let method = "POST";

    if (modalType === "edit" && selectedBus?._id) {
      url = `${API_BASE_URL}/buses/${selectedBus._id}`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          // Añade aquí otros headers si son necesarios (e.g., Authorization)
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Error saving bus: ${res.status}`, errorBody);
        // Podrías mostrar un mensaje de error más específico
        alert(`Error saving bus: ${res.status} - ${errorBody}`);
        return;
      }

      // Si la operación fue exitosa
      setIsModalOpen(false); // Cerrar modal
      fetchBuses(); // Refrescar la lista de buses
      // Podrías mostrar un toast de éxito
      alert(
        `Bus ${modalType === "add" ? "added" : "updated"} successfully!`
      );
    } catch (error) {
      console.error("Error saving bus:", error);
      alert(`An error occurred while saving the bus.`);
    }
  };

  // Definición de columnas de la tabla
  const columns = [
    { header: "Placa", accessorKey: "Placa" },
    { header: "Conductor ID", accessorKey: "ConductorID" },
    { header: "Ruta ID", accessorKey: "RutaID" },
    { header: "Fecha Inicio", accessorKey: "FechaInicioFormatted" },
    { header: "Fecha Fin", accessorKey: "FechaFinFormatted" },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: { row: { original: Bus } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewClick(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Encabezado y botón Añadir */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Buses</h1>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Bus
        </Button>
      </div>

      {/* Tarjeta principal con tabla y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buses</CardTitle>
          <CardDescription>Manage all buses in your fleet.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando buses...</p>
          ) : (
            <DataTable columns={columns} data={filteredBuses} />
          )}
        </CardContent>
      </Card>

      {/* Modal para Añadir, Editar o Ver Bus */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalType === "add" && "Add New Bus"}
              {modalType === "edit" && `Edit Bus: ${selectedBus?.Placa}`}
              {modalType === "view" && `Bus Details: ${selectedBus?.Placa}`}
            </DialogTitle>
          </DialogHeader>
          {/* Formulario para Añadir/Editar */}
          {(modalType === "add" || modalType === "edit") && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="Placa" className="text-right">
                    Placa
                  </Label>
                  <Input
                    id="Placa"
                    name="Placa"
                    value={formData.Placa}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ConductorID" className="text-right">
                    Conductor ID
                  </Label>
                  <Input
                    id="ConductorID"
                    name="ConductorID"
                    value={formData.ConductorID}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="RutaID" className="text-right">
                    Ruta ID
                  </Label>
                  <Input
                    id="RutaID"
                    name="RutaID"
                    value={formData.RutaID}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="FechaInicio" className="text-right">
                    Fecha Inicio
                  </Label>
                  <Input
                    id="FechaInicio"
                    name="FechaInicio"
                    type="datetime-local" // Usa este tipo para fecha y hora
                    value={formData.FechaInicio}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="FechaFin" className="text-right">
                    Fecha Fin
                  </Label>
                  <Input
                    id="FechaFin"
                    name="FechaFin"
                    type="datetime-local" // Usa este tipo para fecha y hora
                    value={formData.FechaFin}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {modalType === "add" ? "Add Bus" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Vista de Detalles */}
          {modalType === "view" && selectedBus && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Placa:</Label>
                <span className="col-span-3">{selectedBus.Placa}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Conductor ID:</Label>
                <span className="col-span-3">{selectedBus.ConductorID}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Ruta ID:</Label>
                <span className="col-span-3">{selectedBus.RutaID}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Fecha Inicio:</Label>
                <span className="col-span-3">
                  {selectedBus.FechaInicioFormatted}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Fecha Fin:</Label>
                <span className="col-span-3">{selectedBus.FechaFinFormatted}</span>
              </div>
              {/* Puedes añadir más detalles si tu objeto Bus tiene más campos */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Buses;