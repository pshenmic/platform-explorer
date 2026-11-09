// Mirrors packages/api/src/models/Withdrawal.js
// `status` is a string label from packages/api/src/enums/WithdrawalStatusEnum.

export interface Withdrawal {
  timestamp: string | null
  hash: string | null
  sender: string | null
  id: string | null
  amount: string | null
  status: string | null
}
