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

export interface ScreenTimeResponseDTO {
  requestId: number;
  minorId: number;
  minorName: string;
  status: ScreenStatus;
  requestedMinutes: number;
  remainingBalance: number;
  requestTime?: Date; // Propriedade local do frontend para controle de tempo
}

export interface ScreenTimeRequestDTO {
  minorId: number;
  minutes: number;
}