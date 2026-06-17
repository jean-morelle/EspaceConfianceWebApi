using EspaceConfiance.Application.DTOs.Admin;
using EspaceConfiance.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EspaceConfianceWebApi.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(IAdminService adminService, IReportService reportService) : ControllerBase
{
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var result = await adminService.GetAllUsersAsync();
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("users/{userId:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid userId, [FromQuery] bool suspend = true)
    {
        var result = await adminService.SuspendUserAsync(userId, suspend);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("users/{userId:guid}")]
    public async Task<IActionResult> Delete(Guid userId)
    {
        var result = await adminService.DeleteUserAsync(userId);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var result = await reportService.GetAllReportsAsync();
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("reports/{reportId:guid}")]
    public async Task<IActionResult> UpdateReport(Guid reportId, [FromBody] UpdateReportDto dto)
    {
        var result = await reportService.UpdateReportStatusAsync(reportId, dto);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
