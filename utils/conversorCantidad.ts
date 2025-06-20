const palabrasANumero: Record<string, number> = {
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
};

/**
 * Convierte una cadena de texto como "tres" o "3.5" a un número.
 * Devuelve `null` si no es una entrada válida.
 */
export function convertirCantidad(valor: string): number | null {
  const limpio = valor.toLowerCase().trim();
  if (palabrasANumero[limpio]) return palabrasANumero[limpio];
  const num = parseFloat(valor.replace(",", "."));
  return isNaN(num) ? null : num;
}
