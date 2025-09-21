export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'patient' | 'doctor' | 'admin';
  phone?: string;
}

export interface Doctor {
  id: number;
  user_details: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  specialization: string;
  experience: number;
  consultation_fee: string; // string হিসেবে update করুন
  bio: string;
  available_days: string;
  available_time_start: string;
  available_time_end: string;
  address?: string;
  phone?: string;
  email?: string;
  available_hours?: string;
}

export interface Appointment {
  id: number;
  created_at: string;
  date: string;
  doctor: number; // doctor ID
  doctor_details: {
    id: number;
    user_details: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
    specialization: string;
    experience: number;
    consultation_fee: string;
    bio: string;
    available_days: string;
    available_time_start: string;
    available_time_end: string;
    address?: string;
    phone?: string;
    email?: string;
    available_hours?: string;
  };
  patient: number; // patient ID
  reason: string;
  status: string;
  time: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface AvailabilityResponse {
  available: boolean;
  slots?: string[];
  message?: string;
}
