// config/db.ts
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("uatc_db", "root", "Uatc@2025!", {
  host: "localhost",
  dialect: "mysql",
});

export default sequelize;
