-- CreateTable
CREATE TABLE `personas` (
    `id_persona` INTEGER NOT NULL AUTO_INCREMENT,
    `dni` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(50) NULL,
    `email` VARCHAR(150) NOT NULL,
    `fecha_nacimiento` DATE NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `personas_dni_key`(`dni`),
    UNIQUE INDEX `personas_email_key`(`email`),
    PRIMARY KEY (`id_persona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_persona` INTEGER NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `rol` ENUM('PACIENTE', 'PROFESIONAL', 'RECEPCIONISTA', 'ADMIN') NOT NULL DEFAULT 'PACIENTE',
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_id_persona_key`(`id_persona`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `personas`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;
