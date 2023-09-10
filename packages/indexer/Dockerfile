FROM rust:1.72-bookworm

RUN apt-get update && apt-get install -y cmake clang

WORKDIR /
RUN git clone --branch fix/rs-dpp-import https://github.com/dashevo/platform

WORKDIR /app
COPY Cargo.lock /app
COPY Cargo.toml /app
COPY src /app/src

RUN cargo build

CMD ["cargo", "run"]
