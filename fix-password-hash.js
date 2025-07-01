const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  try {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('Senha:', password);
    console.log('Hash gerado:', hash);
    
    // Testar se o hash funciona
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash válido:', isValid);
    
    // SQL para atualizar o usuário
    console.log('\nSQL para atualizar:');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@clinicademo.com';`);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

generatePasswordHash();
