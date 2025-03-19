import { useState, useCallback } from 'react';

export function useForm(initialValues = {}, validationSchema = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Handle field change
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur if schema exists
    if (validationSchema) {
      try {
        validationSchema.validateSyncAt(name, values);
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      } catch (err) {
        setErrors(prev => ({
          ...prev,
          [name]: err.message
        }));
      }
    }
  }, [values, validationSchema]);

  // Set field value programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);

  // Validate all fields
  const validateForm = useCallback(async () => {
    if (!validationSchema) return {};

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return {};
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach(error => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      return validationErrors;
    }
  }, [values, validationSchema]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    return async (event) => {
      if (event) {
        event.preventDefault();
      }

      setIsSubmitting(true);
      const validationErrors = await validateForm();

      if (Object.keys(validationErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          // Handle submission error
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    };
  }, [values, validateForm]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Check if form is dirty (has been modified)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateForm
  };
}

// Example usage:
// const {
//   values,
//   errors,
//   touched,
//   isSubmitting,
//   handleChange,
//   handleBlur,
//   handleSubmit
// } = useForm(
//   {
//     email: '',
//     password: ''
//   },
//   Yup.object().shape({
//     email: Yup.string()
//       .email('Invalid email')
//       .required('Required'),
//     password: Yup.string()
//       .min(8, 'Too short')
//       .required('Required')
//   })
// );

export default useForm;