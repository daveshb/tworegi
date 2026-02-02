import { Schema, model, Model } from "mongoose";

const candidatesSchema = new Schema({
  associateId: {
    type: Schema.Types.ObjectId,
    required: [true, "Associate ID is required"],
    ref: "associates",
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  cedula: {
    type: String,
    required: [true, "Cedula is required"],
    trim: true,
  },
  electoralZone: {
    type: String,
    required: [true, "Electoral zone is required"],
    enum: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6", "FONCOR", "COLCERAMICA", "OTROS", "EXCORONA"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
  },
  cellPhone: {
    type: String,
    required: [true, "Cell phone is required"],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, "Candidate image is required"],
  },
  proposalDescription: {
    type: String,
    trim: true,
    maxlength: [300, "Proposal description cannot exceed 300 characters"],
  },
  position: {
    type: String,
    trim: true,
  },
  locality: {
    type: String,
    trim: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    required: [true, "Status is required"],
    default: true,
  },
});

// Utiliza un patrón singleton para garantizar que solo se compile una instancia del modelo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Candidate: Model<any>;
try {
    // Intenta compilar el modelo solo una vez
    Candidate = model("candidates");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
    // Si el modelo ya está compilado, úsalo
    Candidate = model("candidates", candidatesSchema);
}

export default Candidate;
