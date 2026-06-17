using System.Text.Json;

namespace Auth.Middleware
{
    /// <summary>
    /// Middleware global para capturar excepciones no controladas y devolver
    /// respuestas JSON con el código HTTP adecuado.
    /// </summary>
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        /// <summary>Ejecuta el pipeline y captura excepciones no controladas.</summary>
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocurrió un error no manejado");
                await HandleExceptionAsync(context, ex);
            }
        }

        /// <summary>Escribe la respuesta JSON con el código de estado correspondiente al tipo de excepción.</summary>
        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new
            {
                error = exception.Message,
                statusCode = exception switch
                {
                    UnauthorizedAccessException => 401,
                    InvalidOperationException => 409,
                    KeyNotFoundException => 404,
                    _ => 500
                }
            };

            context.Response.StatusCode = response.statusCode;
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
