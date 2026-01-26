import { Schema, model, Model } from "mongoose";

const associatesSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  cedula: {
    type: String,
    required: [true, "Cedula is required"],
    unique: true,
    trim: true,
  },
  joinDate: {
    type: Date,
    required: [true, "Join date is required"],
    default: Date.now,
  },
  electoralZone: {
    type: String,
    required: [true, "Electoral zone is required"],
    enum: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
  },
  cellPhone: {
    type: String,
    required: [true, "Cell phone is required"],
    trim: true,
  },
  isActive: {
    type: Boolean,
    required: [true, "Status is required"],
    default: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
    minlength: [4, "Password must be at least 4 digits"],
    maxlength: [4, "Password must be exactly 4 digits"],
  },
  verificationCode: {
    type: String,
    trim: true,
    minlength: [4, "Verification code must be at least 4 digits"],
    maxlength: [4, "Verification code must be exactly 4 digits"],
  },
  verificationCodeExpiry: {
    type: Date,
  },
  emailsUsedForCode: {
    type: [String],
    default: [],
  },
});

// Utiliza un patrón singleton para garantizar que solo se compile una instancia del modelo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Associate: Model<any>;
try {
    // Intenta compilar el modelo solo una vez
    Associate = model("associates");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
    // Si el modelo ya está compilado, úsalo
    Associate = model("associates", associatesSchema);
}

export default Associate;
