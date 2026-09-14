-- CreateTable
CREATE TABLE `profesionales` (
    `id_profesional` INTEGER NOT NULL AUTO_INCREMENT,
    `id_persona` INTEGER NOT NULL,
    `matricula` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profesionales_id_persona_key`(`id_persona`),
    UNIQUE INDEX `profesionales_matricula_key`(`matricula`),
    PRIMARY KEY (`id_profesional`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidades` (
    `id_especialidad` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `especialidades_nombre_key`(`nombre`),
    PRIMARY KEY (`id_especialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profesionales_especialidades` (
    `id_profesional` INTEGER NOT NULL,
    `id_especialidad` INTEGER NOT NULL,

    PRIMARY KEY (`id_profesional`, `id_especialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profesionales` ADD CONSTRAINT `profesionales_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `personas`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profesionales_especialidades` ADD CONSTRAINT `profesionales_especialidades_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `profesionales`(`id_profesional`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profesionales_especialidades` ADD CONSTRAINT `profesionales_especialidades_id_especialidad_fkey` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades`(`id_especialidad`) ON DELETE RESTRICT ON UPDATE CASCADE;
