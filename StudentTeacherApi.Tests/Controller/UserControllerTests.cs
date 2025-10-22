using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using StudentTeacherApi.Controllers;
using StudentTeacherApi.Models; 

namespace StudentTeacherApi.Tests.Controllers
{
    public class UserControllerTests
    {
        private static AppDbContext CreateInMemoryContext(string dbName = null)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }
        [Fact]
        public async Task GetMyDetails_ShouldReturnUnauthorized_WhenNoClaims()
        {
            using var ctx = CreateInMemoryContext();
            var controller = new UserController(ctx);

            // attach empty HttpContext with no user
            controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext()
            };

            var result = await controller.GetMyDetails();
            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task GetMyDetails_ShouldReturnUser_WhenClaimPresent()
        {
            using var ctx = CreateInMemoryContext();
            ctx.Users.Add(new User { Email = "me@test.com", Name = "Me", PasswordHash = "x", CreatedDate = DateTime.UtcNow });
            await ctx.SaveChangesAsync();

            var controller = new UserController(ctx);
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
                new Claim(ClaimTypes.Name, "me@test.com")
            }, "TestAuth"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userClaims }
            };

            var result = await controller.GetMyDetails();
            var ok = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<User>(ok.Value);
            Assert.Equal("me@test.com", returned.Email);
        }

        [Fact]
        public async Task GetAll_ShouldReturnList_WhenUsersExist()
        {
            using var ctx = CreateInMemoryContext();
            ctx.Users.Add(new User { Email = "u1@test.com", Name = "U1", PasswordHash = "x", CreatedDate = DateTime.UtcNow });
            ctx.Users.Add(new User { Email = "u2@test.com", Name = "U2", PasswordHash = "x", CreatedDate = DateTime.UtcNow });
            await ctx.SaveChangesAsync();

            var controller = new UserController(ctx);

            var result = await controller.GetAll();
            var ok = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<System.Collections.IEnumerable>(ok.Value);
        }

        [Fact]
        public async Task RegisterUserViaUserController_ShouldCreate()
        {
            using var ctx = CreateInMemoryContext();
            var controller = new UserController(ctx);

            var newUser = new User { Email = "reg@test.com", Name = "Reg", PasswordHash = "pw", Designation = "Student" };

            var result = await controller.Register(newUser);
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ctx.Users.FirstOrDefault(u => u.Email == "reg@test.com"));
        }

        [Fact]
        public async Task Update_ShouldReturnNotFound_WhenUserMissing()
        {
            using var ctx = CreateInMemoryContext();
            var controller = new UserController(ctx);

            var updated = new User { Name = "X" };
            var res = await controller.Update(999, updated);
            Assert.IsType<NotFoundResult>(res);
        }

        [Fact]
        public async Task Delete_ShouldReturnNotFound_WhenUserMissing()
        {
            using var ctx = CreateInMemoryContext();
            var controller = new UserController(ctx);

            var res = await controller.Delete(999);
            Assert.IsType<NotFoundResult>(res);
        }

        [Fact]
        public async Task Delete_ShouldReturnOk_WhenUserExists()
        {
            using var ctx = CreateInMemoryContext();
            ctx.Users.Add(new User { Email = "del@test.com", Name = "D", PasswordHash = "x", CreatedDate = DateTime.UtcNow });
            await ctx.SaveChangesAsync();

            var controller = new UserController(ctx);
            var result = await controller.Delete(ctx.Users.First().UserId);
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.False(ctx.Users.First().IsActive);
        }
    }
}
