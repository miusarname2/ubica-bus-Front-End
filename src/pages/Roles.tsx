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
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"; // Importamos iconos para acciones CRUD
import { DataTable } from "@/components/shared/DataTable"; // Asegúrate de que este componente funcione

// Importaciones para el modal y formulario (usamos los de shadcn/ui)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// Si tu DataTable no accede directamente a nested properties o necesita aplanar,
// podrías no necesitar los campos 'users' y 'permissions' en la interfaz principal,
// a menos que los traigas del backend. Por ahora, asumimos que solo necesitas los
// datos básicos para la tabla.

// Definimos una interfaz para el tipo de datos del Rol *como se recibe de la API GET*
// Asumimos que incluye un ID (probablemente _id o ID) y los campos con mayúscula inicial.
// Basándonos en el Go, parece que se llama ID (mayúscula). Si la respuesta JSON usa "_id", cámbialo.
interface Role {
  ID: string; // O _id: string; si la respuesta JSON lo usa
  Nombre: string;
  Descripcion: string;
  // Podrías añadir otros campos si la API GET los devuelve
  // users?: string[]; // Ejemplo: Si la API GET devuelve una lista de IDs de usuarios asociados
  // permissions?: string[]; // Ejemplo: Si la API GET devuelve una lista de IDs de permisos
}

// Definimos el tipo para los datos del formulario *como espera el backend para POST/PUT*
// Según CreateRoleReq en Go, debe ser con claves en minúsculas.
interface RoleFormData {
  nombre: string;      // DEBE coincidir con json:"nombre" en CreateRoleReq en Go
  descripcion: string; // DEBE coincidir con json:"descripcion" en CreateRoleReq en Go
}

const API_BASE_URL = "https://swift-brena-example1-7edebccb.koyeb.app"; // URL base de tu API

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]); // Usamos la interfaz Role
  const [loading, setLoading] = useState(true); // Iniciamos cargando
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | null>(
    null
  ); // 'add', 'edit', 'view'
  const [selectedRole, setSelectedRole] = useState<Role | null>(null); // Rol seleccionado

  // Estado para el formulario (usando las claves en minúsculas esperadas por la API POST/PUT)
  const [formData, setFormData] = useState<RoleFormData>({
    nombre: "",
    descripcion: "",
  });

  // Función para obtener los roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (!res.ok) {
        // Intentar leer el cuerpo del error si está disponible para más info
        const errorBody = await res.text();
        console.error(`Error fetching roles: ${res.status}`, errorBody);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Role[] = await res.json();
      // La API de Go devuelve objetos con ID, Nombre, Descripcion (mayúsculas)
      // Usamos esto directamente en el estado 'roles'
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      // Podrías añadir un estado para mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Filtrado simple por nombre o descripción
  const filteredRoles = roles.filter(
    (role) =>
      role.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.Descripcion &&
        role.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers para las acciones CRUD

  const handleAddClick = () => {
    setModalType("add");
    setFormData({ nombre: "", descripcion: "" }); // Limpiar formulario con claves correctas (minúsculas)
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (role) => { // Recibe el objeto Role completo
    setSelectedRole(role);
    // Mapear de las claves de la respuesta GET (mayúsculas) a las claves del formulario (minúsculas)
    setFormData({
      nombre: role.Nombre,
      descripcion: role.Descripcion,
    });
    setModalType("edit");
    setIsModalOpen(true);
  };

  const handleViewClick = (role) => { // Recibe el objeto Role completo
    setSelectedRole(role);
    setModalType("view");
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (role) => { // Recibe el objeto Role completo
    // Verificamos el ID. Tu Go usa ID (mayúscula), tu tabla usa accessorKey Nombre,
    // pero necesitamos el ID para la eliminación. Accedemos a role.ID
    if (!role.ID) { // <-- Usamos role.ID basado en la interfaz y el Go
      console.error("Role ID is missing for deletion");
      alert("No se encontró el ID del rol para eliminar.");
      return;
    }

    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el rol "${role.Nombre}"?`
    );
    if (!isConfirmed) {
      return; // El usuario canceló
    }

    try {
      // Usa role.ID para la URL de eliminación, como tu Go espera
      const res = await fetch(`${API_BASE_URL}/roles/${role.ID}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Error deleting role: ${res.status}`, errorBody);
        alert(`Error eliminando rol: ${res.status} - ${errorBody}`);
        return; // Salir si hay error
      }

      // Si la eliminación fue exitosa, refrescar la lista
      fetchRoles();
      alert(`Rol "${role.Nombre}" eliminado exitosamente.`);
    } catch (error) {
      console.error("Error deleting role:", error);
      alert(`Ocurrió un error en la red o en el servidor al eliminar el rol.`);
    }
  };

  // Handler genérico para cambios en los campos del formulario modal
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.name DEBE coincidir con las claves del estado formData (nombre, descripcion)
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos mínimos (nombre es requerido según tu Go CreateRoleReq)
    if (!formData.nombre) { // Validamos la clave 'nombre' en minúsculas
      alert("Por favor, completa el campo Nombre.");
      return;
    }

    let url = `${API_BASE_URL}/roles`;
    let method = "POST";

    // Si es edición y tenemos un rol seleccionado con ID
    if (modalType === "edit" && selectedRole?.ID) { // <-- Usamos selectedRole.ID para la edición
      url = `${API_BASE_URL}/roles/${selectedRole.ID}`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          // Añade aquí otros headers si son necesarios (e.g., Authorization)
        },
        body: JSON.stringify(formData), // Envía { "nombre": "...", "descripcion": "..." } en minúsculas
      });

      if (!res.ok) {
        const errorBody = await res.text(); // Leer respuesta de error
        console.error(`Error saving role: ${res.status}`, errorBody);
        alert(`Error guardando rol: ${res.status} - ${errorBody}`);
        return; // Salir si hay error
      }

      // Si la operación fue exitosa
      setIsModalOpen(false); // Cerrar modal
      fetchRoles(); // Refrescar la lista
      alert(
        `Rol ${modalType === "add" ? "agregado" : "actualizado"} exitosamente!`
      );
    } catch (error) {
      console.error("Error saving role:", error);
      alert(`Ocurrió un error en la red o en el servidor al guardar el rol.`);
    }
  };

  // Definición de columnas de la tabla
  // Los accessorKey deben coincidir con las claves *como se reciben* en los objetos 'Role'
  const columns = [
    { header: "Role Name", accessorKey: "Nombre" },      // <-- Accede a Nombre (mayúscula)
    { header: "Description", accessorKey: "Descripcion" }, // <-- Accede a Descripcion (mayúscula)
    // Si la API GET no devuelve 'users' y 'permissions' directamente en el objeto Role,
    // estas columnas no mostrarán datos a menos que modifiques fetchRoles para enriquecerlos
    // o uses otra API. Por ahora, las quitamos o déjalas si tu API sí los devuelve.
    // { header: "Users", accessorKey: "users" },
    // { header: "Permissions", accessorKey: "permissions" },
    {
      id: "actions",
      header: "Actions",
      // cell recibe { row } donde row.original es el objeto Role completo para esa fila
      cell: ({ row }: { row: { original: Role } }) => (
        <div className="flex items-center gap-2">
          {/* Pasamos row.original (el objeto Role completo) a los handlers */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewClick(row)}
          >
            <Eye className="h-4 w-4" /> {/* Icono de Ver */}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(row)}
          >
            <Edit className="h-4 w-4" /> {/* Icono de Editar */}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10" // Estilo para Eliminar
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 className="h-4 w-4" /> {/* Icono de Eliminar */}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Encabezado y botón Añadir */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Roles</h1>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Role
        </Button>
      </div>

      {/* Tarjeta principal con tabla y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage system roles and permissions.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading roles...</p>
          ) : (
            <DataTable columns={columns} data={filteredRoles} />
          )}
        </CardContent>
      </Card>

      {/* Modal para Añadir, Editar o Ver Rol */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalType === "add" && "Add New Role"}
              {/* Mostrar el Nombre si estamos editando o viendo, usando el Nombre (mayúscula) del rol seleccionado */}
              {modalType === "edit" && `Edit Role: ${selectedRole?.Nombre || ''}`}
              {modalType === "view" && `Role Details: ${selectedRole?.Nombre || ''}`}
            </DialogTitle>
          </DialogHeader>

          {/* Formulario para Añadir/Editar (modalType es 'add' o 'edit') */}
          {(modalType === "add" || modalType === "edit") && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Campo Nombre - input name debe coincidir con la clave en formData (nombre) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right"> {/* htmlFor y name deben coincidir con la clave en formData */}
                    Name
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre" // Clave esperada por formData y backend para POST/PUT
                    value={formData.nombre} // Valor del estado
                    onChange={handleFormChange}
                    className="col-span-3"
                    required // Requerido por tu Go
                  />
                </div>
                {/* Campo Descripción - input name debe coincidir con la clave en formData (descripcion) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descripcion" className="text-right"> {/* htmlFor y name deben coincidir con la clave en formData */}
                    Description
                  </Label>
                  <Input
                    id="descripcion"
                    name="descripcion" // Clave esperada por formData y backend para POST/PUT
                    value={formData.descripcion} // Valor del estado
                    onChange={handleFormChange}
                    className="col-span-3"
                    // No es requerido por tu Go, no ponemos 'required' aquí
                  />
                </div>
                 {/* Otros campos de Role, si existen en el formulario */}
                 {/* Por ejemplo, si hubiera asignación de permisos aquí */}
                 {/* <div className="grid grid-cols-4 items-center gap-4">...</div> */}
              </div>
              <DialogFooter>
                {/* Deshabilitar el botón si estamos cargando/enviando */}
                <Button type="submit" disabled={loading}>
                   {loading ? "Saving..." : (modalType === "add" ? "Add Role" : "Save changes")}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Vista de Detalles (modalType es 'view') */}
          {modalType === "view" && selectedRole && (
            <div className="grid gap-4 py-4">
              {/* Mostramos los datos usando las claves TAL COMO SE RECIBEN del backend (mayúsculas) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">ID:</Label> {/* Opcional mostrar ID */}
                <span className="col-span-3">{selectedRole.ID}</span> {/* Usa ID */}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Name:</Label>
                <span className="col-span-3">{selectedRole.Nombre}</span> {/* Usa Nombre */}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Description:</Label>
                <span className="col-span-3">{selectedRole.Descripcion || "N/A"}</span> {/* Usa Descripcion */}
              </div>
              {/* Mostrar otros detalles si se recuperan con GET, e.g., lista de usuarios, permisos */}
              {/* <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right font-semibold">Users:</Label>
                    <span className="col-span-3">
                        {selectedRole.users && selectedRole.users.length > 0
                           ? selectedRole.users.join(', ') : 'None'}
                    </span>
                 </div>
              */}
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

export default Roles;