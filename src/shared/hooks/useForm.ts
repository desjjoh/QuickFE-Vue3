import * as Yup from 'yup'

type FormUtil = {
  getSubmitFn: <Schema extends Yup.ObjectSchema<Record<string, unknown>>>(
    _: Schema,
    callback: (values: Yup.InferType<Schema>) => void,
  ) => (values: Record<string, unknown>) => void
}

export function useFormUtil(): FormUtil {
  function getSubmitFn<Schema extends Yup.ObjectSchema<Record<string, unknown>>>(
    _: Schema,
    callback: (values: Yup.InferType<Schema>) => void,
  ) {
    return (values: Record<string, unknown>) => {
      return callback(values)
    }
  }

  return {
    getSubmitFn,
  }
}
