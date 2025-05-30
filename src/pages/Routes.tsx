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
import { Plus, Search, Eye, Edit, Trash2, XCircle } from "lucide-react"; // Importamos iconos necesarios
import { DataTable } from "@/components/shared/DataTable"; // Asegúrate de que este componente funcione correctamente

// Importaciones para el modal y formulario (usamos los de shadcn/ui)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Definimos una interfaz para un Waypoint como se recibe en la API GET
interface WaypointData {
  Lat: number;       // Asumimos Lat, Lng, Descripcion con mayúscula en la respuesta GET
  Lng: number;
  Descripcion: string;
}

// Definimos una interfaz para la ubicación Origen/Destino como se recibe en la API GET
interface LocationData {
  Lat: number;
  Lng: number;
}

// Definimos una interfaz para el tipo de datos de la Ruta *como se recibe de la API GET*
// Basándonos en tu código Go (structura domain.Route y handlers), asumimos
// que incluye ID y campos con mayúscula inicial en la respuesta JSON.
interface Route {
  ID: string; // Asumimos que la API devuelve ID (mayúscula)
  Nombre: string;
  Descripcion: string;
  Origen: LocationData; // Referencia a LocationData
  Destino: LocationData; // Referencia a LocationData
  ModoTransporte: string;
  Waypoints: WaypointData[]; // Array de WaypointData
}

// Definimos el tipo para un Waypoint *como espera el backend para POST/PUT*
// Según CreateRouteReq.Waypoints en Go, json tags son lat, lng, descripcion (minúsculas).
interface WaypointFormData {
  lat: number;       // DEBE coincidir con json:"lat" en Waypoint en Go
  lng: number;       // DEBE coincidir con json:"lng" en Waypoint en Go
  descripcion: string; // DEBE coincidir con json:"descripcion" en Waypoint en Go
}

// Definimos el tipo para los datos del formulario *como espera el backend para POST/PUT*
// Según CreateRouteReq en Go (json:"..."), debe ser con claves en minúsculas y campos planos.
interface RouteFormData {
  nombre: string;      // DEBE coincidir con json:"nombre"
  descripcion: string; // DEBE coincidir con json:"descripcion"
  modo_transporte: string; // DEBE coincidir con json:"modo_transporte"
  origen_lat: number;   // DEBE coincidir con json:"origen_lat"
  origen_lng: number;   // DEBE coincidir con json:"origen_lng"
  destino_lat: number;  // DEBE coincidir con json:"destino_lat"
  destino_lng: number;  // DEBE coincidir con json:"destino_lng"
  waypoints: WaypointFormData[]; // DEBE coincidir con json:"waypoints" (array con claves minúsculas)
}

const API_BASE_URL = "https://swift-brena-example1-7edebccb.koyeb.app"; // URL base de tu API

const Routes = () => {
  const [routes, setRoutes] = useState<Route[]>([]); // Usamos la interfaz Route
  const [loading, setLoading] = useState(true); // Iniciamos cargando
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | null>(
    null
  ); // 'add', 'edit', 'view'
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null); // Ruta seleccionada

  // Estado para el formulario (usando las claves en minúsculas esperadas por la API POST/PUT)
  const [formData, setFormData] = useState<RouteFormData>({
    nombre: "",
    descripcion: "",
    modo_transporte: "",
    origen_lat: 0,
    origen_lng: 0,
    destino_lat: 0,
    destino_lng: 0,
    waypoints: [], // Inicia con un array vacío
  });

  // Función para obtener las rutas
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/routes`);
      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Error fetching routes: ${res.status}`, errorBody);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Route[] = await res.json();
      // La API de Go devuelve objetos con ID, Nombre, etc. (mayúsculas)
      // Usamos esto directamente en el estado 'routes'
      setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
      // Podrías añadir un estado para mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  // Cargar rutas al montar el componente
  useEffect(() => {
    fetchRoutes();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Filtrado simple por nombre, descripción o modo de transporte
  const filteredRoutes = routes.filter(
    (route) =>
      route.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.Descripcion &&
        route.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (route.ModoTransporte &&
        route.ModoTransporte.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers para las acciones CRUD

  const handleAddClick = () => {
    setModalType("add");
    // Limpiar formulario con valores por defecto y claves correctas (minúsculas)
    setFormData({
      nombre: "",
      descripcion: "",
      modo_transporte: "",
      origen_lat: 0,
      origen_lng: 0,
      destino_lat: 0,
      destino_lng: 0,
      waypoints: [],
    });
    setSelectedRoute(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (route) => { // Recibe el objeto Route completo
    setSelectedRoute(route);
    // Mapear de las claves de la respuesta GET (mayúsculas/estructuradas)
    // a las claves del formulario (minúsculas/planas para coordenadas, estructuradas para waypoints con claves minúsculas)
    setFormData({
      nombre: route.Nombre,
      descripcion: route.Descripcion,
      modo_transporte: route.ModoTransporte,
      origen_lat: route.Origen?.Lat || 0, // Manejar si Origen es null/undefined
      origen_lng: route.Origen?.Lng || 0,
      destino_lat: route.Destino?.Lat || 0, // Manejar si Destino es null/undefined
      destino_lng: route.Destino?.Lng || 0,
      // Mapear Waypoints: claves de respuesta (Mayúscula) a claves de formulario (minúscula)
      waypoints: route.Waypoints?.map(wp => ({
        lat: wp.Lat,
        lng: wp.Lng,
        descripcion: wp.Descripcion,
      })) || [], // Manejar si Waypoints es null/undefined
    });
    setModalType("edit");
    setIsModalOpen(true);
  };

  const handleViewClick = (route) => { // Recibe el objeto Route completo
    setSelectedRoute(route);
    setModalType("view");
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (route) => { // Recibe el objeto Route completo
    // Verificamos el ID. Tu Go usa ID (mayúscula), accedemos a route.ID
    if (!route.ID) {
      console.error("Route ID is missing for deletion");
      alert("No se encontró el ID de la ruta para eliminar.");
      return;
    }

    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la ruta "${route.Nombre}"? Esta acción no se puede deshacer.`
    );
    if (!isConfirmed) {
      return; // El usuario canceló
    }

    setLoading(true); // Opcional: mostrar un estado de carga mientras elimina
    try {
      // Usa route.ID para la URL de eliminación, como tu Go espera DELETE /routes/:id
      const res = await fetch(`${API_BASE_URL}/routes/${route.ID}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Error deleting route: ${res.status}`, errorBody);
        alert(`Error eliminando ruta: ${res.status} - ${errorBody}`);
        return; // Salir si hay error
      }

      // Si la eliminación fue exitosa, refrescar la lista
      fetchRoutes(); // Esto establecerá loading en true y luego false de nuevo
      alert(`Ruta "${route.Nombre}" eliminada exitosamente.`);
    } catch (error) {
      console.error("Error deleting route:", error);
      alert(`Ocurrió un error en la red o en el servidor al eliminar la ruta.`);
    } finally {
       // fetchRoutes ya maneja setting loading back to false on success/failure
    }
  };

  // Handler genérico para cambios en los campos simples del formulario modal
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.name DEBE coincidir con las claves del estado formData (nombre, descripcion, etc.)
    const { name, value } = e.target;

    // Si el campo es un número (coordenadas), intentar convertir a float
    if (name === 'origen_lat' || name === 'origen_lng' || name === 'destino_lat' || name === 'destino_lng') {
        const numberValue = parseFloat(value);
        setFormData((prev) => ({ ...prev, [name]: isNaN(numberValue) ? 0 : numberValue })); // Usar 0 si no es un número válido
    } else {
        // Para campos de texto
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handlers específicos para waypoints
  const handleAddWaypoint = () => {
    setFormData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, { lat: 0, lng: 0, descripcion: '' }]
    }));
  };

  const handleRemoveWaypoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const handleWaypointChange = (index: number, field: keyof WaypointFormData, value: any) => {
    setFormData(prev => {
      const newWaypoints = [...prev.waypoints];
      // Convertir lat/lng a number si el campo es una coordenada
      newWaypoints[index][field] = (field === 'lat' || field === 'lng') ? parseFloat(value) || 0 : value;
      return { ...prev, waypoints: newWaypoints };
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos mínimos (requeridos según tu Go CreateRouteReq)
    if (
        !formData.nombre.trim() ||
        !formData.modo_transporte.trim() ||
        isNaN(formData.origen_lat) ||
        isNaN(formData.origen_lng) ||
        isNaN(formData.destino_lat) ||
        isNaN(formData.destino_lng)
       // Waypoints puede ser un array vacío, no es necesario validarlo si no es requerido
    ) {
      alert("Por favor, completa todos los campos obligatorios (Nombre, Modo de Transporte, Origen/Destino Lat/Lng).");
      return;
    }

    let url = `${API_BASE_URL}/routes`;
    let method = "POST";
    let routeId = selectedRoute?.ID; // Capturamos el ID si estamos editando

    // Si es edición y tenemos una ruta seleccionada con ID
    if (modalType === "edit" && routeId) { // <-- Usamos routeId para la edición
      url = `${API_BASE_URL}/routes/${routeId}`; // PUT /routes/:id
      method = "PUT";
    }

    setLoading(true); // Indicar que la operación está en curso
    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          // Añade aquí otros headers si son necesarios (e.g., Authorization)
        },
        body: JSON.stringify(formData), // Envía el objeto formData (con claves minúsculas/planas/estructuradas)
      });

      if (!res.ok) {
        const errorBody = await res.text(); // Leer respuesta de error
        console.error(`Error saving route: ${res.status}`, errorBody);
        // Mostrar mensaje de error del servidor si está disponible
        alert(`Error guardando ruta: ${res.status} - ${errorBody}`);
        return; // Salir si hay error
      }

      // Si la operación fue exitosa
      setIsModalOpen(false); // Cerrar modal
      fetchRoutes(); // Refrescar la lista (esto pondrá loading en true y luego false)
      alert(
        `Ruta ${modalType === "add" ? "agregada" : "actualizada"} exitosamente!`
      );
    } catch (error) {
      console.error("Error saving route:", error);
      alert(`Ocurrió un error en la red o en el servidor al guardar la ruta.`);
    } finally {
      // fetchRoutes ya maneja setting loading back to false on success/failure
    }
  };

  // Definición de columnas de la tabla
  // Los accessorKey o accessorFn deben coincidir con las claves/estructura *como se reciben* en los objetos 'Route' (mayúsculas)
  const columns = [
    { header: "Nombre", accessorKey: "Nombre" },      // <-- Accede a Nombre (mayúscula)
    { header: "Descripción", accessorKey: "Descripcion" }, // <-- Accede a Descripcion (mayúscula)
     {
      header: "Origen",
      accessorFn: (row: Route) => {
        // Accede a la estructura LocationData recibida de la API GET
        if (row.Origen?.Lat != null && row.Origen?.Lng != null) {
            // Limita los decimales para mostrar si es necesario
            return `Lat: ${row.Origen.Lat.toFixed(4)}, Lng: ${row.Origen.Lng.toFixed(4)}`;
        }
        return "N/A";
      },
    },
    {
      header: "Destino",
      accessorFn: (row: Route) => {
        // Accede a la estructura LocationData recibida de la API GET
        if (row.Destino?.Lat != null && row.Destino?.Lng != null) {
             // Limita los decimales para mostrar si es necesario
            return `Lat: ${row.Destino.Lat.toFixed(4)}, Lng: ${row.Destino.Lng.toFixed(4)}`;
        }
        return "N/A";
      },
    },
    { header: "Modo de Transporte", accessorKey: "ModoTransporte" },
     {
      header: "Waypoints",
      accessorFn: (row: Route) => {
        // Accede al array de WaypointData recibido de la API GET
         if (row.Waypoints && row.Waypoints.length > 0) {
            // Muestra un resumen, e.g., el número de waypoints
            return `${row.Waypoints.length} waypoint(s)`;
            // O si quieres detallar:
            // return row.Waypoints.map(wp => `${wp.Lat.toFixed(2)},${wp.Lng.toFixed(2)}`).join('; ');
         }
         return "None";
      },
    },
    {
      id: "actions",
      header: "Actions",
      // cell recibe { row } donde row.original es el objeto Route completo para esa fila
      cell: ({ row }: { row: { original: Route } }) => (
        <div className="flex items-center gap-2">
          {/* Pasamos row.original (el objeto Route completo) a los handlers */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewClick(row)}
            title="View"
          >
            <Eye className="h-4 w-4" /> {/* Icono de Ver */}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(row)}
            title="Edit"
          >
            <Edit className="h-4 w-4" /> {/* Icono de Editar */}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => handleDeleteClick(row)}
            title="Delete"
            // disabled={loading} // Opcional: deshabilitar botones mientras una operación de delete está en curso (la global 'loading' también cubre esto)
          >
            <Trash2 className="h-4 w-4" /> {/* Icono de Eliminar */}
          </Button>
        </div>
      ),
    },
  ];

  // Detectar si estamos en un estado de guardado (POST/PUT) distinto de la carga inicial
  const isSaving = loading && (modalType === 'add' || modalType === 'edit');

  return (
    <DashboardLayout>
      {/* Encabezado y botón Añadir */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Route Administration</h1>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Route
        </Button>
      </div>

      {/* Tarjeta principal con tabla y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
          <CardDescription>Manage all transportation routes in the system.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search routes by name, description or mode..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        {/* El contenido de la tarjeta, con el estado de carga y la DataTable */}
        <CardContent>
          {loading && modalType === null ? ( // Solo mostrar "Loading..." si es la carga inicial de la tabla
             <p className="text-center py-8">Loading routes...</p>
          ) : filteredRoutes.length === 0 && !loading ? ( // Mostrar mensaje si no hay rutas y no está cargando
            <p className="text-center py-8 text-muted-foreground">No routes found. Adjust search or add a new route.</p>
          ) : (
            <DataTable columns={columns} data={filteredRoutes} />
          )}
        </CardContent>
      </Card>

      {/* Modal para Añadir, Editar o Ver Ruta */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"> {/* Ajustar tamaño y añadir scroll */}
          <DialogHeader>
            <DialogTitle>
              {modalType === "add" && "Add New Route"}
              {/* Mostrar el Nombre si estamos editando o viendo, usando el Nombre (mayúscula) de la ruta seleccionada */}
              {modalType === "edit" && `Edit Route: ${selectedRoute?.Nombre || '...'}`}
              {modalType === "view" && `Route Details: ${selectedRoute?.Nombre || '...'}`}
            </DialogTitle>
          </DialogHeader>

          {/* Formulario para Añadir/Editar (modalType es 'add' o 'edit') */}
          {(modalType === "add" || modalType === "edit") && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Nombre y Descripción */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">Name</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleFormChange} className="col-span-3" required disabled={isSaving} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descripcion" className="text-right">Description</Label>
                  <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleFormChange} className="col-span-3" disabled={isSaving} />
                </div>
                 {/* Modo de Transporte */}
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="modo_transporte" className="text-right">Transport Mode</Label>
                  <Input id="modo_transporte" name="modo_transporte" value={formData.modo_transporte} onChange={handleFormChange} className="col-span-3" required disabled={isSaving} />
                </div>
                {/* Origen (Lat, Lng) */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Origin</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                         <Input id="origen_lat" name="origen_lat" type="number" step="any" placeholder="Latitude" value={formData.origen_lat} onChange={handleFormChange} required disabled={isSaving} />
                         <Input id="origen_lng" name="origen_lng" type="number" step="any" placeholder="Longitude" value={formData.origen_lng} onChange={handleFormChange} required disabled={isSaving} />
                    </div>
                </div>
                 {/* Destino (Lat, Lng) */}
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Destination</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                         <Input id="destino_lat" name="destino_lat" type="number" step="any" placeholder="Latitude" value={formData.destino_lat} onChange={handleFormChange} required disabled={isSaving} />
                         <Input id="destino_lng" name="destino_lng" type="number" step="any" placeholder="Longitude" value={formData.destino_lng} onChange={handleFormChange} required disabled={isSaving} />
                    </div>
                </div>

                 {/* Waypoints - UI dinámica */}
                 <div className="grid grid-cols-4 gap-4 items-start">
                    <Label className="text-right pt-2">Waypoints</Label>
                    <div className="col-span-3 flex flex-col gap-3">
                        {formData.waypoints.map((wp, index) => (
                            <div key={index} className="flex items-center gap-2 border rounded-md p-2">
                                <div className="grid grid-cols-3 gap-2 flex-grow">
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder={`Waypoint ${index + 1} Lat`}
                                        value={wp.lat}
                                        onChange={(e) => handleWaypointChange(index, 'lat', e.target.value)}
                                        required
                                        disabled={isSaving}
                                    />
                                     <Input
                                        type="number"
                                        step="any"
                                        placeholder={`Waypoint ${index + 1} Lng`}
                                        value={wp.lng}
                                        onChange={(e) => handleWaypointChange(index, 'lng', e.target.value)}
                                        required
                                        disabled={isSaving}
                                    />
                                     <Input
                                        type="text"
                                        placeholder={`Waypoint ${index + 1} Description (Optional)`}
                                        value={wp.descripcion}
                                        onChange={(e) => handleWaypointChange(index, 'descripcion', e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button" // Importante: no submit el formulario
                                    onClick={() => handleRemoveWaypoint(index)}
                                    disabled={isSaving}
                                >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" onClick={handleAddWaypoint} disabled={isSaving}>
                             <Plus className="h-4 w-4 mr-2" /> Add Waypoint
                        </Button>
                    </div>
                 </div>

              </div>
              <DialogFooter>
                {/* Deshabilitar el botón mientras estamos guardando */}
                <Button type="submit" disabled={isSaving}>
                   {isSaving ? (modalType === "add" ? "Adding..." : "Saving...") : (modalType === "add" ? "Add Route" : "Save changes")}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Vista de Detalles (modalType es 'view') */}
          {modalType === "view" && selectedRoute && (
            <div className="grid gap-4 py-4">
              {/* Mostramos los datos usando las claves TAL COMO SE RECIBEN del backend (mayúsculas/estructuradas) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">ID:</Label>
                <span className="col-span-3 break-all">{selectedRoute.ID}</span> {/* Muestra el ID */}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Name:</Label>
                <span className="col-span-3">{selectedRoute.Nombre}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-semibold">Description:</Label>
                <span className="col-span-3">{selectedRoute.Descripcion || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right font-semibold">Origin:</Label>
                 <span className="col-span-3">
                     {selectedRoute.Origen?.Lat != null && selectedRoute.Origen?.Lng != null
                         ? `Lat: ${selectedRoute.Origen.Lat}, Lng: ${selectedRoute.Origen.Lng}`
                         : "N/A"}
                 </span>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right font-semibold">Destination:</Label>
                 <span className="col-span-3">
                     {selectedRoute.Destino?.Lat != null && selectedRoute.Destino?.Lng != null
                         ? `Lat: ${selectedRoute.Destino.Lat}, Lng: ${selectedRoute.Destino.Lng}`
                         : "N/A"}
                 </span>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right font-semibold">Transport Mode:</Label>
                 <span className="col-span-3">{selectedRoute.ModoTransporte}</span>
              </div>
               {/* Mostrar Waypoints en vista de detalles */}
               {selectedRoute.Waypoints && selectedRoute.Waypoints.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 items-start">
                     <Label className="text-right font-semibold pt-2">Waypoints:</Label>
                     <div className="col-span-3 flex flex-col gap-2">
                         {selectedRoute.Waypoints.map((wp, index) => (
                            <div key={index} className="border rounded-md p-2 text-sm">
                                <strong>{`WP ${index + 1}:`}</strong>
                                {` Lat: ${wp.Lat.toFixed(4)}, Lng: ${wp.Lng.toFixed(4)}`}
                                {wp.Descripcion && ` - ${wp.Descripcion}`}
                            </div>
                         ))}
                     </div>
                  </div>
               )}

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

export default Routes;