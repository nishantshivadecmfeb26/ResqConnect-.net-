using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResQConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSOSWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Disasters_DisasterId",
                table: "SOSRequests");

            migrationBuilder.AlterColumn<int>(
                name: "DisasterId",
                table: "SOSRequests",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedDate",
                table: "SOSRequests",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedNGOId",
                table: "SOSRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedVolunteerId",
                table: "SOSRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedDate",
                table: "SOSRequests",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactNumber",
                table: "SOSRequests",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "CurrentStatus",
                table: "SOSRequests",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DisasterType",
                table: "SOSRequests",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "EmergencyLevel",
                table: "SOSRequests",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "GovernmentOfficerId",
                table: "SOSRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfPeople",
                table: "SOSRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ProofImageUrl",
                table: "SOSRequests",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "SOSRequests",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "VictimName",
                table: "SOSRequests",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

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

            migrationBuilder.CreateIndex(
                name: "IX_SOSRequests_AssignedNGOId",
                table: "SOSRequests",
                column: "AssignedNGOId");

            migrationBuilder.CreateIndex(
                name: "IX_SOSRequests_AssignedVolunteerId",
                table: "SOSRequests",
                column: "AssignedVolunteerId");

            migrationBuilder.CreateIndex(
                name: "IX_SOSRequests_GovernmentOfficerId",
                table: "SOSRequests",
                column: "GovernmentOfficerId");

            migrationBuilder.AddForeignKey(
                name: "FK_SOSRequests_Disasters_DisasterId",
                table: "SOSRequests",
                column: "DisasterId",
                principalTable: "Disasters",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Disasters_DisasterId",
                table: "SOSRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_AssignedNGOId",
                table: "SOSRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_AssignedVolunteerId",
                table: "SOSRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SOSRequests_Users_GovernmentOfficerId",
                table: "SOSRequests");

            migrationBuilder.DropIndex(
                name: "IX_SOSRequests_AssignedNGOId",
                table: "SOSRequests");

            migrationBuilder.DropIndex(
                name: "IX_SOSRequests_AssignedVolunteerId",
                table: "SOSRequests");

            migrationBuilder.DropIndex(
                name: "IX_SOSRequests_GovernmentOfficerId",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "AssignedDate",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "AssignedNGOId",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "AssignedVolunteerId",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "CompletedDate",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "ContactNumber",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "CurrentStatus",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "DisasterType",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "EmergencyLevel",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "GovernmentOfficerId",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "NumberOfPeople",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "ProofImageUrl",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "SOSRequests");

            migrationBuilder.DropColumn(
                name: "VictimName",
                table: "SOSRequests");

            migrationBuilder.AlterColumn<int>(
                name: "DisasterId",
                table: "SOSRequests",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

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
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAECy1HoGjkMcthXPfFFuclpEyidHjoquBcg78pE8ZkFm2cEyZAz18CSR3uOmo48mMWw==");

            migrationBuilder.AddForeignKey(
                name: "FK_SOSRequests_Disasters_DisasterId",
                table: "SOSRequests",
                column: "DisasterId",
                principalTable: "Disasters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

