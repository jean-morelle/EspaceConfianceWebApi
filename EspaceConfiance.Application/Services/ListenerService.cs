using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.User;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.Services;

public class ListenerService(IUnitOfWork uow, INotificationService notificationService) : IListenerService
{
    public async Task<Result<IEnumerable<UserDto>>> GetAvailableListenersAsync(Guid requesterId)
    {
        var listeners = await uow.Users.GetListenersAsync();
        var available = listeners.Where(u => u.Id != requesterId && u.IsOnline);
        var dtos = available.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Bio = u.Bio,
            ProfilePicture = u.ProfilePicture,
            IsListener = true,
            IsOnline = true
        });
        return Result<IEnumerable<UserDto>>.Success(dtos);
    }

    public async Task<Result> RequestListenerAsync(Guid requesterId, Guid listenerId)
    {
        var listener = await uow.Users.GetByIdAsync(listenerId);
        if (listener is null || !listener.IsListener)
            return Result.Failure("Écoutant introuvable.", 404);

        if (!listener.IsOnline)
            return Result.Failure("Cet écoutant n'est pas disponible.", 400);

        var requester = await uow.Users.GetByIdAsync(requesterId);

        await notificationService.CreateNotificationAsync(
            listenerId,
            "Demande de discussion",
            $"{requester!.Username} souhaite vous parler.",
            NotificationType.ListenerRequest,
            requesterId);

        return Result.Success();
    }
}
