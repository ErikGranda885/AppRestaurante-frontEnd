"use client";
import * as React from "react";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { Separator } from "@/components/ui/separator";
import { parse, differenceInDays, startOfDay } from "date-fns";
import Image from "next/image";

export type Category = {
  id_cate: string;
  nom_cate: string;
};

export type Product = {
  id_prod: string;
  prec_prod: string;
  stock_prod: string;
  nom_prod: string;
  est_prod: string;
  fech_ven_prod: string;
  img_prod?: string; // URL de la imagen proveniente de Firebase
};

export default function Page() {
  // Definir el stock mínimo (puedes ajustarlo según tu lógica de negocio)
  const minimumStock = 10;
  // Estados para categorías
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] =
    React.useState<boolean>(true);
  const [errorCategories, setErrorCategories] = React.useState<string | null>(
    null
  );
  // Estado para la categoría seleccionada ("todos" muestra todos)
  const [selectedCategory, setSelectedCategory] =
    React.useState<string>("todos");
  // Estado para mostrar todas las categorías o solo las primeras 6
  const [showAllCategories, setShowAllCategories] =
    React.useState<boolean>(false);

  // Estados para productos cargados desde la API
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState<boolean>(true);
  const [errorProducts, setErrorProducts] = React.useState<string | null>(null);

  // Estado para la paginación de productos
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 6; // 6 productos por página para mostrar 2 filas en vista md (3 columnas)

  // Cargar categorías desde la API
  React.useEffect(() => {
    fetch("http://localhost:5000/categorias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar las categorías");
        return res.json();
      })
      .then((data: any) => {
        setCategories(data.categorias);
        setLoadingCategories(false);
      })
      .catch((err) => {
        setErrorCategories(err.message);
        setLoadingCategories(false);
      });
  }, []);

  // Cargar productos según la categoría seleccionada
  // Cargar productos según la categoría seleccionada
  React.useEffect(() => {
    setCurrentPage(1);
    setLoadingProducts(true);
    setErrorProducts(null);

    const url =
      selectedCategory === "todos"
        ? "http://localhost:5000/productos"
        : `http://localhost:5000/productos/categoria/${selectedCategory}`;

    fetch(url)
      .then((res) => {
        // Si la respuesta es 404, devolvemos un objeto con productos vacíos
        if (res.status === 404) return { productos: [] };
        if (!res.ok) throw new Error("Error al cargar los productos");
        return res.json();
      })
      .then((data: any) => {
        // Si la API devuelve un array directamente o en la propiedad 'productos'
        setProducts(data.productos ?? data ?? []);
        setLoadingProducts(false);
      })
      .catch((err) => {
        // En caso de error, asignamos un array vacío en productos
        setProducts([]);
        setLoadingProducts(false);
      });
  }, [selectedCategory]);

  // Paginación
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Determinar qué categorías se mostrarán (solo las primeras 6 si hay más y showAllCategories es false)
  const displayedCategories =
    !loadingCategories &&
    !errorCategories &&
    categories.length > 6 &&
    !showAllCategories
      ? categories.slice(0, 6)
      : categories;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Inventario"
      breadcrumbPageTitle="Gestión de Productos"
      submenu={true}
      isLoading={loadingCategories || loadingProducts}
    >
      <div className="bg-white dark:bg-[#09090b] w-full h-full rounded-lg p-4">
        {/* Encabezado: Título, subtítulo y filtros de categorías */}
        <div className="flex flex-col gap-4 mb-6 bg-gray-50 dark:bg-[#09090b] border rounded-lg p-4 shadow dark:border-default-700">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-black dark:text-white font-bold text-md">
                Productos
              </h3>
              <p className="text-sm text-gray-500">
                Gestión de productos agrupados por categorías
              </p>
            </div>
            <div className="flex flex-row gap-3 items-center">
              <button
                className={`btn btn-primary ${
                  selectedCategory === "todos"
                    ? "border-b-2 border-[#fc9581]"
                    : ""
                }`}
                onClick={() => setSelectedCategory("todos")}
              >
                Todos
              </button>
              <Separator orientation="vertical" />
              {loadingCategories ? (
                <p>Cargando categorías...</p>
              ) : errorCategories ? (
                <p className="text-red-500">{errorCategories}</p>
              ) : (
                <>
                  {displayedCategories.map((cat) => (
                    <button
                      key={cat.id_cate}
                      className={`btn btn-primary whitespace-nowrap ${
                        selectedCategory === cat.id_cate
                          ? "border-b-2 border-[#fc9581]"
                          : ""
                      }`}
                      onClick={() => setSelectedCategory(cat.id_cate)}
                    >
                      {cat.nom_cate}
                    </button>
                  ))}
                  {categories.length > 6 && !showAllCategories && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAllCategories(true)}
                    >
                      Más
                    </button>
                  )}
                  {categories.length > 6 && showAllCategories && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAllCategories(false)}
                    >
                      Menos
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tarjetas de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loadingProducts ? (
            <p>Cargando productos...</p>
          ) : errorProducts ? (
            <p className="w-full text-center text-red-500">{errorProducts}</p>
          ) : currentProducts.length > 0 ? (
            currentProducts.map((product) => {
              // Convertir la fecha de vencimiento (formato "dd/MM/yyyy") y ajustar a inicio del día
              const expirationDate = startOfDay(
                parse(product.fech_ven_prod, "dd/MM/yyyy", new Date())
              );
              const today = startOfDay(new Date());
              const diffDays = differenceInDays(expirationDate, today);
              return (
                <div
                  key={product.id_prod}
                  className="bg-white dark:bg-[#09090b] dark:border dark:border-default-700 rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="py-4 px-2 flex flex-row gap-4">
                    <Image
                      src={
                        product.img_prod ||
                        "https://via.placeholder.com/150?text=Sin+imagen"
                      }
                      alt={product.nom_prod}
                      width={100}
                      height={128}
                      className="object-cover"
                    />
                    <div className="flex flex-col justify-start">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-1 text-md">
                        {product.nom_prod}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Estado:{" "}
                        {product.est_prod === "Activo" ? (
                          <span className="text-success">Activo</span>
                        ) : (
                          <span className="text-danger">Inactivo</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Stock:{" "}
                        <span
                          className={
                            parseInt(product.stock_prod) <= minimumStock
                              ? "text-danger-600 font-bold px-1 bg-danger-100 rounded-md dark:text-black"
                              : parseInt(product.stock_prod) <= minimumStock * 2
                              ? "text-warning-600 font-bold px-1 bg-warning-100 rounded-md dark:text-black"
                              : "text-success-600 font-bold px-1 bg-success-100 rounded-md dark:text-black"
                          }
                        >
                          {product.stock_prod}
                        </span>
                      </p>
                      <p className="text-lg font-semibold text-black dark:text-white">
                        ${parseFloat(product.prec_prod).toFixed(2)}
                      </p>
                      <p className="text-xs mt-2">
                        {diffDays <= 0 ? (
                          <span className="text-white font-bold bg-danger-500 px-2 py-1 rounded-md">
                            Caducado
                          </span>
                        ) : diffDays <= 5 ? (
                          <span className="text-white font-bold bg-warning-500 px-2 py-1 rounded-md">
                            Próximo a caducar ({diffDays} día
                            {diffDays > 1 ? "s" : ""})
                          </span>
                        ) : (
                          <span className="text-white font-bold bg-success-500 px-2 py-1 rounded-md">
                            Vence en {diffDays} día{diffDays > 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="w-full text-start text-gray-500">
              No se encontraron productos.
            </p>
          )}
        </div>

        {/* Paginador */}
        {products.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-6 text-sm p-2">
            <button
              className="text-black p-1 rounded-md dark:text-white border border-default-200 dark:border-default-700 dark:bg-[#09090b] cursor-pointer hover:bg-default-200 dark:hover:bg-default-700"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="text-gray-700 dark:text-white">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="text-black p-1 rounded-md dark:text-white border border-default-200 dark:border-default-700 dark:bg-[#09090b] cursor-pointer hover:bg-default-200 dark:hover:bg-default-700"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </ModulePageLayout>
  );
}
