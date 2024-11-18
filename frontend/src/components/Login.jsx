import userService from '../services/user.js'

const Login = ({setUser, notify, setIsRegistering}) => {

  

  // Event handler for logging in
  const handleLogin = async event => {
    event.preventDefault()
    const username = event.target.username.value
    const password = event.target.password.value
    
    // Attempts to post credentials and sets the user state if successful
    try{
      const response = await userService.login({username, password})
      setUser(response)
      window.localStorage.setItem('chat user', JSON.stringify(response))
    } catch (e) {
      if (e.message === 'Network Error'){
        notify('Network Error', 'Please try again later.')
      } else {
        notify(`Login failed`, e.response.data.error)
      }
    }
  }
  return (
    <div className='loginDiv'>
      <form onSubmit={handleLogin}>
        <input autoComplete='username' name='username' type='text' required={true} placeholder='username'/>
        <input autoComplete='current-password' name='password' type='password' required={true} placeholder='password'/>
        <button type='submit'>login</button>
        <button type="button" onClick={() => {
          setIsRegistering(true)
        }}>Register</button>
      </form>
    </div>
  )
}

export default Login