"use client";

import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

// ---------------------
// INTERFACES
// ---------------------
interface Product {
  id_prod: number; // Propiedad de la API
  nom_prod: string; // Propiedad de la API
  prec_prod: number; // Propiedad de la API
  stock_prod: number; // Propiedad de la API
  img_prod: string; // Propiedad de la API
  description?: string;
  discount?: number; // Porcentaje de descuento
  // Se asume que cate_prod puede ser un objeto o una cadena
  cate_prod: { nom_cate: string } | string;
  special?: boolean; // Para "Special Discount Today"
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface Category {
  id_cate: number;
  nom_cate: string;
  desc_cate?: string;
  est_cate: string; // Se espera "Activo" para categorías activas
}

// ---------------------
// COMPONENTE PRINCIPAL
// ---------------------
export default function Page() {
  // ---------------------
  // ESTADOS
  // ---------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda

  // Estado para categorías provenientes de la API
  const [categories, setCategories] = useState<Category[]>([]);

  // Información del cliente
  const [customerName, setCustomerName] = useState("Erik Granda");
  const [tableInfo, setTableInfo] = useState("Orden para llevar");

  // Modal para editar la información del cliente
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [tempName, setTempName] = useState(customerName);
  const [tempTable, setTempTable] = useState(tableInfo);

  const handleOpenCustomerForm = () => {
    setTempName(customerName);
    setTempTable(tableInfo);
    setShowCustomerForm(true);
  };
  const handleCloseCustomerForm = () => {
    setShowCustomerForm(false);
  };
  const handleSaveCustomerForm = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerName(tempName);
    setTableInfo(tempTable);
    setShowCustomerForm(false);
  };

  // ---------------------
  // CARGA DE PRODUCTOS DESDE LA API
  // ---------------------
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:5000/productos");
        const data = await response.json();
        console.log("Productos API response:", data);
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar los productos:", error);
      }
    }
    fetchProducts();
  }, []);

  // ---------------------
  // CARGA DE CATEGORÍAS DESDE LA API
  // ---------------------
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("http://localhost:5000/categorias");
        const result = await response.json();
        console.log("Categorias API response:", result);
        // Extraer el arreglo de categorías de la respuesta
        const data: Category[] = result.categorias || [];
        console.log("Categorias extraidas:", data);
        // Filtrar solo las categorías activas (comparación insensible a mayúsculas)
        const activeCategories = data.filter(
          (cat) => cat.est_cate.toLowerCase() === "activo"
        );
        console.log("Categorias activas:", activeCategories);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    }
    fetchCategories();
  }, []);

  // ---------------------
  // DERIVAR CATEGORÍAS CON PRODUCTOS
  // ---------------------
  const availableCategories = useMemo(() => {
    console.log("Productos cargados para filtrar categorías:", products);
    const available = categories.filter((category) =>
      products.some((product) => {
        // Extraer el nombre de la categoría del producto
        const prodCate =
          typeof product.cate_prod === "object" && product.cate_prod !== null
            ? product.cate_prod.nom_cate
            : product.cate_prod;
        return prodCate === category.nom_cate;
      })
    );
    console.log("Categorias disponibles (con productos):", available);
    return available;
  }, [categories, products]);

  // Opciones de categoría para el filtro (se añade "Todos")
  const categoryOptions = useMemo(() => {
    return ["Todos", ...availableCategories.map((cat) => cat.nom_cate)];
  }, [availableCategories]);

  // ---------------------
  // FILTROS DE PRODUCTOS
  // ---------------------
  const specialDiscountProducts = useMemo(() => {
    return products.filter((p) => p.special);
  }, [products]);

  const filteredProducts = useMemo(() => {
    // Filtrar productos que no sean "special"
    let filtered = products.filter((p) => !p.special);

    // Filtrar por categoría (si no es "Todos")
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((p) => {
        const prodCate =
          typeof p.cate_prod === "object" && p.cate_prod !== null
            ? p.cate_prod.nom_cate
            : p.cate_prod;
        return prodCate === selectedCategory;
      });
    }

    // Filtrar por búsqueda (nombre del producto)
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.nom_prod.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // ---------------------
  // CARRITO Y GESTIÓN DE STOCK
  // ---------------------
  const getCartQuantity = (productId: number) => {
    const item = orderItems.find((i) => i.product.id_prod === productId);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (productId: number) => {
    const found = products.find((p) => p.id_prod === productId);
    if (!found || found.stock_prod <= 0) return;

    setOrderItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id_prod === productId);
      if (idx === -1) {
        return [...prev, { product: found, quantity: 1 }];
      } else {
        const newOrder = [...prev];
        newOrder[idx].quantity += 1;
        return newOrder;
      }
    });
    setProducts((prev) =>
      prev.map((p) =>
        p.id_prod === productId ? { ...p, stock_prod: p.stock_prod - 1 } : p
      )
    );
  };

  const handleDecrement = (productId: number) => {
    const idx = orderItems.findIndex((i) => i.product.id_prod === productId);
    if (idx === -1) return;

    const quantity = orderItems[idx].quantity;
    if (quantity > 1) {
      setOrderItems((prev) => {
        const newOrder = [...prev];
        newOrder[idx].quantity -= 1;
        return newOrder;
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id_prod === productId ? { ...p, stock_prod: p.stock_prod + 1 } : p
        )
      );
    } else {
      setOrderItems((prev) => prev.filter((_, i) => i !== idx));
      setProducts((prev) =>
        prev.map((p) =>
          p.id_prod === productId
            ? { ...p, stock_prod: p.stock_prod + quantity }
            : p
        )
      );
    }
  };

  // Función para eliminar el producto de la orden
  const handleRemove = (productId: number) => {
    const itemToRemove = orderItems.find((i) => i.product.id_prod === productId);
    if (!itemToRemove) return;
    setOrderItems((prev) =>
      prev.filter((i) => i.product.id_prod !== productId)
    );
    // Se devuelve la cantidad eliminada al stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id_prod === productId
          ? { ...p, stock_prod: p.stock_prod + itemToRemove.quantity }
          : p
      )
    );
  };

  // ---------------------
  // SUBTOTAL / TAX / TOTAL
  // ---------------------
  const subtotal = useMemo(() => {
    return orderItems.reduce(
      (acc, item) => acc + item.product.prec_prod * item.quantity,
      0
    );
  }, [orderItems]);

  const tax = subtotal * 0.1;
  const discountGlobal = 0;
  const total = subtotal + tax - discountGlobal;

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
        {/* Contenedor principal: dos columnas */}
        <div className="flex flex-col gap-2 md:flex-row">
          {/* Columna Izquierda (Productos) */}
          <div className="flex-1 space-y-8">
            <div className="rounded-lg bg-white px-3 shadow dark:bg-[#09090b]">
              <div className="mb-5 flex h-[140px] flex-col items-start gap-3 rounded-lg bg-white p-4 shadow dark:bg-[#1a1a1a]">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex flex-col items-start">
                    <h2 className="text-xl font-bold">Nuestros Productos</h2>
                    <span className="text-sm text-gray-600 dark:text-[#ababab]">
                      Selecciona los productos que deseas agregar a la orden y luego guarda la orden.
                    </span>
                  </div>
                  {/* Input para buscar */}
                  <Input
                    placeholder="Buscar producto..."
                    className="w-[220px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {categoryOptions.map((cat) => (
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
                  ))}
                </div>
              </div>
              {/* Grid de productos con altura dinámica */}
              <div className="grid h-[calc(74vh-4rem)] grid-cols-1 gap-4 overflow-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((prod) => {
                  const discount = prod.discount || 0;
                  const cartQ = getCartQuantity(prod.id_prod);
                  return (
                    <div
                      key={prod.id_prod}
                      className="relative flex h-[220px] w-auto flex-col justify-between rounded-lg border border-border bg-white p-3 shadow-sm dark:bg-[#1a1a1a]"
                    >
                      {/* Contenedor de la imagen */}
                      <div className="relative mx-auto h-[100px] w-[80px] overflow-hidden rounded-md shadow-sm">
                        <Image
                          src={prod.img_prod || "/imagenes/logo.png"}
                          alt={prod.nom_prod}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Contenido principal */}
                      <div className="mt-2 px-1">
                        {/* Etiqueta de sin stock */}
                        {prod.stock_prod <= 0 && (
                          <div className="absolute right-2 rounded-md bg-[#be3e3f] px-2 py-1 text-xs font-bold text-white shadow">
                            Sin stock
                          </div>
                        )}
                        {/* Nombre del producto */}
                        <h3 className="text-sm font-semibold dark:text-gray-100">
                          {prod.nom_prod}
                        </h3>

                        {/* Stock */}
                        <p className="text-xs text-gray-600 dark:text-[#ababab]">
                          Stock: {prod.stock_prod}
                        </p>

                        {/* Precio unitario */}
                        <p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-100">
                          $ {prod.prec_prod.toLocaleString("id-ID")}
                          <span className="text-xs font-normal"> /u</span>
                        </p>
                      </div>

                      {/* Sección inferior: botones y subtotal para este producto */}
                      <div className="mt-2 flex items-center justify-between px-1">
                        {/* Botones de cantidad */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecrement(prod.id_prod)}
                            disabled={cartQ === 0}
                            className={`h-7 w-7 rounded bg-gray-200 text-sm font-bold hover:bg-gray-300 dark:bg-[#333] dark:text-white hover:dark:bg-[#333] ${
                              cartQ === 0 ? "cursor-not-allowed opacity-50" : ""
                            }`}
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
                              prod.stock_prod <= 0 ? "cursor-not-allowed opacity-50" : ""
                            }`}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal de esta tarjeta */}
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          $ {(cartQ * prod.prec_prod).toLocaleString("id-ID")}
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
            {/* Información del Cliente */}
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
                className="mt-3 w-full rounded bg-[#f6b100] text-sm font-bold text-black hover:bg-gray-800"
                onClick={handleOpenCustomerForm}
              >
                Editar Información
              </Button>
            </div>

            {/* Orden Actual */}
            <div className="flex h-[222px] flex-col bg-white p-4 shadow dark:bg-[#1a1a1a] 2xl:h-[300px]">
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
                    const { product, quantity } = item;
                    return (
                      <div
                        key={`${product.id_prod}-${idx}`}
                        className="flex items-center gap-3 rounded-lg border border-border bg-gray-100 p-2 dark:bg-[#262626]"
                      >
                        <div className="relative h-12 w-12 overflow-hidden rounded">
                          <Image
                            src={product.img_prod}
                            alt={product.nom_prod}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {product.nom_prod}
                          </p>
                          <p className="text-xs dark:text-[#ababab]">
                            {quantity} x ${" "}
                            {product.prec_prod.toLocaleString("id-ID")}
                          </p>
                          <div className="flex items-center justify-start gap-2 pt-1 text-xs">
                            <button
                              onClick={() => handleDecrement(product.id_prod)}
                              className="rounded bg-gray-200 px-2 text-sm font-bold hover:bg-gray-300 dark:bg-[#1a1a1a] hover:dark:bg-[#1c1c1c]"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleIncrement(product.id_prod)}
                              className="rounded bg-gray-200 px-2 text-sm font-bold hover:bg-gray-300 dark:bg-[#1a1a1a] hover:dark:bg-[#1c1c1c]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-center gap-2">
                          <button
                            onClick={() => handleRemove(product.id_prod)}
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resumen de Pago */}
            <div className="rounded-b-lg bg-white p-4 shadow dark:bg-[#1a1a1a]">
              <h3 className="mb-2 text-lg font-bold">Resumen de pago</h3>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span className="dark:text-[#ababab]">Subtotal</span>
                <span className="dark:text-[#f5f5f5]">
                  $ {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span className="dark:text-[#ababab]">Iva (15%)</span>
                <span className="dark:text-[#f5f5f5]">
                  $ {Math.round(tax).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="mb-4 h-px w-full bg-gray-200"></div>
              <div className="mb-4 flex items-center justify-between font-bold text-gray-800">
                <span className="dark:text-[#ababab]">Total</span>
                <span className="dark:text-[#f5f5f5]">
                  $ {Math.round(total).toLocaleString("id-ID")}
                </span>
              </div>
              <button
                type="button"
                className="w-full rounded bg-[#f6b100] py-2 text-sm font-bold text-black"
              >
                Guardar Orden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar la información del cliente */}
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
