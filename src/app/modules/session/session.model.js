import { DataTypes } from 'sequelize';
import { sequelize } from '../../../db/sequelize.js';

const Session = sequelize.define('Session', {
    session_id: {
        type: DataTypes.STRING(128),
        primaryKey: true,
    },
    expires: {
        type: DataTypes.DATE,
    },
    data: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'sessions',  // Use lowercase table name
    timestamps: false,      // Don't use timestamps as express-session doesn't expect them
});

export default Session;
