using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResQConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCampIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CampId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "DisasterId",
                table: "ReliefCamps",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CampId", "PasswordHash" },
                values: new object[] { null, "AQAAAAIAAYagAAAAEEleYSFvVIJ+CM8BiO5U3Gh3SQgzHnuJLhXYbxZ6zbce5heY6pAQVDnNGE1R59gGtQ==" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_CampId",
                table: "Users",
                column: "CampId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_ReliefCamps_CampId",
                table: "Users",
                column: "CampId",
                principalTable: "ReliefCamps",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_ReliefCamps_CampId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_CampId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CampId",
                table: "Users");

            migrationBuilder.AlterColumn<int>(
                name: "DisasterId",
                table: "ReliefCamps",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "AQAAAAIAAYagAAAAEJpsEcaWCSdTEZziQzm0pDmisTwAcGEZKZXVzO/RrUIURtX/m7TI5hhIglYZmftW9w==");
        }
    }
}
