using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResQConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveForecastSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PasswordHash", "Phone" },
                values: new object[] { "AQAAAAIAAYagAAAAENJe0hnqhwAqMI07tIFqUAPIJQTWeD+StLIiRdNXJXojMpcBO5utFlZu0Og/nSOzBg==", "9875648517" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "DisasterForecasts",
                columns: new[] { "Id", "DistrictName", "EstimatedPopulationImpact", "ForecastDate", "HistoricalFrequency", "RainfallIntensity", "RiskCategory", "RiskScore", "RiverLevelPercentage", "StateName", "VulnerabilityIndex" },
                values: new object[,]
                {
                    { 1, "Wayanad", 45000, new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8431), 4, 150.0, "Critical", 92.349999999999994, 85.0, "Kerala", 0.84999999999999998 },
                    { 2, "Cuttack", 75000, new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8433), 5, 110.0, "High", 77.099999999999994, 92.0, "Odisha", 0.59999999999999998 },
                    { 3, "Chamoli", 12000, new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8436), 3, 90.0, "High", 66.450000000000003, 75.0, "Uttarakhand", 0.75 },
                    { 4, "Mumbai Suburbs", 250000, new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8438), 2, 70.0, "Medium", 47.799999999999997, 50.0, "Maharashtra", 0.5 },
                    { 5, "Dharamshala", 5000, new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8440), 1, 30.0, "Low", 24.399999999999999, 25.0, "Himachal Pradesh", 0.40000000000000002 }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PasswordHash", "Phone" },
                values: new object[] { "AQAAAAIAAYagAAAAEKZGXiWn6A2IPwMqW1CBXqnCdduF0nvVWAk3v8rTmMOcCeaEkC0hV4iuE2O7wapP7Q==", "+1234567890" });
        }
    }
}

