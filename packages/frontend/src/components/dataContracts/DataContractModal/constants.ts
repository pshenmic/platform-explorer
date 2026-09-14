export const FORM_MODE_ENUM = {
  INITIAL: 'INITIAL',
  NAME_EDIT: 'NAME_EDIT',
  KEYWORDS_EDIT: 'KEYWORDS_EDIT'
} as const

export type FormMode = (typeof FORM_MODE_ENUM)[keyof typeof FORM_MODE_ENUM]
