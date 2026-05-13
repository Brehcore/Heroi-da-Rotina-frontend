export enum TransactionType {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO'
}

export interface TransactionDTO {
  id?: number;
  type?: TransactionType;
  motive?: string;
  formattedValue?: string;
  date?: string;
}

export interface WalletResponseDTO {
  id: number;
  minorId: number;
  minorName: string;
  tokensBalance: number;
  moneyBalance: number;
  tokenQuotation: number;
  interestRate: number;
  interestEnabled: boolean;
}