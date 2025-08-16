const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');

console.log('Imported sequelize:', sequelize);
console.log('typeof define:', typeof sequelize.define);

if (typeof sequelize.define !== 'function') {
    console.error('❌ ERROR: sequelize is not an instance!');
    process.exit(1);
}

const Profile = sequelize.define('Profile', {
    name: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false, unique: true },
    about: { type: DataTypes.TEXT },
    bio: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING },
    followerCount: { type: DataTypes.INTEGER },
    connectionCount: { type: DataTypes.INTEGER }
}, { timestamps: true });

module.exports = Profile;
