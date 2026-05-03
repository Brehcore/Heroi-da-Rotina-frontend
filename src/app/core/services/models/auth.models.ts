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

export interface FamilyDTO {
    id: string;
    name: string;
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