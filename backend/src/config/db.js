const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Se não há MONGODB_URI, rodar em modo demo sem banco
    if (!process.env.MONGODB_URI) {
      console.log('📝 Rodando em MODO DEMO - sem conexão com banco de dados');
      console.log('💡 Para usar com banco real, configure MONGODB_URI no arquivo .env');
      return;
    }

    // Para produção, usar MongoDB Atlas
    const mongoURI = process.env.MONGODB_URI;
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🍃 MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    
    // Em desenvolvimento, continuar sem MongoDB para não bloquear o desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Continuando em modo desenvolvimento sem MongoDB...');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
