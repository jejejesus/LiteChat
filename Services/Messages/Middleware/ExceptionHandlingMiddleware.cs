using Messages.Exceptions;
using System.Text.Json;

namespace Messages.Middleware
{
    /// <summary>
    /// Middleware específico (inner) para capturar y mapear excepciones conocidas
    /// a respuestas HTTP estructuradas. Se ejecuta dentro de <c>ErrorHandlingMiddleware</c>.
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        /// <summary>Ejecuta el pipeline y captura excepciones específicas para devolver errores HTTP semánticos.</summary>
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found");
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await WriteErrorResponse(context, ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await WriteErrorResponse(context, ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation");
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await WriteErrorResponse(context, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await WriteErrorResponse(context, "An error occurred while processing your request");
            }
        }

        /// <summary>Escribe una respuesta JSON con el mensaje de error.</summary>
        private static async Task WriteErrorResponse(HttpContext context, string message)
        {
            context.Response.ContentType = "application/json";
            var response = new { error = message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
