export interface ScreenTimeConfigDTO {
  minutesPerToken: number;
  mondayLimit: number;
  tuesdayLimit: number;
  wednesdayLimit: number;
  thursdayLimit: number;
  fridayLimit: number;
  saturdayLimit: number;
  sundayLimit: number;
}

export enum ScreenStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ScreenTimeRequest {
  id?: number;
  minorId?: number;
  minutes?: number;
  status?: ScreenStatus;
}