import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI no está configurado en el archivo .env');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;
