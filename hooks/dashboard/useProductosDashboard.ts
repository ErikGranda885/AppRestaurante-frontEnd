export function useProductosDashboard() {
  const populares = [
    {
      name: "Southwest Scramble Bowl",
      orders: 26,
      img: "/images/dish1.png",
    },
    {
      name: "Hickory Smoked Bacon",
      orders: 24,
      img: "/images/dish2.png",
    },
    {
      name: "Chicken Tender Plate",
      orders: 23,
      img: "/images/dish3.png",
    },
    {
      name: "Grilled Chicken Sandwich",
      orders: 22,
      img: "/images/dish4.png",
    },
    {
      name: "BBQ Bacon Burger",
      orders: 22,
      img: "/images/dish5.png",
    },
  ];

  const caducar = [
    {
      name: "Leche Entera Pasteurizada",
      expiresIn: "2 días",
      img: "/images/leche.png",
    },
    {
      name: "Yogur de Frutilla 1L",
      expiresIn: "3 días",
      img: "/images/yogur.png",
    },
    {
      name: "Jamón de Pavo",
      expiresIn: "4 días",
      img: "/images/jamon.png",
    },
    {
      name: "Queso Fresco",
      expiresIn: "5 días",
      img: "/images/queso.png",
    },
    {
      name: "Pan de Molde",
      expiresIn: "5 días",
      img: "/images/pan.png",
    },
  ];

  return { populares, caducar };
}
