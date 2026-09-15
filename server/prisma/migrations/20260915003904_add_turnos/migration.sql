-- CreateTable
CREATE TABLE `turnos` (
    `id_turno` INTEGER NOT NULL AUTO_INCREMENT,
    `id_paciente` INTEGER NOT NULL,
    `id_profesional` INTEGER NOT NULL,
    `id_especialidad` INTEGER NOT NULL,
    `id_agenda` INTEGER NULL,
    `id_consultorio` INTEGER NULL,
    `fecha` DATE NOT NULL,
    `hora_inicio` VARCHAR(5) NOT NULL,
    `hora_fin` VARCHAR(5) NOT NULL,
    `estado` ENUM('CONFIRMADO', 'CANCELADO', 'ATENDIDO', 'AUSENTE') NOT NULL DEFAULT 'CONFIRMADO',
    `motivo_consulta` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    INDEX `turnos_id_profesional_fecha_hora_inicio_idx`(`id_profesional`, `fecha`, `hora_inicio`),
    INDEX `turnos_id_paciente_fecha_idx`(`id_paciente`, `fecha`),
    PRIMARY KEY (`id_turno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `turnos` ADD CONSTRAINT `turnos_id_paciente_fkey` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes`(`id_paciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turnos` ADD CONSTRAINT `turnos_id_profesional_fkey` FOREIGN KEY (`id_profesional`) REFERENCES `profesionales`(`id_profesional`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turnos` ADD CONSTRAINT `turnos_id_especialidad_fkey` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades`(`id_especialidad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turnos` ADD CONSTRAINT `turnos_id_agenda_fkey` FOREIGN KEY (`id_agenda`) REFERENCES `agendas`(`id_agenda`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turnos` ADD CONSTRAINT `turnos_id_consultorio_fkey` FOREIGN KEY (`id_consultorio`) REFERENCES `consultorios`(`id_consultorio`) ON DELETE SET NULL ON UPDATE CASCADE;
