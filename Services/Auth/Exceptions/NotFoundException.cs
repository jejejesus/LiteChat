namespace Auth.Exceptions;

/// <summary>Excepción que indica que un recurso solicitado no fue encontrado.</summary>
/// <remarks>Devuelve HTTP 404 cuando es capturada por <c>ExceptionHandlingMiddleware</c>.</remarks>
public class NotFoundException : Exception
{
    public NotFoundException() : base() { }

    /// <param name="message">Descripción del error.</param>
    public NotFoundException(string message) : base(message) { }

    /// <param name="message">Descripción del error.</param>
    /// <param name="innerException">Excepción interna que originó el error.</param>
    public NotFoundException(string message, Exception innerException)
        : base(message, innerException) { }

    /// <param name="name">Nombre de la entidad no encontrada.</param>
    /// <param name="key">Clave del registro buscado.</param>
    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) was not found.") { }
}
