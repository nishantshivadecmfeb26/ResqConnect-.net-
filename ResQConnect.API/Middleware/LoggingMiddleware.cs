using System.Diagnostics;

namespace ResQConnect.API.Middleware
{
    public class LoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<LoggingMiddleware> _logger;

        public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var request = context.Request;

            _logger.LogInformation("HTTP Request Started: {Method} {Path}{Query}", request.Method, request.Path, request.QueryString);

            await _next(context);

            stopwatch.Stop();
            var response = context.Response;

            _logger.LogInformation("HTTP Request Finished: {Method} {Path} -> {StatusCode} ({ElapsedMilliseconds}ms)", 
                request.Method, request.Path, response.StatusCode, stopwatch.ElapsedMilliseconds);
        }
    }
}

