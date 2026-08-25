-- ===========================================================================
-- 0008 · Dos ramos más: viajes y estudiantes
--
-- Los pidió Verónica. Van al final de la lista, después de las membresías, y
-- se redactan con el mismo cuidado que los otros ocho: qué cubre cada uno,
-- sin prometer nada que dependa de la aseguradora o del perfil de quien
-- contrata.
--
-- `on conflict (slug) do nothing` para que volver a ejecutarla no duplique
-- nada ni pise lo que ella haya editado desde el administrador.
-- ===========================================================================

insert into public.services (id, name, slug, description, detail, icon, sort_order, is_visible)
values
  (
    '11111111-1111-4111-8111-000000000009',
    'Seguro de Viajes',
    'viajes',
    'Respaldo médico y de asistencia mientras estás fuera de casa, dentro del país o en el extranjero.',
    'Cubre los imprevistos de un viaje, dentro de la vigencia y del destino contratados: atención médica y hospitalaria por accidente o por enfermedad repentina, medicamentos y, si hace falta, traslado sanitario. Según el plan puede sumar pérdida o demora del equipaje, cancelación o interrupción del viaje y asistencia a distancia. Se contrata por viaje o por año, y el destino, la duración y la edad influyen en lo que queda cubierto.',
    'viajes',
    9,
    true
  ),
  (
    '11111111-1111-4111-8111-000000000010',
    'Seguro de Estudiantes',
    'estudiantes',
    'Protección para niñas, niños y jóvenes durante su vida escolar, dentro y fuera del plantel.',
    'Pensado para la etapa escolar. Cubre la atención médica derivada de un accidente del estudiante —curaciones, estudios, hospitalización y, según el plan, atención dental— durante las actividades escolares y los trayectos de ida y vuelta. Puede incluir apoyo por invalidez o fallecimiento accidental y una beca educativa si llega a faltar quien sostiene los estudios. Hay planes individuales, otros que contrata la escuela para todo el grupo, y coberturas para quien va a estudiar al extranjero.',
    'estudiantes',
    10,
    true
  )
on conflict (slug) do nothing;
