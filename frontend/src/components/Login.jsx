import userService from '../services/user.js'
import { socket } from '../socket.js'

const Login = ({setUser}) => {

  // Event handler for logging in
  const handleLogin = async event => {
    event.preventDefault()
    const username = event.target.username.value
    const password = event.target.password.value
    
    // Attempts to post credentials and sets the user state if successful
    try{
      const response = await userService.login({username, password})
      setUser(response)
      socket.connect()
    } catch (e) {
      console.log(e.response.data.error)
    }
  }
  return (
    <div className='loginDiv'>
      <form onSubmit={handleLogin}>
        <input name='username' type='text' required={true} placeholder='username'/>
        <input name='password' type='password' required={true} placeholder='password'/>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default Login