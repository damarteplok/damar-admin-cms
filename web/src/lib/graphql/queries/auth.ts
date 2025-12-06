export const ME_QUERY = `
  query Me {
    me {
      success
      message
      data {
        id
        name
        email
        publicName
        isAdmin
        emailVerified
      }
    }
  }
`

export const GET_USER_BY_ID = `
  query GetUser($id: ID!) {
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
        emailVerified
        createdAt
        updatedAt
      }
    }
  }
`
