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
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"; // Importamos iconos
import { DataTable } from "@/components/shared/DataTable"; // Asegúrate de que este componente funcione

// Importaciones para el modal y formulario
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Definimos una interfaz para el tipo de datos de la compañía *como se recibe de la API*
// Basándonos en el ejemplo de Buses, asumimos _id y las otras claves con la primera letra mayúscula.
interface Company {
  _id: string;
  Nombre: string;
  Descripcion: string;
}

// Definimos el tipo para los datos del formulario *como espera el backend para POST/PUT*
// Según CreateCompanyReq en Go, debe ser con claves en minúsculas.
interface CompanyFormData {
  nombre: string;      // DEBE coincidir con json:"nombre" en Go
  descripcion: string; // DEBE coincidir con json:"descripcion" en Go
}

const API_BASE_URL = "https://swift-brena-example1-7edebccb.koyeb.app"; // URL base de tu API

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true); // Iniciamos cargando
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | null>(
    null
  ); // 'add', 'edit', 'view'
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null); // Compañía seleccionada

  // Estado para el formulario (usando las claves en minúsculas esperadas por la API)
  const [formData, setFormData] = useState<CompanyFormData>({
    nombre: "",      // <-- Corregido a minúsculas
    descripcion: "", // <-- Corregido a minúsculas
  });

  // Función para obtener las compañías
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/companies`);
      if (!res.ok) {
        // Intentar leer el cuerpo del error si está disponible para más info
        const errorBody = await res.text();
        console.error(`Error fetching companies: ${res.status}`, errorBody);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Company[] = await res.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      // Podrías añadir un estado para mostrar un mensaje de error al usuario, e.g., setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  // Cargar compañías al montar el componente
  useEffect(() => {
    fetchCompanies();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Filtrado simple por nombre o descripción
  const filteredCompanies = companies.filter(
    (company) =>
      company.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.Descripcion &&
        company.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers para las acciones CRUD

  const handleAddClick = () => {
    setModalType("add");
    setFormData({ nombre: "", descripcion: "" }); // Limpiar formulario con claves correctas
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (company) => {
    setSelectedCompany(company);
    // Mapear de las claves de la respuesta (mayúsculas) a las claves del formulario (minúsculas)
    setFormData({
      nombre: company.Nombre,
      descripcion: company.Descripcion,
    });
    setModalType("edit");
    setIsModalOpen(true);
  };

  const handleViewClick = (company) => {
    setSelectedCompany(company);
    setModalType("view");
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (company) => {
    console.log(company);
    if (!company.ID) {
      console.error("Company ID is missing for deletion");
      // Muestra un error más amigable al usuario si es posible
      alert("No se encontró el ID de la compañía para eliminar.");
      return;
    }

    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la compañía "${company.Nombre}"?`
    );
    if (!isConfirmed) {
      return; // El usuario canceló
    }

    try {
      // Utiliza company._id para la URL de eliminación
      const res = await fetch(`${API_BASE_URL}/companies/${company.ID}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Error deleting company: ${res.status}`, errorBody);
        alert(`Error eliminando compañía: ${res.status} - ${errorBody}`);
        return; // Salir si hay error
      }

      // Si la eliminación fue exitosa
      // No leemos el cuerpo porque tu handler de Go solo devuelve un mensaje simple
      fetchCompanies(); // Refrescar la lista
      alert(`Compañía "${company.Nombre}" eliminada exitosamente.`);
    } catch (error) {
      console.error("Error deleting company:", error);
      alert(`Ocurrió un error en la red o en el servidor al eliminar la compañía.`);
    }
  };

  // El cambio de formulario ahora espera los nombres de campo correctos del input
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // 'name' aquí debe coincidir con los nombres de los input (nombre, descripcion)
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos mínimos (Nombre/nombre es requerido según tu Go)
    if (!formData.nombre) { // Validamos la clave correcta en el estado formData
      alert("Por favor, completa el campo Nombre.");
      return;
    }

    let url = `${API_BASE_URL}/companies`;
    let method = "POST";

    // Si es edición y tenemos un ID de compañía seleccionado
    if (modalType === "edit" && selectedCompany?._id) {
      url = `${API_BASE_URL}/companies/${selectedCompany._id}`; // Usamos el ID de la compañía seleccionada
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          // Añade aquí otros headers si son necesarios (e.g., Authorization)
        },
        body: JSON.stringify(formData), // Esto ahora envía { "nombre": "...", "descripcion": "..." }
      });

      if (!res.ok) {
        const errorBody = await res.text(); // Leer respuesta de error
        console.error(`Error saving company: ${res.status}`, errorBody);
        // Mostrar mensaje de error del servidor si está disponible
        alert(`Error guardando compañía: ${res.status} - ${errorBody}`);
        return; // Salir si hay error
      }

      // Si la operación fue exitosa
      // Tu backend para PUT/POST de compañías también parece devolver el objeto actualizado o un mensaje
      // const successData = await res.json(); // O res.text() si solo devuelve un mensaje
      setIsModalOpen(false); // Cerrar modal
      fetchCompanies(); // Refrescar la lista
      alert(
        `Compañía ${modalType === "add" ? "agregada" : "actualizada"} exitosamente!`
      );
    } catch (error) {
      console.error("Error saving company:", error);
      alert(`Ocurrió un error en la red o en el servidor al guardar la compañía.`);
    }
  };

  // Definición de columnas de la tabla
  // Estas columnas acceden a los datos *tal como se reciben de la API GET*
  const columns = [
    { header: "Nombre", accessorKey: "Nombre" },      // <-- Accede a Nombre (mayúscula)
    { header: "Descripción", accessorKey: "Descripcion" }, // <-- Accede a Descripcion (mayúscula)
    {
      id: "actions",
      header: "Acciones",
      // La célula recibe row.original, que es un objeto Company (con _id, Nombre, Descripcion)
      cell: ({ row }: { row: { original: Company } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewClick(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => {console.log(row); return handleDeleteClick(row);}}
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
        <h1 className="text-2xl font-bold">Gestionar Compañías</h1>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Nueva Compañía
        </Button>
      </div>

      {/* Tarjeta principal con tabla y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Compañías</CardTitle>
          <CardDescription>Gestiona las compañías de transporte en el sistema.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar compañías por nombre o descripción..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando compañías...</p>
          ) : (
            <DataTable columns={columns} data={filteredCompanies} />
          )}
        </CardContent>
      </Card>

      {/* Modal para Añadir, Editar o Ver Compañía */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalType === "add" && "Agregar Nueva Compañía"}
              {/* Mostrar el Nombre si estamos editando o viendo */}
              {modalType === "edit" && `Editar Compañía: ${selectedCompany?.Nombre || ''}`}
              {modalType === "view" && `Detalles de Compañía: ${selectedCompany?.Nombre || ''}`}
            </DialogTitle>
          </DialogHeader>

          {/* Formulario para Añadir/Editar */}
          {(modalType === "add" || modalType === "edit") && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Campo Nombre - input name debe coincidir con la clave en formData (nombre) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right"> {/* <-- Corregido htmlFor */}
                    Nombre
                  </Label>
                  <Input
                    id="nombre"        // <-- Corregido id
                    name="nombre"      // <-- Corregido name (CRUCIAL para handleFormChange y formData)
                    value={formData.nombre} // <-- Usa la clave correcta en formData
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* Campo Descripción - input name debe coincidir con la clave en formData (descripcion) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descripcion" className="text-right"> {/* <-- Corregido htmlFor */}
                    Descripción
                  </Label>
                  <Input
                    id="descripcion"      // <-- Corregido id
                    name="descripcion"    // <-- Corregido name (CRUCIAL)
                    value={formData.descripcion} // <-- Usa la clave correcta en formData
                    onChange={handleFormChange}
                    className="col-span-3"
                    // Descripción no es requerido en tu Go
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}> {/* Opcional: deshabilitar al cargar/enviar */}
                   {loading ? "Guardando..." : (modalType === "add" ? "Agregar Compañía" : "Guardar cambios")}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Vista de Detalles */}
          {modalType === "view" && selectedCompany && (
            <div className="grid gap-4 py-4">
              {/* Usamos las claves *tal como se reciben* para mostrar los detalles */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Nombre:</Label>
                <span className="col-span-3">{selectedCompany.Nombre}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Descripción:</Label>
                <span className="col-span-3">{selectedCompany.Descripcion || "N/A"}</span>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Companies;