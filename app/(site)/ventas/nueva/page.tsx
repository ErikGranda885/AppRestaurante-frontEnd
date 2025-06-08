"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { ModalPagoEfectivo } from "@/components/shared/compras/ui/modalPagoEfe";
import { ToastError } from "@/components/shared/toast/toastError";
import { ToastSuccess } from "@/components/shared/toast/toastSuccess";
import Preloader from "@/components/shared/varios/preloader";
import ComprobanteCamara from "@/components/shared/ventas/ui/comprobanteCamara";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { uploadImage } from "@/firebase/subirImage";
import { useConfiguracionesVentas } from "@/hooks/configuraciones/generales/useConfiguracionesVentas";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useSocket } from "@/hooks/useSocket";
import { socket } from "@/lib/socket";
import { ICategory, IProduct } from "@/lib/types";
import { SERVICIOS_AUTH } from "@/services/auth.service";
import { SERVICIOS_INVENTARIO } from "@/services/inventario.service";
import { SERVICIOS_PRODUCTOS } from "@/services/productos.service";
import { safePrice } from "@/utils/format";
import { format } from "date-fns";
import { Banknote, Pencil, Save, Search, Smartphone } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

interface IExtendedProduct extends IProduct {
  special?: boolean;
}

// Almacena solo el id del producto y la cantidad
interface OrderItem {
  productId: number;
  quantity: number;
}
// ---------------------
// COMPONENTE PRINCIPAL
// ---------------------
export default function Page() {
  useProtectedRoute();
  const { ventasConfig, loading: loadingVentas } = useConfiguracionesVentas();

  // Estados para productos, orden y filtros
  const [idUsuario, setIdUsuario] = useState<number>(0);
  const [products, setProducts] = useState<IExtendedProduct[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [metodoPago, setMetodoPago] = useState<"transferencia" | "efectivo">(
    "efectivo",
  );
  const [pagoEfectivoConfirmado, setPagoEfectivoConfirmado] = useState(false);
  const [pagoTransferenciaConfirmado, setPagoTransferenciaConfirmado] =
    useState(false);

  const [mostrarEfectivoModal, setMostarEfectivoModal] = useState(false);
  const [efectivoRecibido, setEfectivoRecibido] = useState<number | null>(null);
  const [efectivoCambio, setEfectivoCambio] = useState<number>(0);
  const [fotoTomada, setFotoTomada] = useState<string | null>(null);

  const [showLoader, setShowLoader] = useState(true);
  const [comprobanteNumero, setComprobanteNumero] = useState("");
  const [comprobanteImagen, setComprobanteImagen] = useState<File | null>(null);
  const [showDialogComprobante, setShowDialogComprobante] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Estados para información del cliente
  const [customerName, setCustomerName] = useState("Erik Granda");
  const [tableInfo, setTableInfo] = useState("Orden para llevar");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [tempName, setTempName] = useState(customerName);
  const [tempTable, setTempTable] = useState(tableInfo);
  const detenerCamaraRef = useRef<() => void>(() => {});

  // Funciones para editar información del cliente
  const handleOpenCustomerForm = () => {
    setTempName(customerName);
    setTempTable(tableInfo);
    setShowCustomerForm(true);
  };
  const handleCloseCustomerForm = () => setShowCustomerForm(false);
  const handleSaveCustomerForm = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerName(tempName);
    setTableInfo(tempTable);
    setShowCustomerForm(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 400); // puedes ajustar este valor si deseas

    return () => clearTimeout(timer);
  }, []);

  // Cargar productos desde la API de inventario
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(SERVICIOS_INVENTARIO.productosConStock);
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("La respuesta esperada debe ser un arreglo:", data);
        return;
      }

      const activeProducts = data.filter(
        (producto: any) =>
          producto.est_prod === "Activo" &&
          ["Directo", "Transformado", "Combo"].includes(producto.tip_prod),
      );

      setProducts(activeProducts);
    } catch (error) {
      console.error("Error al cargar los productos desde inventario:", error);
    }
  }, []);
  useEffect(() => {
    fetchProducts(); // ✅ solo lo llama al montar
  }, [fetchProducts]);

  useSocket("productos-actualizados", fetchProducts); // ✅ hook bien usado
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(SERVICIOS_PRODUCTOS.categorias);
      const result = await response.json();
      const data: ICategory[] = result.categorias || [];

      const activeCategories = data.filter((cat) => cat.est_cate === "Activo");
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error al cargar las categorías:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories(); // 🔁 al montar
  }, [fetchCategories]);

  useSocket("categorias-actualizadas", fetchCategories); // ✅ escucha WebSocket

  useEffect(() => {
    async function obtenerUsuario() {
      try {
        const res = await fetch(SERVICIOS_AUTH.me, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("No autorizado");

        const usuario = await res.json();
        setIdUsuario(usuario.id_usu ?? 0);
      } catch (error) {
        console.error("Error al obtener usuario autenticado:", error);
      }
    }

    obtenerUsuario();
  }, []);

  // Filtrar productos según categoría y búsqueda
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => !p.special);
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(
        (p) => p.cate_prod?.nom_cate === selectedCategory,
      );
    }
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.nom_prod.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Función para obtener la cantidad en el carrito de un producto
  const getCartQuantity = (productId: number) => {
    const item = orderItems.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  // Referencia para evitar incrementos concurrentes
  const incrementLockRef = useRef(false);

  // Manejo de incremento: solo almacena productId y cantidad
  const handleIncrement = (productId: number) => {
    if (incrementLockRef.current) return;
    incrementLockRef.current = true;

    const found = products.find((p) => p.id_prod === productId);
    if (!found) {
      incrementLockRef.current = false;
      return;
    }

    setOrderItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId);
      if (idx === -1) {
        return [...prev, { productId, quantity: 1 }];
      } else {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id_prod === productId ? { ...p, stock_prod: p.stock_prod - 1 } : p,
      ),
    );

    setTimeout(() => {
      incrementLockRef.current = false;
    }, 0);
  };

  // Manejo de decremento: actualiza carrito y stock en products
  const handleDecrement = (productId: number) => {
    const idx = orderItems.findIndex((i) => i.productId === productId);
    if (idx === -1) return;

    const currentQuantity = orderItems[idx].quantity;
    if (currentQuantity > 1) {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        ),
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.id_prod === productId ? { ...p, stock_prod: p.stock_prod + 1 } : p,
        ),
      );
    } else {
      setOrderItems((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
      // Al decrementar a 0, se devuelve el stock: se suma la cantidad eliminada
      setProducts((prev) =>
        prev.map((p) =>
          p.id_prod === productId
            ? { ...p, stock_prod: p.stock_prod + currentQuantity }
            : p,
        ),
      );
    }
  };

  // Manejo de eliminación: al eliminar se devuelve el stock de la cantidad eliminada
  const handleRemove = (productId: number) => {
    const itemToRemove = orderItems.find((i) => i.productId === productId);
    if (!itemToRemove) return;
    setOrderItems((prev) =>
      prev.filter((item) => item.productId !== productId),
    );
    setProducts((prev) =>
      prev.map((p) =>
        p.id_prod === productId
          ? { ...p, stock_prod: p.stock_prod + itemToRemove.quantity }
          : p,
      ),
    );
  };

  // Cálculo del subtotal, tax y total
  const subtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => {
      const prod = products.find((p) => p.id_prod === item.productId);
      if (!prod) return acc;
      return acc + prod.prec_vent_prod * item.quantity;
    }, 0);
  }, [orderItems, products]);

  const taxableSubtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => {
      const prod = products.find((p) => p.id_prod === item.productId);
      if (!prod) return acc;
      return acc + prod.prec_vent_prod * item.quantity;
    }, 0);
  }, [orderItems, products]);

  // Por ejemplo, si el IVA es del 15%
  const tax = taxableSubtotal * (ventasConfig.porcentaje_iva / 100);
  const discountGlobal = 0;
  const total = subtotal + tax - discountGlobal;
  /* Cargar comprobante si es transferencia */
  useEffect(() => {
    if (metodoPago === "transferencia") {
      setShowDialogComprobante(true);
    } else {
      setShowDialogComprobante(false);
    }
  }, [metodoPago]);

  async function subirComprobanteTransferencia(
    archivo: File,
    idVenta: number,
    nombreCliente: string,
  ) {
    const fechaHoy = format(new Date(), "yyyy-MM-dd");
    const nombreNormalizado = nombreCliente
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    const nombreArchivo = `venta_${idVenta}_${nombreNormalizado}_${fechaHoy}`;

    const url = await uploadImage(
      archivo,
      `comprobantes/${fechaHoy}`,
      nombreArchivo,
    );
    return url;
  }
  // Función para enviar la orden a la API integrando ventas, detalles y actualización de stock
  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      ToastError({ message: "No hay productos en la orden." });
      return;
    }

    if (loadingVentas) {
      ToastError({
        message: "Cargando configuraciones, intenta en un momento.",
      });
      return;
    }

    // Validación para transferencia
    if (
      metodoPago === "transferencia" &&
      (!comprobanteNumero || !comprobanteImagen)
    ) {
      ToastError({
        message:
          "Debes ingresar el número de comprobante y subir la imagen para completar la transferencia.",
      });
      return;
    }

    const startTime = performance.now(); // ⏱️ inicio

    try {
      let urlImg = "";
      if (metodoPago === "transferencia") {
        urlImg = await subirComprobanteTransferencia(
          comprobanteImagen!,
          Date.now(),
          customerName,
        );
      }

      const iva = ventasConfig.porcentaje_iva ?? 12;
      const taxableSubtotal = orderItems.reduce((acc, item) => {
        const prod = products.find((p) => p.id_prod === item.productId);
        if (!prod) return acc;
        return acc + prod.prec_vent_prod * item.quantity;
      }, 0);

      const taxAmount = taxableSubtotal * (iva / 100);
      const totalWithTax = taxableSubtotal + taxAmount;

      const salePayload = {
        tot_vent: totalWithTax,
        fech_vent: new Date().toISOString(),
        est_vent: metodoPago === "transferencia" ? "Por validar" : "Sin cerrar",
        tip_pag_vent: metodoPago,
        usu_vent: idUsuario,
        comprobante_num_vent:
          metodoPago === "transferencia" ? comprobanteNumero : null,
        comprobante_img_vent: metodoPago === "transferencia" ? urlImg : null,
        efe_recibido_vent: metodoPago === "efectivo" ? efectivoRecibido : null,
        efe_cambio_vent: metodoPago === "efectivo" ? efectivoCambio : null,
      };

      const saleResponse = await fetch("http://localhost:5000/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salePayload),
      });

      if (!saleResponse.ok) {
        const errorData = await saleResponse.json();
        ToastError({
          message: errorData.message || "Error al crear la venta.",
        });
        return;
      }

      const saleData = await saleResponse.json();
      const id_vent = saleData.venta.id_vent;

      for (const item of orderItems) {
        const producto = products.find((p) => p.id_prod === item.productId);
        if (!producto) continue;

        const detailPayload = {
          vent_dventa: id_vent,
          prod_dventa: item.productId,
          cant_dventa: item.quantity,
          pre_uni_dventa: Number(producto.prec_vent_prod ?? 0),
          sub_tot_dventa: item.quantity * Number(producto.prec_vent_prod ?? 0),
        };

        const detailResponse = await fetch(
          "http://localhost:5000/dets-ventas",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(detailPayload),
          },
        );

        if (!detailResponse.ok) {
          throw new Error("Error al crear el detalle de venta");
        }
      }

      for (const item of orderItems) {
        const consumoResponse = await fetch(
          SERVICIOS_INVENTARIO.consumirPorLote,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_prod: item.productId,
              cantidad: item.quantity,
            }),
          },
        );

        if (!consumoResponse.ok) {
          throw new Error(
            `Error al consumir stock del producto ID ${item.productId}`,
          );
        }
      }

      const endTime = performance.now(); // ⏱️ fin
      const duration = ((endTime - startTime) / 1000).toFixed(2); // segundos

      ToastSuccess({
        message: `Orden guardada y stock consumido exitosamente en ${duration} segundos.`,
      });

      console.log("🔴 Emitiendo evento productos-actualizados");
      socket.emit("productos-actualizados");

      setOrderItems([]);
      setComprobanteNumero("");
      setComprobanteImagen(null);
      setPagoEfectivoConfirmado(false);
      setPagoTransferenciaConfirmado(false);
    } catch (error: any) {
      console.error(error);
      ToastError({
        message:
          error?.message || "Ocurrió un error inesperado al guardar la orden.",
      });
    }
  };

  const isGuardarDisabled = useMemo(() => {
    if (orderItems.length === 0) return true;
    if (metodoPago === "efectivo") return !pagoEfectivoConfirmado;
    if (metodoPago === "transferencia") return !pagoTransferenciaConfirmado;
    return true;
  }, [
    orderItems,
    metodoPago,
    pagoEfectivoConfirmado,
    pagoTransferenciaConfirmado,
  ]);
  if (loadingVentas || showLoader) return <Preloader />;

  // ---------------------
  // RENDER
  // ---------------------
  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Ventas"
      breadcrumbPageTitle="Nueva Venta"
      submenu={true}
      isLoading={false}
    >
      <div className="w-full">
        <div className="flex flex-col gap-2 md:flex-row">
          {/* Columna Izquierda (Productos) */}
          <div className="flex-1 space-y-8">
            <div className="rounded-lg bg-white px-3 shadow dark:bg-[#09090b]">
              <div className="mb-5 flex h-[140px] flex-col items-start gap-3 rounded-lg bg-white p-4 shadow dark:bg-[#1a1a1a]">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex flex-col items-start">
                    <h2 className="text-xl font-bold">Nuestros Productos</h2>
                    <span className="text-sm text-gray-600 dark:text-[#ababab]">
                      Selecciona los productos que deseas agregar a la orden y
                      luego guarda la orden.
                    </span>
                  </div>
                  {/* Input para buscar */}
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Buscar producto"
                      className="w-[250px] border border-border bg-white/10 pl-10 text-[12px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {["Todos", ...categories.map((cat) => cat.nom_cate)].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-full border border-border px-3 py-1 text-sm font-semibold ${
                          selectedCategory === cat
                            ? "bg-black text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <ScrollArea className="h-[calc(74vh-4rem)]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((prod) => {
                    const cartQ = getCartQuantity(prod.id_prod);
                    return (
                      <div
                        key={prod.id_prod}
                        className="relative flex h-[220px] w-auto flex-col justify-between rounded-lg border border-border bg-white p-3 shadow-sm dark:bg-[#1a1a1a]"
                      >
                        <div className="relative mx-auto h-[100px] w-[80px] overflow-hidden rounded-md shadow-sm">
                          <Image
                            src={prod.img_prod || "/imagenes/logo.png"}
                            alt={prod.nom_prod}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="mt-2 px-1">
                          {prod.stock_prod <= 0 && (
                            <div className="absolute right-2 rounded-md bg-[#f31260] px-2 py-1 text-xs font-bold text-white shadow">
                              Sin stock
                            </div>
                          )}
                          <h3 className="text-sm font-semibold dark:text-gray-100">
                            {prod.nom_prod}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-[#ababab]">
                            Stock: {prod.stock_prod}
                          </p>
                          <p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-100">
                            {safePrice(
                              prod.prec_vent_prod,
                              ventasConfig.moneda,
                            )}
                            <span className="text-xs font-normal"> /u</span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleDecrement(prod.id_prod)}
                              className="h-6 w-6 rounded bg-secondary text-sm font-bold text-black dark:text-white"
                            >
                              -
                            </Button>
                            <span className="w-5 text-center text-sm dark:text-gray-100">
                              {cartQ}
                            </span>
                            <Button
                              onClick={() => handleIncrement(prod.id_prod)}
                              disabled={prod.stock_prod <= 0}
                              className={`h-6 w-6 rounded text-sm font-bold ${
                                prod.stock_prod <= 0
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >
                              +
                            </Button>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {safePrice(
                              cartQ * prod.prec_vent_prod,
                              ventasConfig.moneda,
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Columna Derecha (Panel de Orden) */}
          <div className="flex h-[calc(80vh-6rem)] w-[356px] flex-col">
            <div className="rounded-t-lg bg-white px-4 pt-4 shadow dark:bg-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <h3 className="text-md mb-2 font-bold dark:text-[#f5f5f5]">
                  Información del cliente
                </h3>
                <Button
                  className="border-border text-[12px] font-semibold"
                  variant="ghost"
                  onClick={handleOpenCustomerForm}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <div>
                  <label className="block text-black dark:text-[#f5f5f5]">
                    Nombre
                  </label>
                  <p className="font-semibold dark:text-[#ababab]">
                    {customerName}
                  </p>
                </div>
                <div>
                  <label className="block text-black dark:text-[#f5f5f5]">
                    Información Adicional
                  </label>
                  <p className="font-semibold dark:text-[#ababab]">
                    {tableInfo}
                  </p>
                </div>
              </div>
              <hr
                className="mt-3 border-0 border-t border-dashed"
                style={{
                  borderTopColor: "rgba(200, 200, 200, 0.5)",
                  borderTopWidth: "2px",
                  borderImage: "initial",
                  borderSpacing: "10px",
                }}
              />
            </div>
            <div className="flex h-[228px] flex-col bg-white px-4 pt-3 shadow dark:bg-[#1a1a1a] 2xl:h-[225px]">
              <ScrollArea>
                <div className="h-[225px]">
                  <h3 className="text-md mb-2 font-bold dark:text-[#f5f5f5]">
                    Detalle de la orden
                  </h3>
                  {orderItems.length === 0 ? (
                    <p className="text-sm dark:text-[#ababab]">
                      No existen productos añadidos a la orden.
                    </p>
                  ) : (
                    <div className="flex flex-grow flex-col gap-2 overflow-auto">
                      {orderItems.map((item, idx) => {
                        const prod = products.find(
                          (p) => p.id_prod === item.productId,
                        );
                        if (!prod) return null;
                        return (
                          <div
                            key={`${prod.id_prod}-${idx}`}
                            className="flex items-center gap-3 rounded-lg border border-border bg-gray-100 p-2 dark:bg-[#262626]"
                          >
                            <div className="relative h-12 w-12 overflow-hidden rounded">
                              <Image
                                src={prod.img_prod}
                                alt={prod.nom_prod}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-row items-center justify-between gap-2">
                                <p className="text-sm font-semibold">
                                  {prod.nom_prod}
                                </p>
                                <button
                                  onClick={() => handleRemove(prod.id_prod)}
                                  className="ml-2 rounded bg-gray-200 p-1 text-red-500 hover:bg-gray-300 dark:bg-[#1a1a1a] hover:dark:bg-[#1c1c1c]"
                                  title="Eliminar producto"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2h8a2 2 0 00-2-2m-4 0V3m0 0h4"
                                    />
                                  </svg>
                                </button>
                              </div>

                              <p className="text-xs dark:text-[#ababab]">
                                c/u{" "}
                                {safePrice(
                                  prod.prec_vent_prod,
                                  ventasConfig.moneda,
                                )}
                              </p>
                              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                                {/* Total */}
                                <p className="text-xs font-semibold dark:text-white">
                                  Total:{" "}
                                  {safePrice(
                                    item.quantity * prod.prec_vent_prod,
                                    ventasConfig.moneda,
                                  )}
                                </p>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleDecrement(prod.id_prod)
                                    }
                                    className="rounded bg-gray-200 px-2 text-sm font-bold hover:bg-gray-300 dark:bg-[#1a1a1a] hover:dark:bg-[#1c1c1c]"
                                  >
                                    -
                                  </button>
                                  <span className="text-sm dark:text-[#ababab]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleIncrement(prod.id_prod)
                                    }
                                    disabled={prod.stock_prod <= 0}
                                    className={`rounded bg-gray-200 px-2 text-sm font-bold hover:bg-gray-300 dark:bg-[#1a1a1a] hover:dark:bg-[#1c1c1c] ${
                                      prod.stock_prod <= 0
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                    }`}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <hr
                        className="mt-3 border-0 border-t border-dashed"
                        style={{
                          borderTopColor: "rgba(200, 200, 200, 0.5)",
                          borderTopWidth: "2px",
                          borderImage: "initial",
                          borderSpacing: "10px",
                        }}
                      />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            {/* Resumen de Pago y Botón para Guardar Orden */}
            <div className="rounded-b-lg bg-white px-4 pt-3 shadow dark:bg-[#1a1a1a]">
              <h3 className="text-md mb-2 font-bold">Resumen de pago</h3>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span className="dark:text-[#ababab]">Subtotal</span>
                <span className="dark:text-[#f5f5f5]">
                  {safePrice(subtotal, ventasConfig.moneda)}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span className="dark:text-[#ababab]">
                  IVA ({ventasConfig.porcentaje_iva}%)
                </span>
                <span className="dark:text-[#f5f5f5]">
                  {safePrice(tax, ventasConfig.moneda)}
                </span>
              </div>
              <div className="mb-4 h-px w-full bg-gray-200"></div>
              <div className="mb-4 flex items-center justify-between font-bold text-gray-800">
                <span className="dark:text-[#ababab]">Total</span>
                <span className="dark:text-[#f5f5f5]">
                  {safePrice(total, ventasConfig.moneda)}
                </span>
              </div>
            </div>
            {/* Metodo de pago */}
            <div className="mt-3 rounded-lg bg-white p-4 shadow dark:bg-[#1a1a1a]">
              <h3 className="text-md mb-2 font-bold dark:text-white">
                Método de pago
              </h3>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between gap-2">
                  {/* Botón Transferencia */}
                  <Button
                    onClick={() => {
                      if (metodoPago === "transferencia") {
                        setShowDialogComprobante((prev) => !prev);
                      } else {
                        setMetodoPago("transferencia");
                        setShowDialogComprobante(true);
                      }
                    }}
                    disabled={total <= 0}
                    className={`flex items-center gap-2 rounded-lg px-7 py-2 text-sm font-medium shadow-sm transition ${
                      metodoPago === "transferencia"
                        ? "border-2 border-emerald-500 bg-white text-emerald-700 dark:bg-[#2a2a2a] dark:text-emerald-400"
                        : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:bg-[#2a2a2a] dark:text-gray-300"
                    } ${total <= 0 ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <Smartphone size={16} />
                    Transferencia
                  </Button>

                  <Button
                    onClick={() => {
                      setMetodoPago("efectivo");
                      setMostarEfectivoModal(true);
                    }}
                    disabled={total <= 0}
                    className={`flex items-center gap-2 rounded-lg px-7 py-2 text-sm font-medium shadow-sm transition ${
                      metodoPago === "efectivo"
                        ? "border-2 border-emerald-500 bg-white text-emerald-700 dark:bg-[#2a2a2a] dark:text-emerald-400"
                        : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:bg-[#2a2a2a] dark:text-gray-300"
                    } ${total <= 0 ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <Banknote size={16} />
                    Efectivo
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-between pt-3">
              <Button
                variant={"primary"}
                className="mt-2 w-full rounded text-sm font-bold"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isGuardarDisabled}
              >
                <Save className="h-4 w-4" /> Guardar orden
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar información del cliente */}
      {showCustomerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <form
            onSubmit={handleSaveCustomerForm}
            className="w-80 rounded bg-white p-4 shadow-md"
          >
            <h2 className="mb-4 text-lg font-bold">Edit Customer Info</h2>
            <label className="mb-2 block">
              <span className="text-sm text-gray-700">Name</span>
              <input
                type="text"
                className="w-full rounded border p-1"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
            </label>
            <label className="mb-2 block">
              <span className="text-sm text-gray-700">Table Info</span>
              <input
                type="text"
                className="w-full rounded border p-1"
                value={tempTable}
                onChange={(e) => setTempTable(e.target.value)}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseCustomerForm}
                className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-pink-500 px-3 py-1 text-sm text-white hover:bg-pink-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {showDialogComprobante && (
        <Dialog
          open={showDialogComprobante}
          onOpenChange={(open) => {
            setShowDialogComprobante(open);

            if (!open) {
              // Solo resetea si no se ha confirmado
              if (!pagoTransferenciaConfirmado) {
                setComprobanteNumero("");
                setComprobanteImagen(null);
                setMetodoPago("efectivo");
              }
            }
          }}
        >
          <DialogContent className="w-[500px] max-w-none border-border">
            <DialogHeader>
              <DialogTitle>Información de transferencia</DialogTitle>
              <DialogDescription>
                Ingresa el número de comprobante y captura una foto con la
                cámara.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número de comprobante
                </label>
                <Input
                  type="text"
                  placeholder="Ej: 123456789"
                  value={comprobanteNumero}
                  onChange={(e) => setComprobanteNumero(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Foto del comprobante
                </label>

                <ComprobanteCamara
                  onFotoTomada={(file) => setComprobanteImagen(file)}
                  imagenActual={comprobanteImagen}
                  activarCamara={showDialogComprobante}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialogComprobante(false);
                  setComprobanteNumero("");
                  setComprobanteImagen(null);
                  setMetodoPago("efectivo");
                  setPagoTransferenciaConfirmado(false);
                }}
              >
                Cancelar
              </Button>

              <Button
                onClick={() => {
                  if (comprobanteNumero && comprobanteImagen) {
                    setPagoTransferenciaConfirmado(true);
                    setShowDialogComprobante(false);
                  }
                }}
                disabled={!comprobanteNumero || !comprobanteImagen}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ModalPagoEfectivo
        open={mostrarEfectivoModal}
        onClose={() => setMostarEfectivoModal(false)}
        onConfirm={() => {
          setEfectivoCambio((efectivoRecibido ?? 0) - total);
          setPagoEfectivoConfirmado(true);
          setMostarEfectivoModal(false);
        }}
        efectivoRecibido={efectivoRecibido}
        setEfectivoRecibido={setEfectivoRecibido}
        total={total}
        orderItems={orderItems.map((item) => {
          const prod = products.find((p) => p.id_prod === item.productId);
          return {
            name: prod?.nom_prod ?? "Producto",
            qty: item.quantity,
            price: prod?.prec_vent_prod ?? 0,
          };
        })}
        customerName={customerName}
        tableInfo={tableInfo}
      />

      {showConfirmDialog && (
        <Dialog
          open={showConfirmDialog}
          onOpenChange={(open) => {
            setShowDialogComprobante(open);
            if (!open) {
              detenerCamaraRef.current?.();
              setFotoTomada(null);
              setComprobanteImagen(null);
              setComprobanteNumero("");
              setMetodoPago("efectivo");
            }
          }}
        >
          <DialogContent className="w-[400px] max-w-none border-border">
            <DialogHeader>
              <DialogTitle>¿Confirmar orden?</DialogTitle>
              <DialogDescription>
                ¿Estás seguro que deseas guardar esta orden? Esta acción no se
                puede deshacer.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialogComprobante(false);
                  setComprobanteNumero("");
                  setComprobanteImagen(null);
                  setMetodoPago("efectivo");
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                onClick={() => {
                  setShowConfirmDialog(false);
                  handleSaveOrder();
                }}
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </ModulePageLayout>
  );
}
