using System.ComponentModel.DataAnnotations;

namespace Messages.DTOs
{
    /// <summary>Solicitud para buscar usuarios por nombre o email.</summary>
    public class SearchUsersRequest
    {
        /// <summary>Término de búsqueda (mín. 2 caracteres).</summary>
        [Required]
        [MinLength(2)]
        public required string Query { get; set; }
    }
}
