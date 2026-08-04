export interface UserLoginDTO {
    email: string;
    password: string;
}

export interface LoginResponseDTO {
    token: string;
    id: number;
    name: string;
    role: string;
}

export interface FamilyResponseDTO {
    id: number;
    familyName: string;
    members?: UserResponseDTO[];
    profilePictureUrl?: string;
}

export interface UserResponseDTO {
    id: number;
    name: string;
    email: string;
    role: 'MONITOR' | 'MINOR' | string;
    familyId?: number;
    familyName?: string;
    profilePictureUrl?: string;
}

export interface UserRegisterDTO {
    name: string;
    email: string;
    password: string;
    profilePictureUrl?: string;
}

export interface ForgotPasswordDTO {
    email: string;
}

export interface ResetPasswordDTO {
    token: string;
    newPassword: string;
}