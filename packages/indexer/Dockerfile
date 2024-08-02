FROM rust:1.80-alpine3.19 as build 
RUN apk add --no-cache git cmake clang libressl-dev
WORKDIR /
RUN git clone --depth 1 --branch v1.0.0-beta.4  https://github.com/dashevo/platform
WORKDIR /app
COPY Cargo.lock /app
COPY Cargo.toml /app
COPY migrations /app/migrations
COPY src /app/src
RUN cargo build

FROM alpine:3.19 as indexer
WORKDIR /app
COPY --from=build /app/target/debug /app    