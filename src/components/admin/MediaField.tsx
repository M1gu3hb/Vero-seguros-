'use client'

/* eslint-disable @next/next/no-img-element */
import { useId, useRef, useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/schemas'
import { createClient } from '@/lib/supabase/client'
import { MEDIA_BUCKET } from '@/lib/supabase/config'

type MediaFieldProps = {
  label: string
  hint?: string
  /** Nombre del campo oculto donde viaja la URL pública. */
  urlName: string
  /** Nombre del campo de texto alternativo. */
  altName: string
  defaultUrl?: string | null
  defaultAlt?: string | null
  /** Carpeta dentro del bucket, por ejemplo `hero` o `sobre`. */
  folder: string
  onChanged?: () => void
}

const MIN_DIMENSION = 320
const MAX_DIMENSION = 6000

/** Nombre de archivo seguro: sin rutas, acentos ni espacios. */
function safeFileName(original: string) {
  const extension = (original.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const base = original
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return `${base || 'imagen'}-${Date.now()}.${extension || 'jpg'}`
}

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen.'))
    }
    image.src = url
  })
}

/**
 * Carga y sustitución de imágenes.
 *
 * El archivo se sube directamente a Supabase Storage con la sesión de la
 * administradora (las políticas del bucket sólo permiten escritura a
 * `is_admin()`), y en el formulario viaja únicamente la URL pública.
 */
export function MediaField({
  label,
  hint,
  urlName,
  altName,
  defaultUrl,
  defaultAlt,
  folder,
  onChanged,
}: MediaFieldProps) {
  const inputId = useId()
  const [url, setUrl] = useState<string>(defaultUrl ?? '')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setStatus(null)

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      setError('Formato no admitido. Usa JPG, PNG, WebP o AVIF.')
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError(
        `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo son ${(
          MAX_IMAGE_BYTES /
          1024 /
          1024
        ).toFixed(0)} MB.`,
      )
      return
    }

    let dimensions: { width: number; height: number }
    try {
      dimensions = await readDimensions(file)
    } catch {
      setError('No se pudo leer la imagen. Prueba con otro archivo.')
      return
    }

    if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
      setError(`La imagen es muy pequeña. El mínimo son ${MIN_DIMENSION} píxeles por lado.`)
      return
    }

    if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
      setError(`La imagen es muy grande. El máximo son ${MAX_DIMENSION} píxeles por lado.`)
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const path = `${folder}/${safeFileName(file.name)}`

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)

      setUrl(publicUrl)
      setStatus(
        `Imagen lista (${dimensions.width}×${dimensions.height} px). Guarda para publicarla.`,
      )
      onChanged?.()
    } catch (uploadError) {
      console.error('[admin] error al subir la imagen:', uploadError)
      setError('No se pudo subir la imagen. Revisa tu conexión e inténtalo otra vez.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {hint ? <p className={styles.hint}>{hint}</p> : null}

      <div className={styles.media}>
        <div className={styles.mediaPreviewWrap}>
          {url ? (
            <img src={url} alt="Vista previa de la imagen cargada" className={styles.mediaPreview} />
          ) : (
            <span className={styles.mediaEmpty}>Sin imagen. El diseño funciona igual sin ella.</span>
          )}

          <div className={styles.mediaControls}>
            <label className={styles.fileButton} htmlFor={inputId}>
              {uploading ? 'Subiendo…' : url ? 'Sustituir imagen' : 'Cargar imagen'}
            </label>
            <input
              ref={fileRef}
              id={inputId}
              type="file"
              className={styles.fileInput}
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              disabled={uploading}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0]
                if (file) void handleFile(file)
              }}
            />

            <p className={styles.mediaMeta}>
              JPG, PNG, WebP o AVIF · máximo 3 MB · mínimo {MIN_DIMENSION} px por lado. Se recomienda
              una imagen vertical (proporción 4:5).
            </p>

            {status ? (
              <p className={styles.mediaMeta} role="status">
                {status}
              </p>
            ) : null}
            {error ? (
              <p className={styles.fieldError} role="alert">
                {error}
              </p>
            ) : null}

            {url ? (
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  setUrl('')
                  setStatus('Se quitará la imagen al guardar.')
                  onChanged?.()
                }}
              >
                Quitar imagen
              </button>
            ) : null}
          </div>
        </div>

        <input type="hidden" name={urlName} value={url} />

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${inputId}-alt`}>
            Texto alternativo
          </label>
          <p className={styles.hint}>
            Describe brevemente la imagen para quien no puede verla. Por ejemplo: «Verónica Méndez
            en su oficina».
          </p>
          <input
            id={`${inputId}-alt`}
            name={altName}
            type="text"
            className={styles.input}
            defaultValue={defaultAlt ?? ''}
            maxLength={160}
            placeholder="Verónica Méndez, Agente de Seguros Certificada"
          />
        </div>
      </div>
    </div>
  )
}
