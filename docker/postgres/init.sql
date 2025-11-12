-- SmartCrop OS - PostgreSQL Initialization Script

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS smartcrop;

-- Set search path
SET search_path TO smartcrop, public;

-- Create initial database structure will be handled by Sequelize migrations
-- This file is for database-level initialization only

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA smartcrop TO smartcrop_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA smartcrop TO smartcrop_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA smartcrop TO smartcrop_user;

-- Create indexes for performance
-- (Will be created by migrations, but keeping this for reference)

COMMENT ON SCHEMA smartcrop IS 'SmartCrop OS main schema';

