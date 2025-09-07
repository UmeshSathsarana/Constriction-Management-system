// Test what functions are actually exported
try {
  const userController = require('./controllers/userController');
  console.log('✅ Controller imported successfully');
  console.log('Available functions:', Object.keys(userController));
  
  // Test each function
  const functions = [
    'createUser',
    'getAllUsers', 
    'getUserById',
    'updateUser',
    'deleteUser',
    'updateUserPassword',
    'getUsersByRole'
  ];
  
  functions.forEach(func => {
    if (typeof userController[func] === 'function') {
      console.log(`✅ ${func}: OK`);
    } else {
      console.log(`❌ ${func}: ${typeof userController[func]} (NOT A FUNCTION)`);
    }
  });

} catch (error) {
  console.log('❌ Import error:', error.message);
}
