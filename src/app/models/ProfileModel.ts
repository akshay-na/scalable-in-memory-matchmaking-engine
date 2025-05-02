import { LooseObject } from "@akshay-na/exoframe/lib/common/LooseObject";
import mongoose, { Schema } from "mongoose";
import { BaseModel, IBaseModel } from "./BaseModel";

export interface IProfile extends IBaseModel {
  id: string;
  age: number;
  gender: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  interests: string[];
  details: LooseObject;
}

export class Profile extends BaseModel {
  static get schema() {
    const schema = super.createBaseSchema<IProfile>();

    schema.add({
      id: {
        type: String,
        required: true,
        unique: true,
      },
      age: {
        type: Number,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
      location: {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
      interests: {
        type: [String],
        required: true,
      },
      details: {
        type: Schema.Types.Mixed,
        required: false,
      },
    });

    schema.index({ location: "2dsphere" });

    return schema;
  }
}

const ProfileModel = mongoose.model<IProfile>("Profile", Profile.schema);

export default ProfileModel;
