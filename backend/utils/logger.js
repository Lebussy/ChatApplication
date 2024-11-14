const error = (...error) => {
  if (!(process.env.NODE_ENV === 'test')){
    console.error(...error)
  }
}

const info = (...info) => {
  if (!(process.env.NODE_ENV === 'test')){
    console.log(...info)
  }
}

export default { error, info }