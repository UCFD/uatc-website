// models/People.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const People = sequelize.define("People", {
  name: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING },
  photoUrl: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT },
  position: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  priority_order: { type: DataTypes.INTEGER, defaultValue: 0 },
});

export default People;
