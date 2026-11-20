FROM gradle:jdk21 AS build
WORKDIR /src
COPY . .
RUN gradle jar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/build/libs/server.jar server.jar
CMD ["java", "-DFCGI_PORT=9000", "-jar", "server.jar"]