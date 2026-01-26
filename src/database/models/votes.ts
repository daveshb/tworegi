import { Schema, model, Model } from "mongoose";

interface Vote {
  voterId: string;
  voterName: string;
  voterZone: "Zone 1" | "Zone 2" | "Zone 3" | "Zone 4" | "Zone 5" | "Zone 6";
  candidateId: Schema.Types.ObjectId;
  candidateName: string;
  candidateZone: "Zone 1" | "Zone 2" | "Zone 3" | "Zone 4" | "Zone 5" | "Zone 6";
  votedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const votesSchema = new Schema(
  {
    voterId: {
      type: String,
      required: [true, "Voter ID is required"],
      unique: true,
      trim: true,
    },
    voterName: {
      type: String,
      required: [true, "Voter name is required"],
    },
    voterZone: {
      type: String,
      required: [true, "Voter zone is required"],
      enum: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6"],
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      required: [true, "Candidate ID is required"],
    },
    candidateName: {
      type: String,
      required: [true, "Candidate name is required"],
    },
    candidateZone: {
      type: String,
      required: [true, "Candidate zone is required"],
      enum: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6"],
    },
    votedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Utiliza un patrón singleton para garantizar que solo se compile una instancia del modelo
let Vote: Model<Vote>;
try {
  Vote = model<Vote>("votes");
} catch (error) {
  Vote = model<Vote>("votes", votesSchema);
} 

export default Vote;
