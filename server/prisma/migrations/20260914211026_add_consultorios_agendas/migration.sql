-- CreateTable
CREATE TABLE `consultorios` (
    `id_consultorio` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(50) NOT NULL,
    `ubicacion` VARCHAR(150) NULL,
    `piso` VARCHAR(50) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `consultorios_numero_key`(`numero`),
    PRIMARY KEY (`id_consultorio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agendas` (
    `id_agenda` INTEGER NOT NULL AUTO_INCREMENT,
    `id_profesional` INTEGER NOT NULL,
    `id_consultorio` INTEGER NOT NULL,
    `dia_semana` INTEGER NOT NULL,
    `hora_inicio` VARCHAR(5) NOT NULL,
    `hora_fin` VARCHAR(5) NOT NULL,
    `duracion_minutos` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_agenda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `agendas` ADD CONSTRAINT `agendas_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `profesionales`(`id_profesional`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendas` ADD CONSTRAINT `agendas_id_consultorio_fkey` FOREIGN KEY (`id_consultorio`) REFERENCES `consultorios`(`id_consultorio`) ON DELETE RESTRICT ON UPDATE CASCADE;
