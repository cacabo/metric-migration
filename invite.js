// Sadly this didn't work...the input was listening for some other event
// before registering that a valid email was entered...

const emails = ['test1@camcabo.com', 'test2@camcabo.com']

const invitePeopleBtn = document.querySelector(
  '#ember5 > div > main > section > header > section > button',
)

const getEmailInput = () =>
  new Promise((resolve, reject) => {
    const emailInput = document.querySelector('#new-user-email')
    if (!emailInput) {
      invitePeopleBtn.click()
      setTimeout(() => {
        return resolve(document.querySelector('#new-user-email'))
      }, 200)
    } else {
      return resolve(emailInput)
    }
  })

const clickSendInvite = () =>
  document.querySelector('div.modal-footer > button').click()

emails.forEach((email) => {
  getEmailInput().then((emailInput) => {
    emailInput.value = email
    clickSendInvite()
  })
})
