import { UUID } from "@akshay-na/exoframe/lib/common/UUID";
import { Document, Schema } from "mongoose";

export interface IBaseModel extends Document {
  createdAt: Date;
  updatedAt: Date;
  uuid: string;
  __v: number;
}

export class BaseModel {
  public static createBaseSchema<T>() {
    const schema = new Schema<T>({
      uuid: {
        type: String,
        default: UUID.randomUUID(),
        unique: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      __v: {
        type: Number,
        default: 0,
      },
    });

    schema.pre<IBaseModel>("save", function (next) {
      this.updatedAt = new Date();
      next();
    });

    schema.post<IBaseModel>("save", function (doc) {
      if (this.isModified()) {
        doc.__v += 1;
      }
    });

    return schema;
  }
}
