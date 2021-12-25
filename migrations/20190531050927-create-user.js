'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.createTable('Users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        mobile_number: {
          type: Sequelize.STRING
        },
        roleid: {
          type: Sequelize.STRING
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }),

      queryInterface.bulkInsert('Users', [
        { name: 'Pravin', email: 'pravindot17@gmail.com', password: '$2b$10$E1oHTBJIZs0CtP7m2/ZKjOmO/sCi6BnENQ3uk6pnK4OTmWHnR15xu', mobile_number: '1231231231', roleid: 'admin', createdAt: Date.now(), updatedAt: Date.now() },
        { name: 'Rahul', email: 'jatinvsharma@gmail.com', password: '$2b$10$E1oHTBJIZs0CtP7m2/ZKjOmO/sCi6BnENQ3uk6pnK4OTmWHnR15xu', mobile_number: '1231231231', roleid: 'user', createdAt: Date.now(), updatedAt: Date.now() }
      ])
    ]
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
