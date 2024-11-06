const Notification = ({ notification }) => {
  if (notification) {
    return (
      <div className="notification">
        <span id="notificationType">{notification.type}</span>
        <span id="notificationMessage">{notification.message}</span>
      </div>
    )
  }
  return (
    <></>
  )
}

export default Notification