using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.User;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface IListenerService
{
    Task<Result<IEnumerable<UserDto>>> GetAvailableListenersAsync(Guid requesterId);
    Task<Result> RequestListenerAsync(Guid requesterId, Guid listenerId);
}
