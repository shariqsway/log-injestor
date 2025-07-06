export class DateUtils {
  /**
   * Formats an ISO 8601 timestamp for display to the user
   */
  static formatTimestamp(isoTimestamp: string): string {
    try {
      const date = new Date(isoTimestamp);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid Date";
    }
  }

  /**
   * Converts a datetime-local input value to ISO 8601 string
   */
  static datetimeLocalToISO(datetimeLocalValue: string): string {
    if (!datetimeLocalValue) return "";

    try {
      const date = new Date(datetimeLocalValue);
      return date.toISOString();
    } catch (error) {
      console.error("Error converting datetime-local to ISO:", error);
      return "";
    }
  }

  /**
   * Converts an ISO 8601 string to datetime-local input format
   */
  static isoToDatetimeLocal(isoString: string): string {
    if (!isoString) return "";

    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";

      // Format as YYYY-MM-DDTHH:mm (local time for input)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error converting ISO to datetime-local:", error);
      return "";
    }
  }

  /**
   * Gets the current timestamp in ISO 8601 format
   */
  static getCurrentISOTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Calculates relative time display (e.g., "2 hours ago")
   */
  static getRelativeTime(isoTimestamp: string): string {
    try {
      const date = new Date(isoTimestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSeconds < 60) {
        return "Just now";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
      } else {
        return this.formatTimestamp(isoTimestamp);
      }
    } catch (error) {
      console.error("Error calculating relative time:", error);
      return "Unknown time";
    }
  }

  /**
   * Creates a date range for common filters
   */
  static getDateRange(
    range: "last-hour" | "last-day" | "last-week" | "last-month"
  ): {
    start: string;
    end: string;
  } {
    const now = new Date();
    const end = now.toISOString();
    let start: Date;

    switch (range) {
      case "last-hour":
        start = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "last-day":
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "last-week":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last-month":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return {
      start: start.toISOString(),
      end,
    };
  }
}
