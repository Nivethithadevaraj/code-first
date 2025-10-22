using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using StudentTeacherApi.Controllers;
using StudentTeacherApi.Models; 

namespace StudentTeacherApi.Tests.Controllers
{
    public class AuthControllerTests
    {
        private static IConfiguration GetTestConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string> {
                {"Jwt:Key", "supersecret_test_key_1234567890_ABCDEFGHIJKLMNOPQRSTUVWXYZ"},
                {"Jwt:Issuer", "test_issuer"},
                {"Jwt:Audience", "test_audience"},
                {"Jwt:ExpiresMinutes", "60"},
            };
            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();
        }

        private static AppDbContext CreateInMemoryContext(string dbName = null)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task Register_ShouldReturnBadRequest_WhenEmailExists()
        {
            using var ctx = CreateInMemoryContext();
            // seed existing user
            ctx.Users.Add(new User { Email = "exists@test.com", Name = "Existing", PasswordHash = "x", Role = "Student", CreatedDate = DateTime.UtcNow });
            await ctx.SaveChangesAsync();

            var config = GetTestConfiguration();
            var controller = new AuthController(ctx, config);

            var model = new User { Email = "exists@test.com", Name = "New", PasswordHash = "pw" };

            var result = await controller.Register(model);
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Register_ShouldReturnOk_WhenNewUser()
        {
            using var ctx = CreateInMemoryContext();
            var config = GetTestConfiguration();
            var controller = new AuthController(ctx, config);

            var model = new User { Email = "new@test.com", Name = "New", PasswordHash = "pw", Designation = "Student" };

            var result = await controller.Register(model);

            // success returns Ok("Registered successfully")
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("Registered", ok.Value?.ToString());
            // DB changed
            Assert.NotNull(ctx.Users.FirstOrDefault(u => u.Email == "new@test.com"));
        }

        [Fact]
        public async Task Login_ShouldReturnUnauthorized_WhenInvalidCredentials()
        {
            using var ctx = CreateInMemoryContext();
            var config = GetTestConfiguration();
            var controller = new AuthController(ctx, config);

            var login = new LoginRequest { Email = "notfound@test.com", Password = "pw" };
            var result = await controller.Login(login);
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Login_ShouldReturnOk_WhenValidCredentials()
        {
            using var ctx = CreateInMemoryContext();
            // create user with hashed password using BCrypt
            var plain = "mypassword";
            var hashed = BCrypt.Net.BCrypt.HashPassword(plain);
            ctx.Users.Add(new User { Email = "john@test.com", Name = "John", PasswordHash = hashed, Role = "Teacher", CreatedDate = DateTime.UtcNow });
            await ctx.SaveChangesAsync();

            var config = GetTestConfiguration();
            var controller = new AuthController(ctx, config);

            var login = new LoginRequest { Email = "john@test.com", Password = plain };
            var result = await controller.Login(login);

            var ok = Assert.IsType<OkObjectResult>(result);
            // returned object contains token, role and name
            var dict = ok.Value as IDictionary<string, object> ?? (ok.Value as dynamic);
            // simpler: just assert not null / contains token string in serialized form
            Assert.NotNull(ok.Value);
            var text = ok.Value!.ToString() ?? "";
            Assert.Contains("token", text, StringComparison.OrdinalIgnoreCase);
            Assert.Contains("John", text, StringComparison.OrdinalIgnoreCase);
        }
    }
}
