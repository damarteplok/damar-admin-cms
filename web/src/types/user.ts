export interface UserProfile {
  id: string
  name: string
  email: string
  publicName?: string
  isAdmin: boolean
  isBlocked: boolean
  phoneNumber?: string
  position?: string
  emailVerified: boolean
  emailVerifiedAt?: number
  lastLoginAt?: number
  createdAt: number
  updatedAt: number
  avatar?: MediaFile
}

export interface MediaFile {
  id: string
  modelType: string
  modelId: string
  uuid: string
  collectionName: string
  name: string
  fileName: string
  mimeType?: string
  disk: string
  conversionsDisk?: string
  size: number
  manipulations: string
  customProperties: string
  generatedConversions: string
  responsiveImages: string
  orderColumn?: number
  url?: string
  createdAt: number
  updatedAt: number
}

export interface UserProfileResponse {
  user: {
    success: boolean
    message: string
    data: UserProfile
  }
}

export interface ProfileMeResponse {
  me: {
    success: boolean
    message: string
    data: UserProfile
  }
}

export interface UsersListResponse {
  users: {
    success: boolean
    message: string
    data: {
      users: UserProfile[]
      total: number
      page: number
      perPage: number
    }
  }
}

export interface UpdateProfileInput {
  id: string
  name: string
  email?: string
  publicName?: string
  phoneNumber?: string
  position?: string
  isAdmin?: boolean
  isBlocked?: boolean
}

export interface UpdateProfileResponse {
  updateUser: {
    success: boolean
    message: string
    data: UserProfile
  }
}

export interface ChangePasswordInput {
  oldPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  changePassword: {
    success: boolean
    message: string
  }
}

export interface UploadAvatarInput {
  content: File
  fileName: string
  mimeType: string
  modelType: string
  modelId: string
  collectionName: string
  name?: string
  disk: string
}

export interface UploadAvatarResponse {
  uploadFile: {
    success: boolean
    message: string
    data: MediaFile
  }
}

export interface DeleteAvatarResponse {
  deleteMedia: {
    success: boolean
    message: string
  }
}
