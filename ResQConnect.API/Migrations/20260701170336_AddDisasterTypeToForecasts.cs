using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResQConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDisasterTypeToForecasts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEJpsEcaWCSdTEZziQzm0pDmisTwAcGEZKZXVzO/RrUIURtX/m7TI5hhIglYZmftW9w==");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAENJe0hnqhwAqMI07tIFqUAPIJQTWeD+StLIiRdNXJXojMpcBO5utFlZu0Og/nSOzBg==");
        }
    }
}
