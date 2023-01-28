const ERRORS = {
  // simple errors
  INVALID_REQUEST: 'The request is invalid',
  UNKNOWN_ROUTE: "I don't know how to handle that",

  // errors that take params
  GENERIC_ERROR: (path = 'unknown') => `Caught error in path '${path}'`,
}

export default ERRORS
