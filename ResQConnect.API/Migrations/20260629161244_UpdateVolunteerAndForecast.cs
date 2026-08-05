using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResQConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVolunteerAndForecast : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CredibilityScore",
                table: "Volunteers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "DocumentUrl",
                table: "Volunteers",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "IdProofNumber",
                table: "Volunteers",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "SkillTier",
                table: "Volunteers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RequiredSkillTier",
                table: "Tasks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "DisasterForecasts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DistrictName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StateName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RainfallIntensity = table.Column<double>(type: "double", nullable: false),
                    RiverLevelPercentage = table.Column<double>(type: "double", nullable: false),
                    HistoricalFrequency = table.Column<int>(type: "int", nullable: false),
                    VulnerabilityIndex = table.Column<double>(type: "double", nullable: false),
                    RiskScore = table.Column<double>(type: "double", nullable: false),
                    RiskCategory = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EstimatedPopulationImpact = table.Column<int>(type: "int", nullable: false),
                    ForecastDate = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisasterForecasts", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "DisasterForecasts",
                columns: new[] { "Id", "DistrictName", "EstimatedPopulationImpact", "ForecastDate", "HistoricalFrequency", "RainfallIntensity", "RiskCategory", "RiskScore", "RiverLevelPercentage", "StateName", "VulnerabilityIndex" },
                values: new object[,]
                {
                    { 1, "Wayanad", 45000, new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4372), 4, 150.0, "Critical", 92.349999999999994, 85.0, "Kerala", 0.84999999999999998 },
                    { 2, "Cuttack", 75000, new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4375), 5, 110.0, "High", 77.099999999999994, 92.0, "Odisha", 0.59999999999999998 },
                    { 3, "Chamoli", 12000, new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4378), 3, 90.0, "High", 66.450000000000003, 75.0, "Uttarakhand", 0.75 },
                    { 4, "Mumbai Suburbs", 250000, new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4380), 2, 70.0, "Medium", 47.799999999999997, 50.0, "Maharashtra", 0.5 },
                    { 5, "Dharamshala", 5000, new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4382), 1, 30.0, "Low", 24.399999999999999, 25.0, "Himachal Pradesh", 0.40000000000000002 }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAECNUzUfpLJjqAQtF3Xle8YdctM9f8JkNpeMpuLS9sas/rL2I5A4+S+I0YxDwP4+YAw==");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DisasterForecasts");

            migrationBuilder.DropColumn(
                name: "CredibilityScore",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "DocumentUrl",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "IdProofNumber",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "SkillTier",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "RequiredSkillTier",
                table: "Tasks");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEOV/uPsN4ct/4Bh4TV+46GkXCjDY5KtbTLcRK1QsJW5wtqg5jUDPurifxxk52X8rNA==");
        }
    }
}

