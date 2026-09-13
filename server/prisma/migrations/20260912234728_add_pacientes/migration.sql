-- CreateTable
CREATE TABLE `pacientes` (
    `id_paciente` INTEGER NOT NULL AUTO_INCREMENT,
    `id_persona` INTEGER NOT NULL,
    `obra_social` VARCHAR(100) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pacientes_id_persona_key`(`id_persona`),
    PRIMARY KEY (`id_paciente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pacientes` ADD CONSTRAINT `pacientes_id_persona_fkey` FOREIGN KEY (`id_persona`) REFERENCES `personas`(`id_persona`) ON DELETE RESTRICT ON UPDATE CASCADE;
