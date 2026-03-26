'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona colunas de latitude e longitude
    await queryInterface.addColumn('Users', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    // Seta coordenadas de Florianópolis para todos os usuários existentes
    await queryInterface.sequelize.query(`
      UPDATE "Users" SET latitude = -27.5954, longitude = -48.5480
    `);

    // Remove colunas antigas
    await queryInterface.removeColumn('Users', 'countryState');
    await queryInterface.removeColumn('Users', 'city');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'countryState', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('Users', 'latitude');
    await queryInterface.removeColumn('Users', 'longitude');
  }
};
