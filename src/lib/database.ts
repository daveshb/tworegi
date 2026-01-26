import mongoose from "mongoose";

const dbConnection = async () => {

  try {
    // Si ya estamos conectados, no necesitamos conectar de nuevo
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to DB');
      return;
    }

    const mongodbAtlas = process.env.MONGODB_URI || ""; 
    await mongoose.connect(mongodbAtlas);

    console.log('DB Online');

  } catch (error) {
    console.log(error);
    throw new Error("Error en la base de datos - Hable con el administrador");
  }
};

export default dbConnection;