export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      success
      message
      data {
        accessToken
        refreshToken
        expiresIn
        user {
          id
          name
          email
          isAdmin
        }
      }
    }
  }
`

export const LOGOUT_MUTATION = `
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken) {
      success
      message
    }
  }
`

export const REGISTER_MUTATION = `
  mutation Register(
    $name: String!
    $email: String!
    $password: String!
    $publicName: String
  ) {
    createUser(
      input: {
        name: $name
        email: $email
        password: $password
        publicName: $publicName
      }
    ) {
      success
      message
      data {
        id
        name
        email
      }
    }
  }
`

// Alias for signup
export const SIGNUP_MUTATION = REGISTER_MUTATION
