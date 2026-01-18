export interface Media {
  id: string
  modelType: string
  modelId: string
  uuid: string
  collectionName: string
  name: string
  fileName: string
  mimeType: string | null
  disk: string
  size: number
  isPublic: boolean
  publicUrl: string | null
  url: string | null
  createdAt: number
  updatedAt: number
}

export interface UploadFileInput {
  content: File
  fileName: string
  mimeType: string
  modelType: string
  modelId: string
  collectionName: string
  name?: string
  disk: string
  isPublic?: boolean
}

export interface UploadFileResponse {
  uploadFile: {
    success: boolean
    message: string
    data: Media
  }
}

export interface DeleteMediaResponse {
  deleteMedia: {
    success: boolean
    message: string
  }
}

export interface MediaByModelResponse {
  mediaByModel: {
    success: boolean
    message: string
    data: {
      media: Array<Media>
      total: number
      page: number
      perPage: number
    }
  }
}
