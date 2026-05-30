// api.js – временная реализация через localStorage
// Позже можно заменить на fetch-запросы к серверу

const API = (function() {
  // Ключи для localStorage
  const USERS_KEY = 'app_users';
  const ORDERS_KEY = 'app_orders';
  const CURRENT_USER_KEY = 'app_current_user';

  // Получить всех пользователей
  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  }

  // Сохранить пользователей
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Получить все заказы
  function getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  }

  // Сохранить заказы
  function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  // Регистрация
  async function register(userData) {
    const { name, email, phone, password } = userData;
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      password, // в реальном приложении пароль нужно хэшировать!
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    // Автоматически входим после регистрации
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name }));
    return { success: true, user: newUser };
  }

  // Вход
  async function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, error: 'Неверный email или пароль' };
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, email: user.email, name: user.name }));
    return { success: true, user };
  }

  // Выход
  async function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  }

  // Получить текущего пользователя
  function getCurrentUser() {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Создать заказ
  async function createOrder(orderData) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Пользователь не авторизован' };
    }
    const orders = getOrders();
    const newOrder = {
      id: Date.now(),
      userId: currentUser.id,
      userName: orderData.name || currentUser.name,
      userEmail: orderData.email || currentUser.email,
      userPhone: orderData.phone,
      userAddress: orderData.address,
      items: orderData.items, // массив товаров из корзины
      total: orderData.total,
      status: 'new', // new, paid, shipped, delivered
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    saveOrders(orders);
    return { success: true, order: newOrder };
  }

  // Получить заказы текущего пользователя
  async function getMyOrders() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    const orders = getOrders();
    return orders.filter(o => o.userId === currentUser.id);
  }

  // Обновить профиль (простейшая версия)
  async function updateProfile(data) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, error: 'Не авторизован' };
    let users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, error: 'Пользователь не найден' };
    users[userIndex] = { ...users[userIndex], ...data };
    saveUsers(users);
    // обновляем текущую сессию
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: users[userIndex].id, email: users[userIndex].email, name: users[userIndex].name }));
    return { success: true, user: users[userIndex] };
  }

  // Публичное API
  return {
    register,
    login,
    logout,
    getCurrentUser,
    createOrder,
    getMyOrders,
    updateProfile
  };
})();