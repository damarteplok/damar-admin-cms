import { gql } from 'urql'

export const GET_MY_PROFILE_QUERY = gql`
  query GetMyProfile {
    me {
      success
      message
      data {
        id
        name
        email
        publicName
        isAdmin
        isBlocked
        phoneNumber
        position
        emailVerified
        emailVerifiedAt
        lastLoginAt
        createdAt
        updatedAt
        avatar {
          id
          uuid
          url
          fileName
          mimeType
          size
        }
      }
    }
  }
`

export const GET_USER_PROFILE_QUERY = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      success
      message
      data {
        id
        name
        email
        publicName
        isAdmin
        isBlocked
        phoneNumber
        position
        emailVerified
        emailVerifiedAt
        lastLoginAt
        createdAt
        updatedAt
        avatar {
          id
          uuid
          url
          fileName
          mimeType
          size
        }
      }
    }
  }
`

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateUser(input: $input) {
      success
      message
      data {
        id
        name
        email
        publicName
        phoneNumber
        position
        isAdmin
        isBlocked
        updatedAt
      }
    }
  }
`

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`

export const UPLOAD_AVATAR_MUTATION = gql`
  mutation UploadAvatar($input: UploadFileInput!) {
    uploadFile(input: $input) {
      success
      message
      data {
        id
        uuid
        url
        fileName
        mimeType
        size
        collectionName
        modelType
        modelId
      }
    }
  }
`

export const DELETE_AVATAR_MUTATION = gql`
  mutation DeleteAvatar($id: ID!) {
    deleteMedia(id: $id) {
      success
      message
    }
  }
`
