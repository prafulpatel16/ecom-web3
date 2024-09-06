#!/bin/bash
set -e

# Create additional roles or databases here if needed
psql -U postgres <<EOF
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;

\c ecommerce_db

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL
);

INSERT INTO products (name, price) VALUES
('Product 1', 10.00),
('Product 2', 20.00),
('Product 3', 30.00);
EOF
