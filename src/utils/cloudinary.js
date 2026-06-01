const CLOUD_NAME = 'dvt0nntn7'
const UPLOAD_PRESET = 'aromena_uploads'

// ضغط الصورة قبل الرفع
async function compressImage(file, maxSizeMB = 2) {
  return new Promise((resolve) => {
    const maxSize = maxSizeMB * 1024 * 1024

    // إذا الصورة أصغر من الحد ما نضغطها
    if (file.size <= maxSize) {
      resolve(file)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // تصغير الأبعاد إذا كانت كبيرة
      const maxDimension = 1920
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // ضغط تدريجي حتى يوصل للحجم المطلوب
      let quality = 0.9
      const tryCompress = () => {
        canvas.toBlob(
          blob => {
            if (blob.size <= maxSize || quality <= 0.3) {
              const compressed = new File([blob], file.name, { type: 'image/jpeg' })
              URL.revokeObjectURL(url)
              resolve(compressed)
            } else {
              quality -= 0.1
              tryCompress()
            }
          },
          'image/jpeg',
          quality
        )
      }

      tryCompress()
    }

    img.src = url
  })
}

export async function uploadImage(file, onProgress) {
  // ضغط الصورة أولاً
  const compressed = await compressImage(file, 2)

  const formData = new FormData()
  formData.append('file', compressed)
  formData.append('upload_preset', UPLOAD_PRESET)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress?.(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        resolve(data.secure_url)
      } else {
        reject(new Error('Upload failed: ' + xhr.responseText))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.send(formData)
  })
}