/**
 * Formats event price in paise (integer) to Indian Rupee currency string or 'Free'.
 * Example: 0 -> 'Free'
 * Example: 150000 paise -> ₹1,500
 * Example: 15000000 paise -> ₹1,50,000
 */
export function formatPrice(priceInPaise: number): string {
  if (priceInPaise <= 0) {
    return "Free";
  }

  const rupees = priceInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: priceInPaise % 100 === 0 ? 0 : 2,
  }).format(rupees);
}

/**
 * Formats a Date/string to 'Sat, 18 Oct, 6:30 PM' using Asia/Kolkata timezone.
 */
export function formatEventDate(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formatter.format(date);
}

/**
 * Formats a Date to ISO string formatted for datetime-local input (YYYY-MM-DDTHH:mm).
 */
export function formatForDateTimeInput(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  // Convert to local time equivalent for input
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
