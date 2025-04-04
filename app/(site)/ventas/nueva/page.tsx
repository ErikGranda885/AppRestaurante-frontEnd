"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import toast from "react-hot-toast";

// ---------------------
// INTERFACES
// ---------------------
interface Product {
  id_prod: number;
  nom_prod: string;
  prec_prod: number;
  iva_prod: boolean;
  stock_prod: number;
  img_prod: string;
  description?: string;
  discount?: number;
  cate_prod: { nom_cate: string } | string;
  special?: boolean;
}

// Almacena solo el id del producto y la cantidad
interface OrderItem {
  productId: number;
  quantity: number;
}

interface Category {
  id_cate: number;
  nom_cate: string;
  desc_cate?: string;
  est_cate: string;
}

// ---------------------
// COMPONENTE PRINCIPAL
// ---------------------
export default function Page() {
  useProtectedRoute();

  // Estados para productos, orden y filtros
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // Estados para información del cliente
  const [customerName, setCustomerName] = useState("Erik Granda");
  const [tableInfo, setTableInfo] = useState("Orden para llevar");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [tempName, setTempName] = useState(customerName);
  const [tempTable, setTempTable] = useState(tableInfo);

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

  // Cargar productos desde la API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:5000/productos");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar los productos:", error);
      }
    }
    fetchProducts();
  }, []);

  // Cargar categorías desde la API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("http://localhost:5000/categorias");
        const result = await response.json();
        const data: Category[] = result.categorias || [];
        const activeCategories = data.filter(
          (cat) => cat.est_cate.toLowerCase() === "activo",
        );
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    }
    fetchCategories();
  }, []);

  // Filtrar productos según categoría y búsqueda
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => !p.special);
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((p) => {
        const prodCate =
          typeof p.cate_prod === "object" && p.cate_prod !== null
            ? p.cate_prod.nom_cate
            : p.cate_prod;
        return prodCate === selectedCategory;
      });
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
    if (!found || found.stock_prod <= 0) {
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
      return acc + prod.prec_prod * item.quantity;
    }, 0);
  }, [orderItems, products]);

  // Calcular el subtotal de los productos que tienen IVA (iva_prod true)
  const taxableSubtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => {
      const prod = products.find((p) => p.id_prod === item.productId);
      if (prod && prod.iva_prod == true) {
        return acc + prod.prec_prod * item.quantity;
      }
      return acc;
    }, 0);
  }, [orderItems, products]);

  // Por ejemplo, si el IVA es del 15%
  const tax = taxableSubtotal * 0.15; // IVA del 15%
  const discountGlobal = 0;
  const total = subtotal + tax - discountGlobal;

  // Función para enviar la orden a la API integrando ventas, detalles y actualización de stock
  const handleSaveOrder = async () => {
    /* Verificar si existe algun producto agregado a la orden */
    if (orderItems.length === 0) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } relative flex w-96 items-start gap-3 rounded-lg border border-red-500 bg-red-100 p-4 shadow-lg`}
            style={{ animationDuration: "3s" }}
          >
            <XCircle className="mt-1 h-6 w-6 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Error</p>
              <p className="text-sm text-red-600/80">
                {
                  "Debe seleccionar por lo menos un producto para finalizar la orden."
                }
              </p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-red-500/20">
              <div className="progress-bar h-full bg-red-500" />
            </div>
          </div>
        ),
        { duration: 2000, position: "top-right" },
      );
      return;
    } else {
      try {
        // Crear la venta
        const salePayload = {
          tot_vent: total,
          fech_vent: new Date().toISOString(),
          est_vent: "Sin cerrar",
          usu_vent: parseInt(localStorage.getItem("user_id") || "0"),
        };
        const saleResponse = await fetch("http://localhost:5000/ventas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salePayload),
        });
        if (!saleResponse.ok) {
          throw new Error(
            "Error al crear la venta: " + saleResponse.statusText,
          );
        }
        const saleData = await saleResponse.json();
        const id_vent = saleData.venta.id_vent; // Ajusta según tu API

        // Crear cada detalle de venta
        for (const item of orderItems) {
          const detailPayload = {
            vent_det: id_vent,
            prod_det: item.productId,
            cant_det: item.quantity,
            pre_uni_det: products.find((p) => p.id_prod === item.productId)
              ?.prec_prod,
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

        // Actualizar el stock de cada producto:
        for (const item of orderItems) {
          const productState = products.find(
            (p) => p.id_prod === item.productId,
          );
          const updatedStock = productState ? productState.stock_prod : 0;
          const patchResponse = await fetch(
            `http://localhost:5000/productos/${item.productId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stock_prod: updatedStock }),
            },
          );
          if (!patchResponse.ok) {
            throw new Error("Error al actualizar el stock del producto");
          }
        }

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } relative flex w-96 items-start gap-3 rounded-lg border border-[#4ADE80] bg-[#F0FFF4] p-4 shadow-lg`}
              style={{ animationDuration: "3s" }}
            >
              <CheckCircle className="mt-1 h-6 w-6 text-[#166534]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#166534]">
                  Mensaje Informativo
                </p>
                <p className="text-sm text-[#166534]/80">
                  Se ha realizado la compra exitosamente. Gracias por su compra.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#4ADE80]/20">
                <div className="progress-bar h-full bg-[#4ADE80]" />
              </div>
            </div>
          ),
          { duration: 2000, position: "top-right" },
        );
        setOrderItems([]);
      } catch (error: any) {
        console.error(error);
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } relative flex w-96 items-start gap-3 rounded-lg border border-red-500 bg-red-100 p-4 shadow-lg`}
              style={{ animationDuration: "3s" }}
            >
              <XCircle className="mt-1 h-6 w-6 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">Error</p>
                <p className="text-sm text-red-600/80">{error.message}</p>
              </div>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-red-500/20">
                <div className="progress-bar h-full bg-red-500" />
              </div>
            </div>
          ),
          { duration: 2000, position: "top-right" },
        );
      }
    }
  };

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
                  <Input
                    placeholder="Buscar producto..."
                    className="w-[220px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
              <div className="grid h-[calc(74vh-4rem)] grid-cols-1 gap-4 overflow-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                          <div className="absolute right-2 rounded-md bg-[#be3e3f] px-2 py-1 text-xs font-bold text-white shadow">
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
                          ${" "}
                          {prod.prec_prod.toLocaleString("id-ID", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          <span className="text-xs font-normal"> /u</span>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecrement(prod.id_prod)}
                            className="h-7 w-7 rounded bg-gray-200 text-sm font-bold hover:bg-gray-300 dark:bg-[#333] dark:text-white hover:dark:bg-[#333]"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-sm dark:text-gray-100">
                            {cartQ}
                          </span>
                          <button
                            onClick={() => handleIncrement(prod.id_prod)}
                            disabled={prod.stock_prod <= 0}
                            className={`h-7 w-7 rounded bg-[#f6b100] text-sm font-bold text-black hover:bg-gray-300 dark:text-white hover:dark:bg-[#333] ${
                              prod.stock_prod <= 0
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          ${" "}
                          {(cartQ * prod.prec_prod).toLocaleString("id-ID", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna Derecha (Panel de Orden) */}
          <div className="flex h-[calc(100vh-6rem)] w-full flex-col md:w-1/4 2xl:h-[710px]">
            <div className="rounded-t-lg bg-white p-4 shadow dark:bg-[#1a1a1a]">
              <h3 className="mb-2 text-lg font-bold dark:text-[#f5f5f5]">
                Información del cliente
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
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
              <Button
                className="mt-3 w-full rounded bg-[#f6b100] text-sm font-bold text-black hover:bg-[#f6b100] dark:bg-[#f6b100] dark:text-black dark:hover:bg-[#f6b100]"
                onClick={handleOpenCustomerForm}
              >
                Editar Información
              </Button>
            </div>

            <div className="flex h-[228px] flex-col bg-white p-4 shadow dark:bg-[#1a1a1a] 2xl:h-[300px]">
              <h3 className="mb-2 text-lg font-bold dark:text-[#f5f5f5]">
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
                            c/u ${" "}
                            {prod.prec_prod.toLocaleString("id-ID", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                            {/* Total */}
                            <p className="text-xs font-semibold dark:text-white">
                              Total: ${" "}
                              {(item.quantity * prod.prec_prod).toLocaleString(
                                "id-ID",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDecrement(prod.id_prod)}
                                className="rounded bg-gray-200 px-2 text-sm font-bold hover:bg-gray-300 dark:bg-[#1a1a1a] hover:dark:bg-[#1c1c1c]"
                              >
                                -
                              </button>
                              <span className="text-sm dark:text-[#ababab]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleIncrement(prod.id_prod)}
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
                </div>
              )}
            </div>

            {/* Resumen de Pago y Botón para Guardar Orden */}
            <div className="rounded-b-lg bg-white p-4 shadow dark:bg-[#1a1a1a]">
              <h3 className="mb-2 text-lg font-bold">Resumen de pago</h3>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span className="dark:text-[#ababab]">Subtotal</span>
                <span className="dark:text-[#f5f5f5]">
                  ${" "}
                  {subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span className="dark:text-[#ababab]">Iva (15%)</span>
                <span className="dark:text-[#f5f5f5]">
                  ${" "}
                  {tax.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="mb-4 h-px w-full bg-gray-200"></div>
              <div className="mb-4 flex items-center justify-between font-bold text-gray-800">
                <span className="dark:text-[#ababab]">Total</span>
                <span className="dark:text-[#f5f5f5]">
                  ${" "}
                  {total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Button
                className="mt-3 w-full rounded bg-[#f6b100] text-sm font-bold text-black hover:bg-[#f6b100] dark:bg-[#f6b100] dark:text-black dark:hover:bg-[#f6b100]"
                onClick={handleSaveOrder}
              >
                Guardar Orden
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
    </ModulePageLayout>
  );
}
