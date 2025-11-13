/**
 * Database Reset Script
 * Drops all tables and recreates them with new schema
 */

require('dotenv').config();
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...\n');
    
    // Drop all tables
    await sequelize.drop();
    console.log('✅ All tables dropped');
    
    // Recreate all tables with new schema
    await sequelize.sync({ force: true });
    console.log('✅ All tables recreated with new schema');
    
    console.log('\n✨ Database reset complete!');
    console.log('You can now restart your backend server.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();

