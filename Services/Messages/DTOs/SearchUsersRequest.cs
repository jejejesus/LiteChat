using System.ComponentModel.DataAnnotations;

namespace Messages.DTOs
{
    public class SearchUsersRequest
    {
        [Required]
        [MinLength(2)]
        public required string Query { get; set; }
    }
}
