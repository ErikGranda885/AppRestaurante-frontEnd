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

  const displayCategories = useMemo(() => {
    const totalCount = products.length;
    return [
      { id_cate: 0, nom_cate: "Todos", count: totalCount },
      ...categories,
    ];
  }, [products, categories]);

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
        width={24}
        height={24}
        className="object-contain"
      />
    );
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === 0) return products;
    return products.filter((p) => p.cate_prod.id_cate === selectedCategoryId);
  }, [products, selectedCategoryId]);

  // Configuración del slider
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4, // Muestra 4 categorías a la vez
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
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
      {/* Estilos globales para personalizar el slider */}
      <style jsx global>{`
        /* Para que el slider se justifique al ancho del contenedor */
        .categories-slider .slick-track {
          display: flex !important;
          justify-content: space-between;
          align-items: flex-start;
        }
        /* Definimos el ancho de cada slide según el número deseado */
        /* Para desktop: 4 slides */
        @media (min-width: 1025px) {
          .categories-slider .slick-slide {
            width: calc(100% / 4) !important;
          }
        }
        /* Para pantallas medianas: 3 slides */
        @media (max-width: 1024px) and (min-width: 641px) {
          .categories-slider .slick-slide {
            width: calc(100% / 3) !important;
          }
        }
        /* Para pantallas pequeñas: 2 slides */
        @media (max-width: 640px) and (min-width: 481px) {
          .categories-slider .slick-slide {
            width: calc(100% / 2) !important;
          }
        }
        /* Para móviles: 1 slide */
        @media (max-width: 480px) {
          .categories-slider .slick-slide {
            width: 100% !important;
          }
        }
        /* Ajuste del espacio entre slides */
        .categories-slider .slick-slide > div {
          margin: 0 8px;
        }
        .categories-slider .slick-list {
          margin: 0 -8px;
          overflow: hidden;
        }
      `}</style>

      <div className="space-y-8 p-6">
        {/* Sección Categorías */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Categorías</h2>
          {/* Contenedor que limita el ancho del slider */}
          <div className="w-full bg-blue-400 ">
            <div className="categories-slider max-w-7xl  w-full bg-red-400 p-4">
              <Slider {...sliderSettings}>
                {displayCategories.map((cat, index) => (
                  <div key={cat.id_cate}>
                    {/* Nota: se eliminó la clase "w-48" para que el ancho sea calculado */}
                    <div
                      className={`w-48 cursor-pointer overflow-hidden rounded-lg border border-border  shadow-md transition-transform duration-200 hover:scale-105 ${
                        selectedCategoryId === cat.id_cate
                          ? "border-indigo-500 bg-indigo-100"
                          : ""
                      }`}
                      onClick={() => setSelectedCategoryId(cat.id_cate)}
                    >
                      {/* Puedes incluir la imagen si lo deseas */}
                      {getImageForCategory(index)}
                      <div className="font-semibold mt-2">{cat.nom_cate}</div>
                      <span className="text-xs text-muted-foreground">
                        ({cat.count}) productos
                      </span>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </section>

        {/* Sección Productos */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Nuestros Productos
          </h2>
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
