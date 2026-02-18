// Validate registration input
exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate login input
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate event creation
exports.validateEvent = (req, res, next) => {
  const { title, description, category, date, time, location, maxAttendees } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!category) {
    errors.push('Category is required');
  }

  if (!date) {
    errors.push('Date is required');
  }

  if (!time) {
    errors.push('Time is required');
  }

  // Better location validation
  if (!location || typeof location !== 'object') {
    errors.push('Location must be an object with venue, address, and city');
  } else if (!location.venue || !location.address || !location.city) {
    errors.push('Complete location information (venue, address, city) is required');
  }

  if (!maxAttendees || maxAttendees < 1) {
    errors.push('Valid maximum attendees is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};