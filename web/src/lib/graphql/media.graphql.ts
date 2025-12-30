import { gql } from 'urql'

export const UPLOAD_FILE_MUTATION = gql`
  mutation UploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      success
      message
      data {
        id
        modelType
        modelId
        uuid
        collectionName
        name
        fileName
        mimeType
        disk
        size
        isPublic
        publicUrl
        url
        createdAt
        updatedAt
      }
    }
  }
`

export const DELETE_MEDIA_MUTATION = gql`
  mutation DeleteMedia($id: ID!) {
    deleteMedia(id: $id) {
      success
      message
    }
  }
`

export const GET_MEDIA_BY_MODEL_QUERY = gql`
  query GetMediaByModel($input: GetFilesByModelInput!) {
    mediaByModel(input: $input) {
      success
      message
      data {
        media {
          id
          modelType
          modelId
          uuid
          collectionName
          name
          fileName
          mimeType
          disk
          size
          url
          createdAt
          updatedAt
        }
        total
        page
        perPage
      }
    }
  }
`
