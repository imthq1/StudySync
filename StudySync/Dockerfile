# ============================================
# STAGE 1: BUILD - biên dịch mã nguồn và đóng gói thành .jar
# ============================================
FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

# Copy Maven wrapper và pom.xml trước để tận dụng Docker layer cache
# (nếu dependencies không đổi, Docker sẽ không tải lại)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Cấp quyền thực thi cho mvnw (phòng trường hợp mất quyền khi clone/copy)
RUN chmod +x mvnw

# Tải dependencies trước (cache layer riêng)
RUN ./mvnw dependency:go-offline -B

# Copy toàn bộ source code
COPY src ./src

# Build project, bỏ qua test để tăng tốc độ build image
# (test nên chạy ở bước CI riêng, không nên chạy trong lúc build image)
RUN ./mvnw clean package -DskipTests -B

# ============================================
# STAGE 2: RUNTIME - chỉ chứa JRE + file .jar, image nhẹ hơn nhiều
# ============================================
FROM eclipse-temurin:17-jre-jammy AS runtime

# Tạo user không phải root để chạy ứng dụng (bảo mật tốt hơn)
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

WORKDIR /app

# Copy file .jar đã build từ stage build sang stage runtime
COPY --from=build /app/target/*.jar app.jar

# Port mà Spring Boot lắng nghe (đổi nếu app của bạn dùng port khác)
EXPOSE 8080

# Cấu hình JVM có thể override qua biến môi trường JAVA_OPTS
ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]