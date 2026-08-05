using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResQConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ProgressNotes",
                table: "Tasks",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ProofImageUrl",
                table: "Tasks",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "SOSRequests",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "SOSRequests",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 1,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 17, 51, 31, 552, DateTimeKind.Utc).AddTicks(8627));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 2,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 17, 51, 31, 552, DateTimeKind.Utc).AddTicks(8630));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 3,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 17, 51, 31, 552, DateTimeKind.Utc).AddTicks(8632));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 4,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 17, 51, 31, 552, DateTimeKind.Utc).AddTicks(8634));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 5,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 17, 51, 31, 552, DateTimeKind.Utc).AddTicks(8637));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "IsActive", "PasswordHash" },
                values: new object[] { true, "AQAAAAIAAYagAAAAECy1HoGjkMcthXPfFFuclpEyidHjoquBcg78pE8ZkFm2cEyZAz18CSR3uOmo48mMWw==" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProgressNotes",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "ProofImageUrl",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "SOSRequests");

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 1,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4372));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 2,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4375));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 3,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4378));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 4,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4380));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 5,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 29, 16, 12, 43, 600, DateTimeKind.Utc).AddTicks(4382));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAECNUzUfpLJjqAQtF3Xle8YdctM9f8JkNpeMpuLS9sas/rL2I5A4+S+I0YxDwP4+YAw==");
        }
    }
}

