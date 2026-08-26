function loadBrowserImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No se pudo leer la imagen seleccionada.'))
    }
    image.src = objectUrl
  })
}

/** Comprime una imagen en Base64 para enviarla a la API. */
export async function compressImageFile(file: File): Promise<string> {
  const image = await loadBrowserImage(file)
  const maxDimension = 900
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  let width = Math.max(1, Math.round(image.width * scale))
  let height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) throw new Error('El navegador no pudo procesar la imagen.')

  let quality = 0.78
  let result = ''
  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)
    result = canvas.toDataURL('image/jpeg', quality)

    if (result.length <= 75_000) return result

    quality = Math.max(0.42, quality - 0.08)
    width = Math.max(320, Math.round(width * 0.85))
    height = Math.max(240, Math.round(height * 0.85))
  }

  if (result.length > 90_000) {
    throw new Error('La imagen no pudo reducirse lo suficiente. Intenta con otra más pequeña.')
  }

  return result
}
