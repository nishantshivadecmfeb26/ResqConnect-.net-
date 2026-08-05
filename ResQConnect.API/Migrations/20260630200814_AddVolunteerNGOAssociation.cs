using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResQConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerNGOAssociation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedNGOId",
                table: "Volunteers",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 1,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8431));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 2,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8433));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 3,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8436));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 4,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8438));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 5,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 20, 8, 14, 461, DateTimeKind.Utc).AddTicks(8440));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEKZGXiWn6A2IPwMqW1CBXqnCdduF0nvVWAk3v8rTmMOcCeaEkC0hV4iuE2O7wapP7Q==");

            migrationBuilder.CreateIndex(
                name: "IX_Volunteers_AssignedNGOId",
                table: "Volunteers",
                column: "AssignedNGOId");

            migrationBuilder.AddForeignKey(
                name: "FK_Volunteers_Users_AssignedNGOId",
                table: "Volunteers",
                column: "AssignedNGOId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Volunteers_Users_AssignedNGOId",
                table: "Volunteers");

            migrationBuilder.DropIndex(
                name: "IX_Volunteers_AssignedNGOId",
                table: "Volunteers");

            migrationBuilder.DropColumn(
                name: "AssignedNGOId",
                table: "Volunteers");

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 1,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 56, 8, 260, DateTimeKind.Utc).AddTicks(4571));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 2,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 56, 8, 260, DateTimeKind.Utc).AddTicks(4574));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 3,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 56, 8, 260, DateTimeKind.Utc).AddTicks(4576));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 4,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 56, 8, 260, DateTimeKind.Utc).AddTicks(4578));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 5,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 56, 8, 260, DateTimeKind.Utc).AddTicks(4580));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAELo8zYB4QlBk3pFSeMl5wCt4uy29LAdK1iE2zASyopJahD/bXoe+gh0yOGyskWiqOw==");
        }
    }
}

