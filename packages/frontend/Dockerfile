FROM node:20-alpine as build
WORKDIR /app

COPY package.json /app/package.json
RUN npm install --legacy-peer-deps

COPY . /app

# NEXT_PUBLIC_* are inlined into the bundle at build time and take precedence
# over the values in .env. The remaining NEXT_PUBLIC_* come from .env.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine as frontend
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app /app
EXPOSE 3000
CMD ["npx", "next", "start", "--port", "3000"]
