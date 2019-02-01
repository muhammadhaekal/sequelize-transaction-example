/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('accounts', {
    emp_no: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'employees',
        key: 'emp_no'
      }
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    password_salt: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
      tableName: 'accounts',
      timestamps: false
    });
};
