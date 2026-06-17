using EspaceConfiance.Application.DTOs.Report;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfianceWebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EspaceConfianceWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReportDto dto)
    {
        var result = await reportService.CreateReportAsync(User.GetUserId(), dto);
        return result.IsSuccess
            ? StatusCode(result.StatusCode)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
