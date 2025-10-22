using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentTeacherApi.Models;
using System.Security.Claims;

namespace StudentTeacherApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // student view their own data
        [HttpGet("me")]
        public async Task<IActionResult> GetMyDetails()
        {
            var email = User.FindFirstValue(ClaimTypes.Name);
            if (email == null) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound();

            return Ok(user);
        }

        // teacher: view all
        [HttpGet]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }




        // teacher: create new
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] User newUser)
        {
            if (_context.Users.Any(u => u.Email == newUser.Email))
                return BadRequest("Email already exists");

            newUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newUser.PasswordHash);
            newUser.Role = string.IsNullOrWhiteSpace(newUser.Role) ? "Student" : newUser.Role;
            newUser.IsActive = true;
            newUser.CreatedDate = DateTime.UtcNow;

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok("Registered successfully");
        }


        // teacher: update
        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Update(int id, [FromBody] User updated)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Name = updated.Name;
            user.DateOfBirth = updated.DateOfBirth;
            user.Designation = updated.Designation;
            user.Gender = updated.Gender;
            user.Department = updated.Department;
            user.PhoneNumber = updated.PhoneNumber;
            user.Address = updated.Address;
            user.ProfilePicUrl = updated.ProfilePicUrl;
            user.UpdatedDate = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(updated.PasswordHash))
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updated.PasswordHash);

            await _context.SaveChangesAsync();
            return Ok("Updated successfully");
        }

        // teacher: delete
        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.IsActive = false;
            user.DeletedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Deleted successfully");
        }
    }
}
