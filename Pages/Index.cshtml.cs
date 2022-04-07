using Grpc.Net.Client;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Trojan.Api;

namespace Clover.Pages;

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(ILogger<IndexModel> logger)
    {
        _logger = logger;
    }

    public async Task OnGet(CancellationToken ct)
    {
        var channel = GrpcChannel.ForAddress("https://localhost:5001");
        var client = new TrojanServerService.TrojanServerServiceClient(channel);
        using var call = client.ListUsers(new ListUsersRequest { }, cancellationToken: ct);

        while (await call.ResponseStream.MoveNext(ct))
        {
            Console.WriteLine("Greeting: " + call.ResponseStream.Current.Status);
        }
    }
}
