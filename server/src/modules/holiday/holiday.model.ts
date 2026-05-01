import { Schema, model } from "mongoose";
import { THoliday } from "./holiday.interface";

const holidaySchema = new Schema<THoliday>(
  {
    holidayName: {
      type: String,
      required: true,
      trim: true,
    },
    holidayDate: {
      type: String,
      required: true,
      trim: true,
    },
    holidayType: {
      type: String,
      enum: ["weekly", "public", "festival", "company", "optional", "eid"],
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

holidaySchema.index({ holidayDate: 1 });
holidaySchema.index({ holidayType: 1 });

const Holiday = model<THoliday>("Holiday", holidaySchema);

export default Holiday;
