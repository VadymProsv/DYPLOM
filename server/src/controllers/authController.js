const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config/config');
const bcrypt = require('bcryptjs');

// Генерація JWT токена
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiration
  });
};

// Реєстрація користувача
exports.register = async (req, res) => {
  try {
    console.log('Registration attempt received:', {
      name: req.body.name,
      email: req.body.email,
      hasPassword: !!req.body.password,
      passwordLength: req.body.password?.length
    });

    const { name, email, password } = req.body;

    // Перевірка наявності всіх полів
    if (!name || !email || !password) {
      console.log('Missing required fields:', {
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Перевірка чи користувач вже існує
    const existingUser = await User.findOne({ email });
    console.log('Existing user check:', {
      exists: !!existingUser,
      email: existingUser?.email
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    // Створення нового користувача
    const user = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save hook
      role: 'user'
    });

    await user.save();
    console.log('User created:', {
      userId: user._id,
      email: user.email
    });

    // Створення токена
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // Відправка відповіді
    const response = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };

    console.log('Registration successful:', {
      userId: user._id,
      email: user.email,
      hasToken: !!token
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};

// Вхід користувача
exports.login = async (req, res) => {
  try {
    console.log('Login attempt received:', {
      email: req.body.email,
      hasPassword: !!req.body.password,
      passwordLength: req.body.password?.length
    });

    const { email, password } = req.body;

    // Перевірка наявності всіх полів
    if (!email || !password) {
      console.log('Missing required fields:', {
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Пошук користувача
    const user = await User.findOne({ email });
    console.log('User found:', {
      exists: !!user,
      email: user?.email
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Перевірка пароля
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', { isMatch });

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Перевірка блокування
    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked. Please contact support.' });
    }

    // Створення токена
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // Відправка відповіді
    const response = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };

    console.log('Login successful:', {
      userId: user._id,
      email: user.email,
      hasToken: !!token
    });

    res.json(response);
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'An error occurred during login' });
  }
};

// Тестовий маршрут для перевірки паролів
exports.testPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Знаходимо користувача
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        email 
      });
    }

    // Хешуємо тестовий пароль для порівняння
    const salt = await bcrypt.genSalt(10);
    const testHash = await bcrypt.hash(password, salt);
    
    // Перевіряємо пароль
    const isMatch = await bcrypt.compare(password, user.password);

    res.json({
      email: user.email,
      storedHash: user.password,
      testHash,
      isMatch,
      passwordLength: password.length,
      hashLength: user.password.length
    });
  } catch (error) {
    console.error('Test password error:', error);
    res.status(500).json({ message: 'Error testing password', error: error.message });
  }
};

// Отримання даних поточного користувача
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// Вихід користувача
exports.logout = async (req, res) => {
  try {
    // В реальній реалізації, вам може знадобитися недійснювати токен
    // Наразі ми просто відправляємо відповідь про успішний вихід
    res.json({ message: 'Вихід здійснено успішно' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// Оновлення токену
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Необхідний оновлений токен' });
    }

    // Перевірка оновленого токену
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);

    // Генерація нового доступного токену
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Недійсний оновлений токен' });
  }
}; 