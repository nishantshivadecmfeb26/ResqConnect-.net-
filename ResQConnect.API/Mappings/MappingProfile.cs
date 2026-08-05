using AutoMapper;
using ResQConnect.API.Models;
using ResQConnect.API.DTOs;

namespace ResQConnect.API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : string.Empty))
                .ForMember(dest => dest.Volunteer, opt => opt.MapFrom(src => src.Volunteer));
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

            // Disaster mappings
            CreateMap<Disaster, DisasterDto>()
                .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => src.Creator != null ? src.Creator.Name : string.Empty));
            CreateMap<CreateDisasterDto, Disaster>();

            // SOS mappings
            CreateMap<SOSRequest, SOSRequestDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.Name : string.Empty))
                .ForMember(dest => dest.UserPhone, opt => opt.MapFrom(src => src.User != null ? src.User.Phone : string.Empty))
                .ForMember(dest => dest.DisasterTitle, opt => opt.MapFrom(src => src.Disaster != null ? src.Disaster.Title : string.Empty))
                .ForMember(dest => dest.AssignedNGOName, opt => opt.MapFrom(src => src.AssignedNGO != null ? src.AssignedNGO.Name : string.Empty))
                .ForMember(dest => dest.AssignedVolunteerName, opt => opt.MapFrom(src => src.AssignedVolunteer != null ? src.AssignedVolunteer.Name : string.Empty))
                .ForMember(dest => dest.GovernmentOfficerName, opt => opt.MapFrom(src => src.GovernmentOfficer != null ? src.GovernmentOfficer.Name : string.Empty));
            CreateMap<CreateSOSRequestDto, SOSRequest>();

            // Relief Camp mappings
            CreateMap<ReliefCamp, ReliefCampDto>()
                .ForMember(dest => dest.DisasterTitle, opt => opt.MapFrom(src => src.Disaster != null ? src.Disaster.Title : string.Empty));
            CreateMap<CreateCampDto, ReliefCamp>();

            // Resource mappings
            CreateMap<Resource, ResourceDto>()
                .ForMember(dest => dest.CampName, opt => opt.MapFrom(src => src.ReliefCamp != null ? src.ReliefCamp.Name : string.Empty));
            CreateMap<CreateResourceDto, Resource>();

            // Volunteer mappings
            CreateMap<Volunteer, VolunteerDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.Name : string.Empty))
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User != null ? src.User.Email : string.Empty))
                .ForMember(dest => dest.UserPhone, opt => opt.MapFrom(src => src.User != null ? src.User.Phone : string.Empty))
                .ForMember(dest => dest.AssignedNGOName, opt => opt.MapFrom(src => src.AssignedNGO != null ? src.AssignedNGO.Name : string.Empty));

            // Task mappings
            CreateMap<TaskEntity, TaskDto>()
                .ForMember(dest => dest.VolunteerName, opt => opt.MapFrom(src => src.Volunteer != null && src.Volunteer.User != null ? src.Volunteer.User.Name : "Unassigned"))
                .ForMember(dest => dest.CampName, opt => opt.MapFrom(src => src.ReliefCamp != null ? src.ReliefCamp.Name : string.Empty));
            CreateMap<CreateTaskDto, TaskEntity>();

            // Missing Person mappings
            CreateMap<MissingPerson, MissingPersonDto>()
                .ForMember(dest => dest.ReporterName, opt => opt.MapFrom(src => src.Reporter != null ? src.Reporter.Name : string.Empty))
                .ForMember(dest => dest.ReporterPhone, opt => opt.MapFrom(src => src.Reporter != null ? src.Reporter.Phone : string.Empty));
            CreateMap<CreateMissingPersonDto, MissingPerson>()
                .ForMember(dest => dest.Photo, opt => opt.Ignore());

            // Hazard Report mappings
            CreateMap<HazardReport, HazardReportDto>()
                .ForMember(dest => dest.ReporterName, opt => opt.MapFrom(src => src.Reporter != null ? src.Reporter.Name : string.Empty));
            CreateMap<CreateHazardReportDto, HazardReport>();

            // Notification mappings
            CreateMap<Notification, NotificationDto>();
            CreateMap<CreateNotificationDto, Notification>();
        }
    }
}

