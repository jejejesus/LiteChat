namespace Messages.DTOs;

public class MessageAttachmentDTO
{
    public Guid Id { get; set; }
    public string StorageUrl { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    
    // Propiedad útil para mostrar tamaño formateado
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