using System.Text.RegularExpressions;

namespace ResQConnect.API.Utils
{
    /// <summary>
    /// Helper class for custom regex validations across the application
    /// </summary>
    public static class ValidationHelper
    {
        // Regex patterns
        private static readonly Regex PhoneRegex = new Regex(@"^(?:\+91|0)?[6-9]\d{9}$", RegexOptions.Compiled);
        private static readonly Regex NameRegex = new Regex(@"^[a-zA-Z\s'-]{2,100}$", RegexOptions.Compiled);
        private static readonly Regex LatitudeRegex = new Regex(@"^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$", RegexOptions.Compiled);
        private static readonly Regex LongitudeRegex = new Regex(@"^[-+]?(1[0-7]\d(\.\d+)?|180(\.0+)?|[1-9]?\d(\.\d+)?)$", RegexOptions.Compiled);
        private static readonly Regex AlphanumericSpaceRegex = new Regex(@"^[a-zA-Z0-9\s\-',./()&]{1,255}$", RegexOptions.Compiled);
        private static readonly Regex SafeDescriptionRegex = new Regex(@"^[a-zA-Z0-9\s\-',./()&!?\n]{1,1000}$", RegexOptions.Compiled);

        /// <summary>
        /// Validates Indian phone number format (10 digits, optional +91 prefix)
        /// Examples: 9953640910, +919953640910, 09953640910
        /// </summary>
        public static bool IsValidPhoneNumber(string? phone)
        {
            return !string.IsNullOrWhiteSpace(phone) && PhoneRegex.IsMatch(phone);
        }

        /// <summary>
        /// Validates person name (letters, spaces, hyphens, apostrophes)
        /// </summary>
        public static bool IsValidName(string? name)
        {
            return !string.IsNullOrWhiteSpace(name) && NameRegex.IsMatch(name);
        }

        /// <summary>
        /// Validates latitude/longitude coordinate (-90 to 90 for lat, -180 to 180 for lon)
        /// </summary>
        public static bool IsValidLatitude(double latitude)
        {
            return latitude >= -90 && latitude <= 90 && LatitudeRegex.IsMatch(latitude.ToString(System.Globalization.CultureInfo.InvariantCulture));
        }

        /// <summary>
        /// Validates longitude (-180 to 180)
        /// </summary>
        public static bool IsValidLongitude(double longitude)
        {
            return longitude >= -180 && longitude <= 180 && LongitudeRegex.IsMatch(longitude.ToString(System.Globalization.CultureInfo.InvariantCulture));
        }

        /// <summary>
        /// Validates alphanumeric address/location field
        /// </summary>
        public static bool IsValidAddress(string? address)
        {
            return !string.IsNullOrWhiteSpace(address) && 
                   address.Length >= 3 && 
                   address.Length <= 255 && 
                   AlphanumericSpaceRegex.IsMatch(address);
        }

        /// <summary>
        /// Validates safe description field (prevents common injection patterns)
        /// </summary>
        public static bool IsValidDescription(string? description)
        {
            return !string.IsNullOrWhiteSpace(description) && 
                   description.Length >= 5 && 
                   description.Length <= 1000 && 
                   SafeDescriptionRegex.IsMatch(description) &&
                   !ContainsSqlInjectionPatterns(description) &&
                   !ContainsScriptPatterns(description);
        }

        /// <summary>
        /// Checks for common SQL injection patterns
        /// </summary>
        private static bool ContainsSqlInjectionPatterns(string text)
        {
            var sqlPatterns = new[] 
            { 
                "DROP TABLE", "DELETE FROM", "INSERT INTO", "UPDATE ", 
                "SELECT * FROM", "UNION SELECT", "--", "/*", "*/", "xp_", "sp_"
            };
            
            var upperText = text.ToUpper();
            return sqlPatterns.Any(pattern => upperText.Contains(pattern));
        }

        /// <summary>
        /// Checks for script injection patterns
        /// </summary>
        private static bool ContainsScriptPatterns(string text)
        {
            var scriptPatterns = new[] 
            { 
                "<script", "javascript:", "onerror=", "onclick=", "onload=", 
                "eval(", "alert(", "document.cookie"
            };
            
            var lowerText = text.ToLower();
            return scriptPatterns.Any(pattern => lowerText.Contains(pattern));
        }

        /// <summary>
        /// Validates person count (must be positive integer)
        /// </summary>
        public static bool IsValidPersonCount(int count)
        {
            return count > 0 && count <= 10000;
        }

        /// <summary>
        /// Validates capacity (must be positive integer)
        /// </summary>
        public static bool IsValidCapacity(int capacity)
        {
            return capacity > 0 && capacity <= 100000;
        }

        /// <summary>
        /// Sanitize user input by removing potentially dangerous characters
        /// </summary>
        public static string SanitizeInput(string? input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            // Remove characters that could be used for injection
            input = input.Replace("<", "")
                        .Replace(">", "")
                        .Replace("\"", "")
                        .Replace("'", "")
                        .Replace(";", "")
                        .Replace("&", "&amp;");

            return input.Trim();
        }
    }
}
