export type PasswordRequirement = {
  id: string;
  label: string;
  isValid: boolean;
};

export type PasswordValidationResult = {
  requirements: PasswordRequirement[];
  isValid: boolean;
};

export function getPasswordValidation(password: string): PasswordValidationResult {
  const requirements: PasswordRequirement[] = [
    {
      id: "min-length",
      label: "Minimum of 8 characters",
      isValid: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter (A-Z)",
      isValid: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter (a-z)",
      isValid: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "At least one number (0-9)",
      isValid: /\d/.test(password),
    },
    {
      id: "special-character",
      label: "At least one special character (e.g., !@#$%^&*)",
      isValid: /[^A-Za-z0-9\s]/.test(password),
    },
    {
      id: "no-spaces",
      label: "No spaces allowed",
      isValid: !/\s/.test(password),
    },
  ];

  return {
    requirements,
    isValid: requirements.every((requirement) => requirement.isValid),
  };
}

export function getPasswordValidationErrorMessage(password: string) {
  if (getPasswordValidation(password).isValid) {
    return "";
  }

  return "Password does not meet all requirements. Please review the checklist below.";
}
