
FROM rust:1.80-alpine3.19 as build 
RUN apk add --no-cache git cmake clang libressl-dev
WORKDIR /
RUN git clone --depth 1 --branch v1.0.0-beta.4  https://github.com/dashevo/platform
WORKDIR /app
COPY Cargo.lock /app
COPY Cargo.toml /app
COPY migrations /app/migrations
COPY src /app/src
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --target x86_64-unknown-linux-musl --release
RUN ls
RUN cargo install refinery_cli

FROM scratch
COPY --from=build /app/target/x86_64-unknown-linux-musl/release /app  

# FROM rust:1.76-bookworm

# RUN apt-get update && apt-get install -y cmake clang

# WORKDIR /
# RUN git clone --depth 1 --branch v1.0.0-dev.12  https://github.com/dashevo/platform

# WORKDIR /app
# COPY Cargo.lock /app
# COPY Cargo.toml /app
# COPY migrations /app/migrations
# COPY src /app/src

# RUN cargo build
# RUN cargo install refinery_cli
