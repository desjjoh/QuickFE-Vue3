import * as Yup from 'yup'

export type FormValues = {
  avatar: File | null
}

export type proptype = {
  callback: () => void
  callbackSubmit: (avatar: File) => Promise<void>
}

export const initialValues: FormValues = {
  avatar: null,
}

export const validationSchema = Yup.object().shape({
  avatar: Yup.mixed<File>()
    .required('validation.required')
    .test('file-size', 'validation.fileSize', (value) => !value || value.size <= 1024 * 1024)
    .test('file-type', 'validation.image', (value) => {
      return !value || ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(value.type)
    }),
})
