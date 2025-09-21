// config/api.ts (separate file)
export const API_BASE_URL = "https://health-care-backend-tawny.vercel.app";

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/jwt/create/`,
    REGISTER: `${API_BASE_URL}/api/auth/users/`,
    USER_PROFILE: `${API_BASE_URL}/api/auth/users/me/`,
    PASSWORD_RESET: `${API_BASE_URL}/api/auth/users/reset_password/`,
    PASSWORD_RESET_CONFIRM: `${API_BASE_URL}/api/auth/users/reset_password_confirm/`,
  },
  
  // Doctors endpoints
  DOCTORS: `${API_BASE_URL}/api/doctors/`,
  DOCTOR_DETAIL: (doctorId: number) => `${API_BASE_URL}/api/doctors/${doctorId}/`,
  DOCTOR_AVAILABILITY: (doctorId: number) => `${API_BASE_URL}/api/doctors/${doctorId}/availability/`,
  DOCTOR_SLOTS: (doctorId: number) => `${API_BASE_URL}/api/doctors/${doctorId}/slots/`,
  DOCTOR_MANAGE_SLOT: (doctorId: number) => `${API_BASE_URL}/api/doctors/${doctorId}/manage-slot/`,
  
  // Appointments endpoints
  APPOINTMENTS: `${API_BASE_URL}/api/appointments/`,
  APPOINTMENT_DETAIL: (appointmentId: number) => `${API_BASE_URL}/api/appointments/${appointmentId}/`,
  APPOINTMENT_MARK_PAID: (appointmentId: number) => `${API_BASE_URL}/api/appointments/${appointmentId}/mark_paid/`,
  APPOINTMENT_CANCEL: (appointmentId: number) => `${API_BASE_URL}/api/appointments/${appointmentId}/cancel/`,
  
  // Video Call endpoints (সঠিক URL structure)
  VIDEO_CALL: {
    CREATE_ROOM: (appointmentId: number) => `${API_BASE_URL}/api/video-call/daily-room/${appointmentId}/`,
    GET_TOKEN: (appointmentId: number) => `${API_BASE_URL}/api/video-call/daily-token/${appointmentId}/`,
    START_CALL: (appointmentId: number) => `${API_BASE_URL}/api/video-call/start-call/${appointmentId}/`,
    END_CALL: (appointmentId: number) => `${API_BASE_URL}/api/video-call/end-call/${appointmentId}/`,
  },
  
  // Payment endpoints
  PAYMENT: {
    CREATE_INTENT: `${API_BASE_URL}/api/payment/create-intent/`,
    CONFIRM: `${API_BASE_URL}/api/payment/confirm/`,
  },
};