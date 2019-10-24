import { Model } from "sequelize";

export class User extends Model {
  public id!: number;
  public name!: string;
}
