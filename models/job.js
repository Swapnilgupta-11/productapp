'use strict'
module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    name: DataTypes.STRING,
    userId: DataTypes.STRING,
    jobNumber: DataTypes.STRING,
    email: DataTypes.STRING,
    mobileNumber: DataTypes.STRING,
    problems: DataTypes.TEXT,
    postalCode: DataTypes.STRING,
    address: DataTypes.STRING,
    landmark: DataTypes.STRING,
    productName: DataTypes.STRING,
    invoicePath: DataTypes.STRING,
    purchaseDate: DataTypes.DATEONLY,
    comment: DataTypes.STRING
  }, {})
  Job.associate = function (models) {
    // associations can be defined here
  }
  return Job
}
