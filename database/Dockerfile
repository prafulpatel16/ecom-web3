# Use the official PostgreSQL image as the base
FROM postgres:13

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=ecomm

# Copy the initdb.sql file to the container's /docker-entrypoint-initdb.d directory
COPY initdb.sql /docker-entrypoint-initdb.d/initdb.sql

# Expose the PostgreSQL port
EXPOSE 5432

# Run PostgreSQL when the container starts
CMD ["postgres"]
