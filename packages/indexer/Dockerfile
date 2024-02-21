FROM rust:1.73-bookworm

RUN apt-get update && apt-get install -y cmake clang

WORKDIR /
RUN git clone --depth 1 --branch fix/assets-ulock-tx-size https://github.com/dashevo/platform

WORKDIR /app
COPY Cargo.lock /app
COPY Cargo.toml /app
COPY migrations /app/migrations
COPY src /app/src

RUN cargo build
RUN cargo install refinery_cli
