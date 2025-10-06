import siteConfig from ".";

/**
 * API Route Constants
 * Centralized configuration for all API endpoints used in the application
 */
const ROUTE_CONSTANTS = {
  // Authentication & Authorization
  ACCESS_TOKEN: "access-token",
  SIGNIN: "signin",
  SIGNUP: "signup",
  VERIFY_OTP: "verify-otp",
  RESEND_OTP: "resend-otp",
  SENT_OTP: "send-otp",
  RESET_PASSWORD: "reset-password",

  // Organization Management
  CREATE_ORGANIZATION: "organizations",
  ORGANIZATION_PROFILE: "organizations",
  ORGANIZATION_PROFILE_COMPLETION: "organizations/org-profile-completion",
  ORG_TYPES: "org-types",
  ORGANIZATION_LIST: "organizations?limit=100",

  // Profile Management
  SWITCH_PROFILE: "org-switch",
  PROFILE: "profile",

  // Contact & Communication
  CONTACT_TYPES: "contact-types",
  EMAIL_AVAILABLE: "emails/is-used",
  MOBILE_AVAILABLE: "mobiles/is-used",

  // People & Roles
  PEOPLE_ROLES: "roles",
  ROLES: "roles",
  ALL_USER_ROLES: "user-roles/all",
  ASSIGN_ROLES: "user-roles",
  IDENTIFICATION_TYPES: "identification-types",
  EMPLOYEE_DEGREES: "degrees?limit=100",
  DESIGNATION_LIST: "designations?limit=100",
  ORG_DESIGNATION_LIST: "designation-org?limit=100",

  // Teacher Management
  TEACHERS: "teachers",
  TEACHER_DEFAULT_DETAILS: "invite-users",
  STUDENT_DEFAULT_DETAILS: "invite-users",
  INVITE_TEACHER: "invite-users/add-employee",
  DELETE_BULK_TEACHERS: "teachers/bulk/delete",
  EMPLOYEE_PROFILE_COMPLETION: "profile/employee-profile-completion",
  EMPLOYEE_PROFILE_UPDATE: "profile/employee-profile-update",
  TEACHER_EXISTS_IN_SYSTEM: "emails/resolve-email",

  // Attendance Management
  ATTENDANCE_SUMMARY_DETAILS: "attendances/attendance-summary-details-by-admin",
  ATTENDANCE_SUMMARY: "attendances/attendance-summary",
  ATTENDANCE_SUMMARY_ALL: "attendances/attendance-summary-by-admin",
  ATTENDANCE_SHEET: "attendances/attendance-sheet",
  ABSENT_STUDENT: "attendances/absent-students",

  // Class Management
  CLASSES: "classes",
  CLASS_GROUPS: "groups",
  ASSOCIATE_CLASS_IN_GROUP: "groups/associate-with-group",
  CLASS_TYPES_ORG: "class-types-org",
  CLASS_COUNT_MATRIX: "dashboard/count-metrics",

  // Student Management
  STUDENTS: "students",
  STUDENT: "students/student-details",
  STUDENT_INVITE: "invite-users/invite-student",
  STUDENT_COMPLETION: "profile/student-profile-completion",
  STUDENT_PROFILE_UPDATE: "students/student-profile",
  DELETE_BULK_STUDENTS: "students/bulk/delete",
  STUDENT_GUARDIAN: "students/guardian-details",
  STUDENT_MEDICAL_INFO: "students/student-medical-information",
  STUDENT_GUARDIAN_UPDATE: "students/student-guardian-info",
  STUDENT_ASSOCIATE_IN_CLASS: "students/associate-with-class",
  STUDENT_DISSOCIATE_IN_CLASS: "students/dissociate-with-class",
  STUDENT_GUARDIAN_LIST: "parent-children/parent-list",

  // Location Management
  DEFAULT_PARENT_LOCATION: "default-parent-location",
  LOCATIONS: "locations",

  // Activity & Permissions
  ACTIVITIES: "activities",
  ACTIVITY_PERMISSIONS: "activity-permissions",

  // User Management
  USERS: "users",

  // Employee Management
  EMPLOYEE_SCHEDULE_DELETE: "employees/employee-schedules",
  EMPLOYEE_RESPONSIBILITIES_DELETE: "employees/employee-responsibility",

  // Contact & People Management
  CONTACTS: "contacts",
  PEOPLE_IDENTIFICATION: "people/people-identification",
  PEOPLE_EDUCATION: "people/people-education",
  PEOPLE_EXPERIENCE: "people/people-experience",

  // Dashboard Counts
  STUDENT_DASHBOARD_COUNT: "dashboard/student",
  TEACHER_DASHBOARD_COUNT: "dashboard/teacher",
  CLASS_DASHBOARD_COUNT: "dashboard/class",
  PARENT_DASHBOARD_COUNT: "dashboard/parent-hub",

  // Grades
  GRADES: "grades",

  // Departments
  DEPARTMENTS: "departments",
};

/**
 * Route modifier function to construct API URLs with proper versioning
 * @param {string} url - The endpoint URL
 * @param {string} service - The service name
 * @returns {string} - Complete API URL with version
 */
const routeModifier = (url, service) => {
  const version = siteConfig.API_VERSION;

  if (siteConfig.API_VERSION_APPEND_AFTER_SERVICE) {
    return `${service}/${version}/${url}`;
  } else {
    return `${version}/${service}/${url}`;
  }
};

/**
 * API Routes configuration object
 * Contains all route functions that generate proper API endpoints
 */
const routes = {
  // Authentication Routes
  getToken: (service) => routeModifier(ROUTE_CONSTANTS.ACCESS_TOKEN, service),
  signin: (service) => routeModifier(ROUTE_CONSTANTS.SIGNIN, service),
  signup: (service) => routeModifier(ROUTE_CONSTANTS.SIGNUP, service),
  verifyOtp: (service) => routeModifier(ROUTE_CONSTANTS.VERIFY_OTP, service),
  resendOtp: (service) => routeModifier(ROUTE_CONSTANTS.RESEND_OTP, service),
  sentOtp: (service) => routeModifier(ROUTE_CONSTANTS.SENT_OTP, service),
  resetPassword: (service) =>
    routeModifier(ROUTE_CONSTANTS.RESET_PASSWORD, service),

  // Organization Routes
  creatOrganization: (service) =>
    routeModifier(ROUTE_CONSTANTS.CREATE_ORGANIZATION, service),
  organizationProfile: (service) =>
    routeModifier(ROUTE_CONSTANTS.ORGANIZATION_PROFILE, service),
  orgTypes: (service) => routeModifier(ROUTE_CONSTANTS.ORG_TYPES, service),
  organizationList: (service) =>
    routeModifier(ROUTE_CONSTANTS.ORGANIZATION_LIST, service),

  // Profile Routes
  switchProfile: (service) =>
    routeModifier(ROUTE_CONSTANTS.SWITCH_PROFILE, service),
  profile: (service) => routeModifier(ROUTE_CONSTANTS.PROFILE, service),
  onBoardingProfileSetup: (service) =>
    routeModifier(ROUTE_CONSTANTS.ORGANIZATION_PROFILE_COMPLETION, service),

  // Contact & Validation Routes
  contactTypes: (service) =>
    routeModifier(ROUTE_CONSTANTS.CONTACT_TYPES, service),
  emailAvailable: (service) =>
    routeModifier(ROUTE_CONSTANTS.EMAIL_AVAILABLE, service),
  mobileAvailable: (service) =>
    routeModifier(ROUTE_CONSTANTS.MOBILE_AVAILABLE, service),

  // People & Roles Routes
  peopleRoles: (service) =>
    routeModifier(ROUTE_CONSTANTS.PEOPLE_ROLES, service),
  identificationTypes: (service) =>
    routeModifier(ROUTE_CONSTANTS.IDENTIFICATION_TYPES, service),
  employeeDegrees: (service) =>
    routeModifier(ROUTE_CONSTANTS.EMPLOYEE_DEGREES, service),
  designationList: (service) =>
    routeModifier(ROUTE_CONSTANTS.DESIGNATION_LIST, service),
  orgDesignationList: (service) =>
    routeModifier(ROUTE_CONSTANTS.ORG_DESIGNATION_LIST, service),
  allUserRoles: (service) =>
    routeModifier(ROUTE_CONSTANTS.ALL_USER_ROLES, service),
  assignRoles: (service) =>
    routeModifier(ROUTE_CONSTANTS.ASSIGN_ROLES, service),

  // Teacher Management Routes
  teachers: (service) => routeModifier(ROUTE_CONSTANTS.TEACHERS, service),
  teacherDefaultDetails: (service) =>
    routeModifier(ROUTE_CONSTANTS.TEACHER_DEFAULT_DETAILS, service),
  studentDefaultDetails: (service) =>
    routeModifier(ROUTE_CONSTANTS.STUDENT_DEFAULT_DETAILS, service),
  inviteTeacher: (service) =>
    routeModifier(ROUTE_CONSTANTS.INVITE_TEACHER, service),
  deleteBulkTeachers: (service) =>
    routeModifier(ROUTE_CONSTANTS.DELETE_BULK_TEACHERS, service),
  deleteBulkStudents: (service) =>
    routeModifier(ROUTE_CONSTANTS.DELETE_BULK_STUDENTS, service),
  employeeProfileCompletion: (service) =>
    routeModifier(ROUTE_CONSTANTS.EMPLOYEE_PROFILE_COMPLETION, service),
  employeeProfileUpdate: (service) =>
    routeModifier(ROUTE_CONSTANTS.EMPLOYEE_PROFILE_UPDATE, service),
  teacherExistsInTheSystem: (service) =>
    routeModifier(ROUTE_CONSTANTS.TEACHER_EXISTS_IN_SYSTEM, service),

  // Attendance Routes
  attendanceSummaryDetails: (service) =>
    routeModifier(ROUTE_CONSTANTS.ATTENDANCE_SUMMARY_DETAILS, service),
  attendanceSummary: (service) =>
    routeModifier(ROUTE_CONSTANTS.ATTENDANCE_SUMMARY, service),
  attendanceSummaryAll: (service) =>
    routeModifier(ROUTE_CONSTANTS.ATTENDANCE_SUMMARY_ALL, service),
  attendanceSheet: (service) =>
    routeModifier(ROUTE_CONSTANTS.ATTENDANCE_SHEET, service),
  absentStudent: (service) =>
    routeModifier(ROUTE_CONSTANTS.ABSENT_STUDENT, service),

  // Class Management Routes
  classes: (service) => routeModifier(ROUTE_CONSTANTS.CLASSES, service),
  classGroups: (service) =>
    routeModifier(ROUTE_CONSTANTS.CLASS_GROUPS, service),
  associateClassInGroup: (service, classId) =>
    routeModifier(ROUTE_CONSTANTS.ASSOCIATE_CLASS_IN_GROUP, service),
  disassociateClassInGroup: (service, groupId) =>
    routeModifier(
      `${ROUTE_CONSTANTS.CLASS_GROUPS}/${groupId}/dissociate-with-group`,
      service
    ),
  classSubjects: (service, classId) =>
    routeModifier(
      `${ROUTE_CONSTANTS.CLASSES}/${classId}/class-subjects`,
      service
    ),
  classTypesOrg: (service) =>
    routeModifier(ROUTE_CONSTANTS.CLASS_TYPES_ORG, service),
  deleteClassPeople: (service, classId, classPeopleId) =>
    routeModifier(`${classId}/class-people/${classPeopleId}`, service),
  classCountMartix: (service) =>
    routeModifier(ROUTE_CONSTANTS.CLASS_COUNT_MATRIX, service),

  // Student Management Routes
  students: (service) => routeModifier(ROUTE_CONSTANTS.STUDENTS, service),
  student: (service) => routeModifier(ROUTE_CONSTANTS.STUDENT, service),
  studentMedicalInfo: (service, id) =>
    routeModifier(`${ROUTE_CONSTANTS.STUDENT_MEDICAL_INFO}/${id}`, service),
  studentProfileUpdate: (service, id) =>
    routeModifier(`${ROUTE_CONSTANTS.STUDENT_PROFILE_UPDATE}/${id}`, service),
  deleteBulkStudents: (service) =>
    routeModifier(ROUTE_CONSTANTS.DELETE_BULK_STUDENTS, service),
  studentInvite: (service) =>
    routeModifier(ROUTE_CONSTANTS.STUDENT_INVITE, service),
  studentCompletion: (
    service,
    uuidSyntexToken,
    oneTimeStudentCompletionToken
  ) =>
    routeModifier(
      `${ROUTE_CONSTANTS.STUDENT_COMPLETION}/${uuidSyntexToken}/${oneTimeStudentCompletionToken}`,
      service
    ),
  studentGuardian: (service) =>
    routeModifier(ROUTE_CONSTANTS.STUDENT_GUARDIAN, service),
  studentAssociateInClass: (service) =>
    routeModifier(ROUTE_CONSTANTS.STUDENT_ASSOCIATE_IN_CLASS, service),
  studentDissociateInClass: (service) =>
    routeModifier(ROUTE_CONSTANTS.STUDENT_DISSOCIATE_IN_CLASS, service),
  addNewStudent: (service) =>
    routeModifier(ROUTE_CONSTANTS.STUDENT_INVITE, service),
  studentPersonalInfoUpdate: (service, id) =>
    routeModifier(`${ROUTE_CONSTANTS.STUDENTS}/${id}`, service),
  studentGuardianUpdate: (service, id) =>
    routeModifier(`${ROUTE_CONSTANTS.STUDENT_GUARDIAN_UPDATE}/${id}`, service),
  studentGuardianList: (service) =>
    routeModifier(ROUTE_CONSTANTS.STUDENT_GUARDIAN_LIST, service),

  // Location Routes
  parentLocations: (service) =>
    routeModifier(ROUTE_CONSTANTS.DEFAULT_PARENT_LOCATION, service),
  locations: (service) => routeModifier(ROUTE_CONSTANTS.LOCATIONS, service),

  // Role & Permission Routes
  roles: (service) => routeModifier(ROUTE_CONSTANTS.ROLES, service),
  activities: (service) => routeModifier(ROUTE_CONSTANTS.ACTIVITIES, service),
  activityPermissions: (service) =>
    routeModifier(ROUTE_CONSTANTS.ACTIVITY_PERMISSIONS, service),

  // User Management Routes
  users: (service) => routeModifier(ROUTE_CONSTANTS.USERS, service),

  // Employee Management Routes
  employeeScheduleDelete: (service) =>
    routeModifier(ROUTE_CONSTANTS.EMPLOYEE_SCHEDULE_DELETE, service),
  employeeResponsibilitiesDelete: (service) =>
    routeModifier(ROUTE_CONSTANTS.EMPLOYEE_RESPONSIBILITIES_DELETE, service),

  // Contact & People Management Routes
  deleteContact: (service) => routeModifier(ROUTE_CONSTANTS.CONTACTS, service),
  deletePeopleIdentification: (service) =>
    routeModifier(ROUTE_CONSTANTS.PEOPLE_IDENTIFICATION, service),
  deletePeopleEducation: (service) =>
    routeModifier(ROUTE_CONSTANTS.PEOPLE_EDUCATION, service),
  deletePeopleExperience: (service) =>
    routeModifier(ROUTE_CONSTANTS.PEOPLE_EXPERIENCE, service),

  // Event Management Routes
  adminNote: (service, id) =>
    routeModifier(`event-participants/${id}`, service),

  // Dashboard Count Routes
  studentDashboardCount: (service) =>
    routeModifier(ROUTE_CONSTANTS.STUDENT_DASHBOARD_COUNT, service),
  teacherDashboardCount: (service) =>
    routeModifier(ROUTE_CONSTANTS.TEACHER_DASHBOARD_COUNT, service),

  classDashboardCount: (service) =>
    routeModifier(ROUTE_CONSTANTS.CLASS_DASHBOARD_COUNT, service),

  parentDashboardCount: (service) =>
    routeModifier(ROUTE_CONSTANTS.PARENT_DASHBOARD_COUNT, service),

  // Grades Routes
  grades: (service) => routeModifier(ROUTE_CONSTANTS.GRADES, service),

  // Departments Routes
  departments: (service) => routeModifier(ROUTE_CONSTANTS.DEPARTMENTS, service),
};

export default routes;
