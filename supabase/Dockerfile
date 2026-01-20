# Dockerfile for Supabase local development
# This is a reference - Supabase CLI image is used in docker-compose

FROM supabase/supabase-cli:latest

WORKDIR /workspace

# Copy supabase config and migrations
COPY supabase ./supabase

# Expose ports
EXPOSE 54321  # API
EXPOSE 54323  # Studio
EXPOSE 54322  # PostgreSQL

# Start Supabase
CMD ["supabase", "start"]
