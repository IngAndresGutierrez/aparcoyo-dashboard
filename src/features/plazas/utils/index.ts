/**
 * Formatea una fecha en formato "Jan 16, 2025"
 */
export const formatPublicationDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Formatea el precio con el símbolo de euro
 */
export const formatPrice = (price: number): string => {
  return `€${price}`;
};

/**
 * Obtiene la inicial del nombre en mayúscula
 */
export const getInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

/**
 * Capitaliza el tipo de plaza
 */
export const formatPlazaType = (tipo: string): string => {
  return `Plaza ${tipo}`;
};
