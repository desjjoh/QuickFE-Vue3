import * as Yup from 'yup'

export type proptype = { callback: () => Promise<void> }
export const validationSchema = Yup.object()
