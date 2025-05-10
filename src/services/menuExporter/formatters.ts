
/**
 * Format phone number for display
 * @param phone The phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length === 13) {
    // International format: +55 (11) 99999-9999
    return `+${digits.substring(0, 2)} (${digits.substring(2, 4)}) ${digits.substring(4, 9)}-${digits.substring(9, 13)}`;
  } else if (digits.length === 11) {
    // National format: (11) 99999-9999
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
  } else {
    // Return as is if format is unknown
    return phone;
  }
};

/**
 * Format price for display
 * @param price The price to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return price.toFixed(2).replace(".", ",");
};
