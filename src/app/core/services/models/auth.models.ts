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

export interface ForgotPasswordDTO {
    email: string;
}

export interface ResetPasswordDTO {
    token: string;
    newPassword: string;
}

export interface UserRegisterDTO {
    name: string;
    email: string;
    password: string;
}

export interface FamilyDTO {
    id: number;
    familyName: string;
    members?: MemberDTO[];
    avatarUrl?: string;
}

export interface MemberDTO {
    id: number;
    name: string;
    email: string;
    role: string;
    familyId: number;
    familyName: string;
    avatarUrl?: string;
}