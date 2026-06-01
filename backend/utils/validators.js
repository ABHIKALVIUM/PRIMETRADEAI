export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validateStringLength = (str, min = 1, max = 500) => {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.length >= min && trimmed.length <= max;
};

export const validateInput = ({ name, email, password, role }) => {
  const errors = {};

  if (name !== undefined && !validateStringLength(name, 2, 50)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }

  if (email !== undefined && !validateEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (password !== undefined && !validateStringLength(password, 6, 128)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (role !== undefined && !['user', 'admin'].includes(role)) {
    errors.role = 'Role must be either user or admin';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTaskInput = ({ title, status, priority }) => {
  const errors = {};

  if (title !== undefined && !validateStringLength(title, 2, 100)) {
    errors.title = 'Title must be between 2 and 100 characters';
  }

  if (status !== undefined && !['pending', 'in-progress', 'completed'].includes(status)) {
    errors.status = 'Status must be pending, in-progress, or completed';
  }

  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    errors.priority = 'Priority must be low, medium, or high';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};