import userService from '../services/user.js'

const UserRegistration = ({notify, setIsRegistering}) => {

  const handleRegistration = async (event) => {
    event.preventDefault()
    try{
      // Attempts to register the new user to the api
      const {name, username, password} = event.target
      const userData = await userService.register({
        name: name.value,
        username: username.value,
        password: password.value
      })
      notify('User added', userData.username)
      setIsRegistering(false)
    } catch (err){
      notify('Registration failed', err.response.data.error)
    }
  }
  return (
    <div className="registrationDiv">
      <form onSubmit={handleRegistration}>
        <label htmlFor="name">Name</label>
        <input id="name" name='name' required={true}></input>
        <label htmlFor="username">Username</label>
        <input id="username" name='username' required={true}></input>
        <label htmlFor="password">Password</label>
        <input id="password" name='password' type='password' required={true}></input>
        <button type='submit'>Register</button>
        <button type="button" onClick={() => {
          setIsRegistering(false)
        }}>Go To Login</button>
      </form>
    </div>
  )
}

export default UserRegistration