using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResQConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class FixUserDeleteCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Disasters_Users_CreatedBy",
                table: "Disasters");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_AssignedNGOId",
                table: "SOSRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_AssignedVolunteerId",
                table: "SOSRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_GovernmentOfficerId",
                table: "SOSRequests");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Disasters_Users_CreatedBy",
                table: "Disasters",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SOSRequests_Users_AssignedNGOId",
                table: "SOSRequests",
                column: "AssignedNGOId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SOSRequests_Users_AssignedVolunteerId",
                table: "SOSRequests",
                column: "AssignedVolunteerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SOSRequests_Users_GovernmentOfficerId",
                table: "SOSRequests",
                column: "GovernmentOfficerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Disasters_Users_CreatedBy",
                table: "Disasters");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_AssignedNGOId",
                table: "SOSRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_AssignedVolunteerId",
                table: "SOSRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_GovernmentOfficerId",
                table: "SOSRequests");

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 1,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 33, 1, 625, DateTimeKind.Utc).AddTicks(8789));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 2,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 33, 1, 625, DateTimeKind.Utc).AddTicks(8793));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 3,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 33, 1, 625, DateTimeKind.Utc).AddTicks(8796));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 4,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 33, 1, 625, DateTimeKind.Utc).AddTicks(8800));

            migrationBuilder.UpdateData(
                table: "DisasterForecasts",
                keyColumn: "Id",
                keyValue: 5,
                column: "ForecastDate",
                value: new DateTime(2026, 6, 30, 18, 33, 1, 625, DateTimeKind.Utc).AddTicks(8802));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEIKMril0Vk+GPF1ezMjHouwuLzQRBSdxvxb+48UXwI9RDEPfV9ue2jzQtVSfLTf2aQ==");

            migrationBuilder.AddForeignKey(
                name: "FK_Disasters_Users_CreatedBy",
                table: "Disasters",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SOSRequests_Users_AssignedNGOId",
                table: "SOSRequests",
                column: "AssignedNGOId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SOSRequests_Users_AssignedVolunteerId",
                table: "SOSRequests",
                column: "AssignedVolunteerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SOSRequests_Users_GovernmentOfficerId",
                table: "SOSRequests",
                column: "GovernmentOfficerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

