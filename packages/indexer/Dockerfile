FROM rust:1.85-alpine3.20 as build

RUN apk add --no-cache git cmake clang openssl openssl-dev openssl-libs-static build-base
WORKDIR /app
COPY Cargo.lock /app
COPY Cargo.toml /app
COPY src /app/src
RUN cargo build

FROM alpine:3.20 as indexer
WORKDIR /app
COPY --from=build /app/target/debug/indexer /app
