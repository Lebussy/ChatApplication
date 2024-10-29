import config from './utils/config.js'
import logger from './utils/logger.js'
import app from './app.js'

// initialise the app to listen on the port
app.listen(config.PORT, () => {
  logger.info('...listening on port ', config.PORT)
})