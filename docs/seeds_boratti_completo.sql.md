\-- \====================================================================

\-- SCRIPT SQL: SISTEMA DE GESTION DE TURNOS MEDICOS

\-- Fuente de estructura: Sanatorio Boratti (Posadas, Misiones)

\-- Catalogo completo de 41 especialidades medicas reales.

\-- Nota de confidencialidad: Nombres de profesionales y matriculas 100% ficticios.

\-- \====================================================================

&nbsp;

\-- 1\. SEDES

INSERT INTO SEDE (id\_sede, nombre\_sede, direccion, telefono) VALUES

(1, 'Sanatorio Boratti \- Sede Central', 'Av. Bartolomé Mitre 2330, Posadas, Misiones', '0376-4440140');

&nbsp;

\-- 2\. ESPECIALIDADES (Catálogo completo de 41 especialidades del Boratti)

INSERT INTO ESPECIALIDAD (id\_especialidad, nombre\_especialidad, descripcion, duracion\_estandar\_min) VALUES

(1, 'Alergología', 'Diagnóstico y tratamiento de enfermedades alérgicas e inmunológicas', 30),

(2, 'Anestesiología', 'Evaluación preanestésica y manejo del dolor perioperatorio', 30),

(3, 'Cardiología', 'Diagnóstico y tratamiento de patologías cardiovasculares', 30),

(4, 'Cardiología Intervencionista', 'Procedimientos hemodinámicos y cateterismos', 30),

(5, 'Cirugía Cardiovascular', 'Intervenciones quirúrgicas cardíacas y de grandes vasos', 40),

(6, 'Cirugía de Cabeza y Cuello', 'Cirugía oncológica y reconstructiva cervicofacial', 40),

(7, 'Cirugía General', 'Cirugía abdominal y digestiva ambulatoria y de internación', 30),

(8, 'Cirugía Infantil', 'Cirugía pediátrica programada y de urgencia', 30),

(9, 'Cirugía Plástica y Reparadora', 'Cirugía estética y procedimientos reconstructivos', 40),

(10, 'Cirugía Torácica', 'Patologías quirúrgicas pulmonares y del mediastino', 40),

(11, 'Clínica Médica', 'Atención clínica integral, preventiva y diagnóstico de adultos', 20),

(12, 'Clínica Pediátrica', 'Control del desarrollo y atención médica infantil', 20),

(13, 'Dermatología', 'Tratamiento clínico y quirúrgico de patologías de la piel', 20),

(14, 'Diabetología', 'Control metabólico y tratamiento integral de la diabetes', 30),

(15, 'Ecografía y Doppler', 'Diagnóstico por imágenes ecográficas de adultos y partes blandas', 20),

(16, 'Ecografía Pediátrica', 'Estudios ecográficos pediátricos y del recién nacido', 20),

(17, 'Flebología y Cirugía Vascular', 'Tratamiento de várices y patologías venosas periféricas', 30),

(18, 'Fonoaudiología', 'Rehabilitación del lenguaje, deglución y audición', 40),

(19, 'Gastroenterología', 'Enfermedades del tracto gastrointestinal e hígado', 30),

(20, 'Gastroenterología Infantil', 'Patologías digestivas en pediatría', 30),

(21, 'Ginecología y Obstetricia', 'Salud integral femenina, control prenatal y ginecológico', 30),

(22, 'Hematología', 'Diagnóstico de enfermedades de la sangre y coagulación', 30),

(23, 'Hemoterapia', 'Medicina transfusional y banco de sangre', 30),

(24, 'Infectología', 'Tratamiento de patologías infecciosas complejas', 30),

(25, 'Kinesiología y Fisioterapia', 'Rehabilitación motora, respiratoria y postural', 40),

(26, 'Medicina Nuclear', 'Estudios diagnósticos y terapias con radioisótopos', 40),

(27, 'Nefrología', 'Prevención y tratamiento de patologías renales e hipertensión', 30),

(28, 'Neumonología Adultos', 'Enfermedades respiratorias del adulto y función pulmonar', 30),

(29, 'Neumonología Infantil', 'Patologías respiratorias y asma en niños', 30),

(30, 'Neurocirugía', 'Cirugía del sistema nervioso central y periférico', 40),

(31, 'Neurocirugía Infantil', 'Tratamiento neuroquirúrgico pediátrico', 40),

(32, 'Neurología', 'Diagnóstico y tratamiento de afecciones neurológicas', 40),

(33, 'Nutrición', 'Evaluación nutricional, planes alimentarios y dietoterapia', 30),

(34, 'Odontología', 'Atención odontológica general, operatoria y prótesis', 30),

(35, 'Oftalmología', 'Control de agudeza visual y patologías oculares', 20),

(36, 'Oncología Médica', 'Tratamiento sistémico y seguimiento oncológico', 40),

(37, 'Ortopedia y Traumatología', 'Patología articular, fracturas y deformidades óseas', 20),

(38, 'Otorrinolaringología', 'Patologías de oído, nariz y garganta', 20),

(39, 'Traumatología Infantil', 'Traumatología y ortopedia pediátrica', 20),

(40, 'Traumatología de Columna', 'Patologías degenerativas y quirúrgicas raquídeas', 30),

(41, 'Urología', 'Aparato urinario y salud reproductiva masculina', 30);

&nbsp;

\-- 3\. CONSULTORIOS

INSERT INTO CONSULTORIO (id\_consultorio, id\_sede, numero\_consultorio, piso, descripcion) VALUES

(1, 1, 'Cons. 01', 'Planta Baja', 'Consultorio Clínico y Admisión'),

(2, 1, 'Cons. 02', 'Planta Baja', 'Electrocardiograma y Cardiología'),

(3, 1, 'Cons. 03', 'Planta Baja', 'Pediatría Ambulatoria A'),

(4, 1, 'Cons. 04', 'Planta Baja', 'Pediatría Ambulatoria B'),

(5, 1, 'Cons. 05', 'Planta Baja', 'Traumatología y Yesos'),

(6, 1, 'Cons. 101', '1° Piso', 'Ginecología y Obstetricia A'),

(7, 1, 'Cons. 102', '1° Piso', 'Ginecología y Obstetricia B'),

(8, 1, 'Cons. 103', '1° Piso', 'Dermatología y Procedimientos'),

(9, 1, 'Cons. 104', '1° Piso', 'Oftalmología Integral'),

(10, 1, 'Cons. 105', '1° Piso', 'Otorrinolaringología'),

(11, 1, 'Cons. 201', '2° Piso', 'Neurología y Neurocirugía'),

(12, 1, 'Cons. 202', '2° Piso', 'Neumonología y Pruebas Funcionales'),

(13, 1, 'Cons. 203', '2° Piso', 'Gastroenterología y Endoscopía'),

(14, 1, 'Cons. 204', '2° Piso', 'Urología Clínica'),

(15, 1, 'Cons. 205', '2° Piso', 'Oncología y Hematología'),

(16, 1, 'Cons. 301', '3° Piso', 'Cirugía General y Consultas Quirúrgicas'),

(17, 1, 'Cons. 302', '3° Piso', 'Nutrición y Diabetología'),

(18, 1, 'Cons. 303', '3° Piso', 'Odontología General'),

(19, 1, 'Cons. 304', '3° Piso', 'Kinesiología y Rehabilitación'),

(20, 1, 'Cons. 305', '3° Piso', 'Ecografía y Doppler');

&nbsp;

\-- 4\. PROFESIONALES (Nombres y matrículas ficticios para confidencialidad)

INSERT INTO PROFESIONAL (id\_profesional, matricula\_nacional, matricula\_provincial, nombre, apellido, telefono, email, activo) VALUES

(1, 'MN 130073', 'MP 3547', 'Marcos', 'Villalba', '3764-100111', 'm.villalba@boratti-demo.com', 1),

(2, 'MN 130146', 'MP 3594', 'Esteban', 'Ríos', '3764-100222', 'e.rios@boratti-demo.com', 1),

(3, 'MN 130219', 'MP 3641', 'Florencia', 'Duarte', '3764-100333', 'f.duarte@boratti-demo.com', 1),

(4, 'MN 130292', 'MP 3688', 'Alejandro', 'Pérez', '3764-100444', 'a.perez@boratti-demo.com', 1),

(5, 'MN 130365', 'MP 3735', 'Ignacio', 'Lombardo', '3764-100555', 'i.lombardo@boratti-demo.com', 1),

(6, 'MN 130438', 'MP 3782', 'Claudio', 'Sosa', '3764-100666', 'c.sosa@boratti-demo.com', 1),

(7, 'MN 130511', 'MP 3829', 'Martín', 'Caballero', '3764-100777', 'm.caballero@boratti-demo.com', 1),

(8, 'MN 130584', 'MP 3876', 'Gonzalo', 'Giménez', '3764-100888', 'g.gimenez@boratti-demo.com', 1),

(9, 'MN 130657', 'MP 3923', 'Mauricio', 'Cáceres', '3764-100999', 'm.caceres@boratti-demo.com', 1),

(10, 'MN 130730', 'MP 3970', 'Tatiana', 'Acuña', '3764-101110', 't.acuna@boratti-demo.com', 1),

(11, 'MN 130803', 'MP 4017', 'Sebastián', 'Vera', '3764-101221', 's.vera@boratti-demo.com', 1),

(12, 'MN 130876', 'MP 4064', 'Federico', 'Godoy', '3764-101332', 'f.godoy@boratti-demo.com', 1),

(13, 'MN 130949', 'MP 4111', 'Mariana', 'Alvarenga', '3764-101443', 'm.alvarenga@boratti-demo.com', 1),

(14, 'MN 131022', 'MP 4158', 'Gustavo', 'Cardozo', '3764-101554', 'g.cardozo@boratti-demo.com', 1),

(15, 'MN 131095', 'MP 4205', 'Valeria', 'Benítez', '3764-101665', 'v.benitez@boratti-demo.com', 1),

(16, 'MN 131168', 'MP 4252', 'Paula', 'Centurión', '3764-101776', 'p.centurion@boratti-demo.com', 1),

(17, 'MN 131241', 'MP 4299', 'Luciana', 'Molina', '3764-101887', 'l.molina@boratti-demo.com', 1),

(18, 'MN 131314', 'MP 4346', 'Diego', 'Romero', '3764-101998', 'd.romero@boratti-demo.com', 1),

(19, 'MN 131387', 'MP 4393', 'Lucas', 'Paredes', '3764-102109', 'l.paredes@boratti-demo.com', 1),

(20, 'MN 131460', 'MP 4440', 'Silvina', 'Ortiz', '3764-102220', 's.ortiz@boratti-demo.com', 1),

(21, 'MN 131533', 'MP 4487', 'Horacio', 'Ferreira', '3764-102331', 'h.ferreira@boratti-demo.com', 1),

(22, 'MN 131606', 'MP 4534', 'Carla', 'Mansilla', '3764-102442', 'c.mansilla@boratti-demo.com', 1),

(23, 'MN 131679', 'MP 4581', 'Javier', 'Toledo', '3764-102553', 'j.toledo@boratti-demo.com', 1),

(24, 'MN 131752', 'MP 4628', 'Gonzalo', 'Ramos', '3764-102664', 'g.ramos@boratti-demo.com', 1),

(25, 'MN 131825', 'MP 4675', 'Nicolás', 'Fernández', '3764-102775', 'n.fernandez@boratti-demo.com', 1),

(26, 'MN 131898', 'MP 4722', 'Lorena', 'Bogado', '3764-102886', 'l.bogado@boratti-demo.com', 1),

(27, 'MN 131971', 'MP 4769', 'Camila', 'Morales', '3764-102997', 'c.morales@boratti-demo.com', 1),

(28, 'MN 132044', 'MP 4816', 'Daniela', 'Valenzuela', '3764-103108', 'd.valenzuela@boratti-demo.com', 1),

(29, 'MN 132117', 'MP 4863', 'Emiliano', 'Aguirre', '3764-103219', 'e.aguirre@boratti-demo.com', 1),

(30, 'MN 132190', 'MP 4910', 'Nélida', 'Peralta', '3764-103330', 'n.peralta@boratti-demo.com', 1),

(31, 'MN 132263', 'MP 4957', 'Andrés', 'Sarmiento', '3764-103441', 'a.sarmiento@boratti-demo.com', 1),

(32, 'MN 132336', 'MP 5004', 'Miriam', 'Stechina', '3764-103552', 'm.stechina@boratti-demo.com', 1),

(33, 'MN 132409', 'MP 5051', 'Gustavo', 'Martínez', '3764-103663', 'g.martinez@boratti-demo.com', 1),

(34, 'MN 132482', 'MP 5098', 'Hugo', 'López', '3764-103774', 'h.lopez@boratti-demo.com', 1),

(35, 'MN 132555', 'MP 5145', 'Jésica', 'Cruz', '3764-103885', 'j.cruz@boratti-demo.com', 1),

(36, 'MN 132628', 'MP 5192', 'Pablo', 'Domínguez', '3764-103996', 'p.dominguez@boratti-demo.com', 1),

(37, 'MN 132701', 'MP 5239', 'Emanuel', 'Giacoppo', '3764-104107', 'e.giacoppo@boratti-demo.com', 1),

(38, 'MN 132774', 'MP 5286', 'Exequiel', 'Figueroa', '3764-104218', 'e.figueroa@boratti-demo.com', 1),

(39, 'MN 132847', 'MP 5333', 'Valeria', 'Britez', '3764-104329', 'v.britez@boratti-demo.com', 1),

(40, 'MN 132920', 'MP 5380', 'Mailén', 'Machado', '3764-104440', 'm.machado@boratti-demo.com', 1),

(41, 'MN 132993', 'MP 5427', 'Romina', 'Rybak', '3764-104551', 'r.rybak@boratti-demo.com', 1),

(42, 'MN 133066', 'MP 5474', 'Joaquín', 'Romero', '3764-104662', 'j.romero@boratti-demo.com', 1),

(43, 'MN 133139', 'MP 5521', 'Verónica', 'Barbereau', '3764-104773', 'v.barbereau@boratti-demo.com', 1),

(44, 'MN 133212', 'MP 5568', 'Rodrigo', 'Giménez', '3764-104884', 'r.gimenez@boratti-demo.com', 1),

(45, 'MN 133285', 'MP 5615', 'Fernando', 'Baretto', '3764-104995', 'f.baretto@boratti-demo.com', 1),

(46, 'MN 133358', 'MP 5662', 'Silvana', 'Zink', '3764-105106', 's.zink@boratti-demo.com', 1),

(47, 'MN 133431', 'MP 5709', 'José', 'Fernández', '3764-105217', 'j.fernandez@boratti-demo.com', 1),

(48, 'MN 133504', 'MP 5756', 'Javier', 'Reble', '3764-105328', 'j.reble@boratti-demo.com', 1),

(49, 'MN 133577', 'MP 5803', 'Clara', 'Acuña', '3764-105439', 'c.acuna@boratti-demo.com', 1);

&nbsp;

\-- 5\. RELACIÓN PROFESIONAL \- ESPECIALIDAD

INSERT INTO PROFESIONAL\_ESPECIALIDAD (id\_profesional, id\_especialidad) VALUES

(1, 1),

(2, 2),

(3, 3),

(4, 3),

(5, 4),

(6, 5),

(7, 6),

(8, 7),

(9, 7),

(10, 8),

(11, 9),

(12, 10),

(13, 11),

(14, 11),

(15, 11),

(16, 12),

(17, 12),

(18, 12),

(19, 13),

(20, 14),

(21, 15),

(22, 16),

(23, 17),

(24, 18),

(25, 19),

(26, 20),

(27, 21),

(28, 21),

(29, 22),

(30, 23),

(31, 24),

(32, 25),

(33, 26),

(34, 27),

(35, 28),

(36, 29),

(37, 30),

(38, 31),

(39, 32),

(40, 33),

(41, 34),

(42, 35),

(43, 36),

(44, 37),

(45, 37),

(46, 38),

(47, 39),

(48, 40),

(49, 41);

&nbsp;

\-- 6\. AGENDAS MEDICAS

\-- dia\_semana: 1=Lunes, 2=Martes, 3=Miercoles, 4=Jueves, 5=Viernes

INSERT INTO AGENDA\_MEDICA (id\_agenda, id\_profesional, id\_consultorio, dia\_semana, hora\_inicio, hora\_fin, duracion\_turno\_min, activa) VALUES

(1, 1, 1, 2, '14:00:00', '18:00:00', 30, 1),

(2, 1, 1, 4, '14:00:00', '18:00:00', 30, 1),

(3, 2, 1, 3, '08:00:00', '12:00:00', 30, 1),

(4, 2, 1, 5, '08:00:00', '12:00:00', 30, 1),

(5, 3, 2, 4, '14:00:00', '18:00:00', 30, 1),

(6, 3, 2, 1, '14:00:00', '18:00:00', 30, 1),

(7, 4, 2, 5, '08:00:00', '12:00:00', 30, 1),

(8, 4, 2, 2, '08:00:00', '12:00:00', 30, 1),

(9, 5, 2, 1, '14:00:00', '18:00:00', 30, 1),

(10, 5, 2, 3, '14:00:00', '18:00:00', 30, 1),

(11, 6, 16, 2, '08:00:00', '12:00:00', 40, 1),

(12, 6, 16, 4, '08:00:00', '12:00:00', 40, 1),

(13, 7, 16, 3, '14:00:00', '18:00:00', 40, 1),

(14, 7, 16, 5, '14:00:00', '18:00:00', 40, 1),

(15, 8, 16, 4, '08:00:00', '12:00:00', 30, 1),

(16, 8, 16, 1, '08:00:00', '12:00:00', 30, 1),

(17, 9, 16, 5, '14:00:00', '18:00:00', 30, 1),

(18, 9, 16, 2, '14:00:00', '18:00:00', 30, 1),

(19, 10, 3, 1, '08:00:00', '12:00:00', 30, 1),

(20, 10, 3, 3, '08:00:00', '12:00:00', 30, 1),

(21, 11, 16, 2, '14:00:00', '18:00:00', 40, 1),

(22, 11, 16, 4, '14:00:00', '18:00:00', 40, 1),

(23, 12, 16, 3, '08:00:00', '12:00:00', 40, 1),

(24, 12, 16, 5, '08:00:00', '12:00:00', 40, 1),

(25, 13, 1, 4, '14:00:00', '18:00:00', 20, 1),

(26, 13, 1, 1, '14:00:00', '18:00:00', 20, 1),

(27, 14, 1, 5, '08:00:00', '12:00:00', 20, 1),

(28, 14, 1, 2, '08:00:00', '12:00:00', 20, 1),

(29, 15, 1, 1, '14:00:00', '18:00:00', 20, 1),

(30, 15, 1, 3, '14:00:00', '18:00:00', 20, 1),

(31, 16, 3, 2, '08:00:00', '12:00:00', 20, 1),

(32, 16, 3, 4, '08:00:00', '12:00:00', 20, 1),

(33, 17, 4, 3, '14:00:00', '18:00:00', 20, 1),

(34, 17, 4, 5, '14:00:00', '18:00:00', 20, 1),

(35, 18, 4, 4, '08:00:00', '12:00:00', 20, 1),

(36, 18, 4, 1, '08:00:00', '12:00:00', 20, 1),

(37, 19, 8, 5, '14:00:00', '18:00:00', 20, 1),

(38, 19, 8, 2, '14:00:00', '18:00:00', 20, 1),

(39, 20, 17, 1, '08:00:00', '12:00:00', 30, 1),

(40, 20, 17, 3, '08:00:00', '12:00:00', 30, 1),

(41, 21, 20, 2, '14:00:00', '18:00:00', 20, 1),

(42, 21, 20, 4, '14:00:00', '18:00:00', 20, 1),

(43, 22, 20, 3, '08:00:00', '12:00:00', 20, 1),

(44, 22, 20, 5, '08:00:00', '12:00:00', 20, 1),

(45, 23, 16, 4, '14:00:00', '18:00:00', 30, 1),

(46, 23, 16, 1, '14:00:00', '18:00:00', 30, 1),

(47, 24, 19, 5, '08:00:00', '12:00:00', 40, 1),

(48, 24, 19, 2, '08:00:00', '12:00:00', 40, 1),

(49, 25, 13, 1, '14:00:00', '18:00:00', 30, 1),

(50, 25, 13, 3, '14:00:00', '18:00:00', 30, 1),

(51, 26, 3, 2, '08:00:00', '12:00:00', 30, 1),

(52, 26, 3, 4, '08:00:00', '12:00:00', 30, 1),

(53, 27, 6, 3, '14:00:00', '18:00:00', 30, 1),

(54, 27, 6, 5, '14:00:00', '18:00:00', 30, 1),

(55, 28, 7, 4, '08:00:00', '12:00:00', 30, 1),

(56, 28, 7, 1, '08:00:00', '12:00:00', 30, 1),

(57, 29, 15, 5, '14:00:00', '18:00:00', 30, 1),

(58, 29, 15, 2, '14:00:00', '18:00:00', 30, 1),

(59, 30, 15, 1, '08:00:00', '12:00:00', 30, 1),

(60, 30, 15, 3, '08:00:00', '12:00:00', 30, 1),

(61, 31, 1, 2, '14:00:00', '18:00:00', 30, 1),

(62, 31, 1, 4, '14:00:00', '18:00:00', 30, 1),

(63, 32, 19, 3, '08:00:00', '12:00:00', 40, 1),

(64, 32, 19, 5, '08:00:00', '12:00:00', 40, 1),

(65, 33, 20, 4, '14:00:00', '18:00:00', 40, 1),

(66, 33, 20, 1, '14:00:00', '18:00:00', 40, 1),

(67, 34, 1, 5, '08:00:00', '12:00:00', 30, 1),

(68, 34, 1, 2, '08:00:00', '12:00:00', 30, 1),

(69, 35, 12, 1, '14:00:00', '18:00:00', 30, 1),

(70, 35, 12, 3, '14:00:00', '18:00:00', 30, 1),

(71, 36, 3, 2, '08:00:00', '12:00:00', 30, 1),

(72, 36, 3, 4, '08:00:00', '12:00:00', 30, 1),

(73, 37, 11, 3, '14:00:00', '18:00:00', 40, 1),

(74, 37, 11, 5, '14:00:00', '18:00:00', 40, 1),

(75, 38, 11, 4, '08:00:00', '12:00:00', 40, 1),

(76, 38, 11, 1, '08:00:00', '12:00:00', 40, 1),

(77, 39, 11, 5, '14:00:00', '18:00:00', 40, 1),

(78, 39, 11, 2, '14:00:00', '18:00:00', 40, 1),

(79, 40, 17, 1, '08:00:00', '12:00:00', 30, 1),

(80, 40, 17, 3, '08:00:00', '12:00:00', 30, 1),

(81, 41, 18, 2, '14:00:00', '18:00:00', 30, 1),

(82, 41, 18, 4, '14:00:00', '18:00:00', 30, 1),

(83, 42, 9, 3, '08:00:00', '12:00:00', 20, 1),

(84, 42, 9, 5, '08:00:00', '12:00:00', 20, 1),

(85, 43, 15, 4, '14:00:00', '18:00:00', 40, 1),

(86, 43, 15, 1, '14:00:00', '18:00:00', 40, 1),

(87, 44, 5, 5, '08:00:00', '12:00:00', 20, 1),

(88, 44, 5, 2, '08:00:00', '12:00:00', 20, 1),

(89, 45, 5, 1, '14:00:00', '18:00:00', 20, 1),

(90, 45, 5, 3, '14:00:00', '18:00:00', 20, 1),

(91, 46, 10, 2, '08:00:00', '12:00:00', 20, 1),

(92, 46, 10, 4, '08:00:00', '12:00:00', 20, 1),

(93, 47, 5, 3, '14:00:00', '18:00:00', 20, 1),

(94, 47, 5, 5, '14:00:00', '18:00:00', 20, 1),

(95, 48, 5, 4, '08:00:00', '12:00:00', 30, 1),

(96, 48, 5, 1, '08:00:00', '12:00:00', 30, 1),

(97, 49, 14, 5, '14:00:00', '18:00:00', 30, 1),

(98, 49, 14, 2, '14:00:00', '18:00:00', 30, 1);

&nbsp;