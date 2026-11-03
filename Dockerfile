FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


FROM maven:3.9-eclipse-temurin-25 AS backend-build

WORKDIR /app

COPY pom.xml .
COPY src ./src

COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

RUN mvn -DskipTests package


FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=backend-build /app/target/OnlineSchool_1-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
