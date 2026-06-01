export const validateUserRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Identification name attribute cannot be left blank.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(String(email).toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Please submit a standard syntax email layout address.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Security parameters require a password of at least 6 characters.' });
  }

  next();
};

export const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Input authentication criteria must include both email and password keys.' });
  }
  next();
};

export const validateTaskPayload = (req, res, next) => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Transaction routing requires a valid task title string.' });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ success: false, message: 'Transaction routing requires a valid task description string.' });
  }

  next();
};