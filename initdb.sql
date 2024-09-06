-- This file is creating a database inside docker container when attached with the volume in docker-compose file
-- docker-compose.yml -- ./initdb.sql:/docker-entrypoint-initdb.d/initdb.sql
-- Check if the database exists, and create it if it does not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ecomm') THEN
        EXECUTE 'CREATE DATABASE ecomm';
    END IF;
END $$;

-- Connect to the database 'ecomm'
\c ecomm

-- Check if the user exists, and create it if it does not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
        EXECUTE 'CREATE USER postgres WITH ENCRYPTED PASSWORD ''admin''';
    END IF;
END $$;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE ecomm TO postgres;

-- Create the table only if it does not exist
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL
);

-- Insert data only if it does not already exist
INSERT INTO products (name, price)
SELECT 'Product 1', 10.00
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Product 1');

INSERT INTO products (name, price)
SELECT 'Product 2', 20.00
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Product 2');

INSERT INTO products (name, price)
SELECT 'Product 3', 30.00
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Product 3');
