namespace Messages.DTOs;

/// <summary>Datos de un archivo adjunto a un mensaje.</summary>
public class MessageAttachmentDTO
{
    /// <summary>Identificador único del adjunto.</summary>
    public Guid Id { get; set; }
    /// <summary>URL de almacenamiento del archivo.</summary>
    public string StorageUrl { get; set; } = string.Empty;
    /// <summary>Nombre original del archivo.</summary>
    public string OriginalName { get; set; } = string.Empty;
    /// <summary>Tipo MIME del archivo (ej. image/png, application/pdf).</summary>
    public string MimeType { get; set; } = string.Empty;
    /// <summary>Tamaño del archivo en bytes.</summary>
    public long SizeBytes { get; set; }
    
    /// <summary>Tamaño formateado para mostrar al usuario (ej. "2.5 MB").</summary>
    public string FormattedSize => GetFormattedSize();
    
    private string GetFormattedSize()
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = SizeBytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}
