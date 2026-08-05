using Microsoft.EntityFrameworkCore;
using ResQConnect.API.Models;
using Microsoft.AspNetCore.Identity;

namespace ResQConnect.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Disaster> Disasters { get; set; }
        public DbSet<SOSRequest> SOSRequests { get; set; }
        public DbSet<ReliefCamp> ReliefCamps { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Volunteer> Volunteers { get; set; }
        public DbSet<TaskEntity> Tasks { get; set; }
        public DbSet<MissingPerson> MissingPersons { get; set; }
        public DbSet<DisasterForecast> DisasterForecasts { get; set; }
        public DbSet<HazardReport> HazardReports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User -> Role relationship
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Disaster -> Creator relationship
            modelBuilder.Entity<Disaster>()
                .HasOne(d => d.Creator)
                .WithMany(u => u.Disasters)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.Cascade);

            // SOSRequest -> User & Disaster relationships
            modelBuilder.Entity<SOSRequest>()
                .HasOne(s => s.User)
                .WithMany(u => u.SOSRequests)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SOSRequest>()
                .HasOne(s => s.Disaster)
                .WithMany(d => d.SOSRequests)
                .HasForeignKey(s => s.DisasterId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<SOSRequest>()
                .HasOne(s => s.AssignedNGO)
                .WithMany()
                .HasForeignKey(s => s.AssignedNGOId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<SOSRequest>()
                .HasOne(s => s.AssignedVolunteer)
                .WithMany()
                .HasForeignKey(s => s.AssignedVolunteerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<SOSRequest>()
                .HasOne(s => s.GovernmentOfficer)
                .WithMany()
                .HasForeignKey(s => s.GovernmentOfficerId)
                .OnDelete(DeleteBehavior.SetNull);

            // ReliefCamp -> Disaster relationship
            modelBuilder.Entity<ReliefCamp>()
                .HasOne(c => c.Disaster)
                .WithMany(d => d.ReliefCamps)
                .HasForeignKey(c => c.DisasterId)
                .OnDelete(DeleteBehavior.Cascade);

            // Resource -> ReliefCamp relationship
            modelBuilder.Entity<Resource>()
                .HasOne(r => r.ReliefCamp)
                .WithMany(c => c.Resources)
                .HasForeignKey(r => r.CampId)
                .OnDelete(DeleteBehavior.Cascade);

            // Notification -> User relationship
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Volunteer -> User relationship
            modelBuilder.Entity<Volunteer>()
                .HasOne(v => v.User)
                .WithOne(u => u.Volunteer)
                .HasForeignKey<Volunteer>(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> ReliefCamp relationship
            modelBuilder.Entity<User>()
                .HasOne(u => u.Camp)
                .WithMany()
                .HasForeignKey(u => u.CampId)
                .OnDelete(DeleteBehavior.SetNull);

            // Volunteer -> NGO relationship
            modelBuilder.Entity<Volunteer>()
                .HasOne(v => v.AssignedNGO)
                .WithMany()
                .HasForeignKey(v => v.AssignedNGOId)
                .OnDelete(DeleteBehavior.SetNull);

            // Task -> Volunteer & ReliefCamp relationships
            modelBuilder.Entity<TaskEntity>()
                .HasOne(t => t.Volunteer)
                .WithMany(v => v.Tasks)
                .HasForeignKey(t => t.VolunteerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<TaskEntity>()
                .HasOne(t => t.ReliefCamp)
                .WithMany(c => c.Tasks)
                .HasForeignKey(t => t.CampId)
                .OnDelete(DeleteBehavior.Cascade);

            // MissingPerson -> Reporter relationship
            modelBuilder.Entity<MissingPerson>()
                .HasOne(m => m.Reporter)
                .WithMany(u => u.MissingPersons)
                .HasForeignKey(m => m.ReporterId)
                .OnDelete(DeleteBehavior.Cascade);

            // HazardReport -> Reporter relationship
            modelBuilder.Entity<HazardReport>()
                .HasOne(h => h.Reporter)
                .WithMany()
                .HasForeignKey(h => h.ReporterId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Victim" },
                new Role { Id = 2, Name = "Volunteer" },
                new Role { Id = 3, Name = "NGO" },
                new Role { Id = 4, Name = "Government Officer" },
                new Role { Id = 5, Name = "Admin" }
            );

            // Seed Admin User (Password is 'Admin@123')
            var hasher = new PasswordHasher<User>();
            var adminUser = new User
            {
                Id = 1,
                Name = "System Administrator",
                Email = "admin@ResQConnect.com",
                Phone = "9875648517",
                RoleId = 5, // Admin
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin@123");

            modelBuilder.Entity<User>().HasData(adminUser);


        }
    }
}

