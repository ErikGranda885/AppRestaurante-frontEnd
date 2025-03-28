"use client";
import ModulePageLayout from "@/components/pageLayout/ModulePageLayout";
import { useEffect, useState, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Category {
  id_cate: number;
  nom_cate: string;
  count: number;
}

interface Product {
  id_prod: number;
  nom_prod: string;
  prec_prod: number;
  stock_prod: number;
  img_prod?: string;
  desc_prod?: string;
  cate_prod: {
    id_cate: number;
    nom_cate: string;
  };
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);

  useEffect(() => {
    fetch("http://localhost:5000/productos")
      .then((res) => res.json())
      .then((data: any) => setProducts(data.productos || data))
      .catch((err) => console.error("Error al cargar productos:", err));
  }, []);

  // Construir las categorías a partir de los productos
  const categories: Category[] = useMemo(() => {
    const categoryMap: Record<number, Category> = {};
    products.forEach((product) => {
      const { id_cate, nom_cate } = product.cate_prod;
      if (categoryMap[id_cate]) {
        categoryMap[id_cate].count += 1;
      } else {
        categoryMap[id_cate] = { id_cate, nom_cate, count: 1 };
      }
    });
    return Object.values(categoryMap);
  }, [products]);

  // Agregar "Todos" como primera categoría
  const displayCategories = useMemo(() => {
    const totalCount = products.length;
    return [
      { id_cate: 0, nom_cate: "Todos", count: totalCount },
      ...categories,
    ];
  }, [products, categories]);

  // Imágenes de ejemplo para categorías
  const categoryImages: string[] = [
    "/imagenes/todos.png",
    "/imagenes/FastFood.png",
    "/imagenes/snack.png",
    "/imagenes/bebidas.png",
    "/imagenes/frutas.png",
  ];

  const getImageForCategory = (index: number) => {
    const src = categoryImages[index] || "/imagenes/logo.png";
    return (
      <img
        src={src}
        alt={`Categoría ${index}`}
        className="h-8 w-8 object-contain"
      />
    );
  };

  // Filtrar productos según la categoría seleccionada
  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === 0) return products;
    return products.filter((p) => p.cate_prod.id_cate === selectedCategoryId);
  }, [products, selectedCategoryId]);

  // Configuración de react-slick
  const sliderSettings = {
    dots: true, // Muestra dots debajo del slider
    infinite: false,
    speed: 500,
    slidesToShow: 5, // Número de tarjetas visibles
    slidesToScroll: 1, // Cuántas se desplazan al hacer click
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        },
      },
    ],
  };

  return (
    <ModulePageLayout
      breadcrumbLinkTitle="Ventas"
      breadcrumbPageTitle="Nueva Venta"
      submenu={true}
      isLoading={false}
    >
      {/* Estilos globales para modificar colores de los controles del slider en modo claro y dark */}
      <style jsx global>{`
        /* Flechas en modo claro */
        .slick-prev:before,
        .slick-next:before {
          color: #000000;
          font-size: 1rem;
        }
        /* Flechas en modo dark */
        .dark .slick-prev:before,
        .dark .slick-next:before {
          color: #ffffff;
        }
        /* Dots en modo claro */
        .slick-dots li button:before {
          color: #000000;
          font-size: 0.4rem;
        }
        /* Dots en modo dark */
        .dark .slick-dots li button:before {
          color: #ffffff;
        }
        /* Dot activo en modo claro */
        .slick-dots li.slick-active button:before {
          color: #000000;
        }
        /* Dot activo en modo dark */
        .dark .slick-dots li.slick-active button:before {
          color: #ffffff;
        }
      `}</style>
      <div className="space-y-8 p-6">
        {/* Sección de Categorías */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Categorías</h2>
          <div className="rounded-lg p-4">
            <Slider {...sliderSettings}>
              {displayCategories.map((cat, index) => (
                <div key={cat.id_cate} className="px-2 py-8">
                  <button
                    onClick={() => setSelectedCategoryId(cat.id_cate)}
                    className={`flex w-full transform items-center overflow-hidden rounded-xl border border-border px-4 py-3 shadow-xl transition duration-300 hover:scale-105 hover:bg-[#ffedf4] hover:dark:bg-[#ffedf4] ${
                      selectedCategoryId === cat.id_cate
                        ? "bg-[#f22f46] font-bold text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    <div className="mr-2 flex items-center justify-center rounded-full bg-gray-200 p-1">
                      {getImageForCategory(index)}
                    </div>
                    <div className="flex flex-col items-start">
                      <span
                        className={`text-sm font-medium ${
                          selectedCategoryId === cat.id_cate
                            ? "text-white"
                            : "text-black"
                        }`}
                      >
                        {cat.nom_cate}
                      </span>
                      <span
                        className={`text-xs ${
                          selectedCategoryId === cat.id_cate
                            ? "text-white"
                            : "text-black text-muted-foreground"
                        }`}
                      >
                        ({cat.count}) productos
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </Slider>
          </div>
        </section>

        {/* Sección de Productos */}
        <section>
        <h2 className="mb-4 text-xl font-bold">Nuestros Productos</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id_prod}
                className="transform overflow-hidden rounded-xl bg-white shadow-xl transition duration-300 hover:scale-105"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={product.img_prod || "/placeholder-image.png"}
                    alt={product.nom_prod}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col p-4">
                  <h3 className="truncate text-lg font-semibold text-gray-800">
                    {product.nom_prod}
                  </h3>
                  {product.desc_prod && (
                    <p className="my-2 line-clamp-2 text-sm text-gray-600">
                      {product.desc_prod}
                    </p>
                  )}
                  <div className="mt-auto">
                    <div className="mb-2 text-xl font-bold text-indigo-600">
                      ${product.prec_prod.toFixed(2)}
                    </div>
                    <button
                      className="w-full rounded-lg bg-indigo-600 py-2 text-white transition-colors duration-200 hover:bg-indigo-700"
                      onClick={() =>
                        console.log("Agregar al pedido", product.id_prod)
                      }
                    >
                      Añadir al Pedido
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ModulePageLayout>
  );
}
