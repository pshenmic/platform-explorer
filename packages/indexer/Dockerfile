FROM rust:1.76-bookworm

RUN apt-get update && apt-get install -y cmake clang

WORKDIR /
RUN git clone --depth 1 --branch v1.0.0-dev.12  https://github.com/dashevo/platform

WORKDIR /app
COPY Cargo.lock /app
COPY Cargo.toml /app
COPY migrations /app/migrations
COPY src /app/src

RUN cargo build
RUN cargo install refinery_cli
