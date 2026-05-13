export interface TaskCreateDTO {
  title: string;
  description: string;
  tokenReward: number;
  minorId: number;
  monitorCreatorId: number;
}

export interface TaskResponseDTO {
  id: number;
  title: string;
  description: string;
  rewardTask: number;
  status: 'PENDENTE' | 'CONCLUIDA' | 'APROVADA' | 'REJEITADA' | string;
  minorId: number;
  minorName: string;
  creationDate: string;
  completedDate: string | null;
}