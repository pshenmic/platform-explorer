interface ModerationReason {
  code?: number | string | null
  text?: string | null
  documents?: Array<{ documentTypeName: string; documentId: string }> | null
  reasonDocumentId?: string | null
}

export type ModerationAction = { reason?: ModerationReason | null } & (
  | { type: 'ban' | 'unban' | 'unsuspend' | 'warn' | 'clearWarnings'; identityId?: string | null }
  | { type: 'suspend'; identityId?: string | null; until?: string | number | null }
  | {
      type: 'deleteDocument' | 'deleteSettledDocument'
      documentTypeName?: string | null
      documentId?: string | null
    }
  | {
      type: 'changeDocumentFields'
      documentTypeName?: string | null
      documentId?: string | null
      fields?: Record<string, unknown> | null
    }
  | { type: 'restoreDocument'; documentTypeName?: string | null; document?: string | null }
  | { type: 'approveTeamAction'; actionId?: string | null }
)
