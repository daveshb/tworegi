import { Schema, model, Model } from "mongoose";

const usersSchema = new Schema({
    name: {
        type: String,
        // required: [true, "The name is required"],
    },
    email: {
        type: String,
    },
    pass: {
        type: String,
        default: "",
    },
});

// Utiliza un patrón singleton para garantizar que solo se compile una instancia del modelo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let User: Model<any>;
try {
    // Intenta compilar el modelo solo una vez
    User = model("users");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
    // Si el modelo ya está compilado, úsalo
    User = model("users", usersSchema);
}

export default User;
