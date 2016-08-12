'use strict'

const addNicknameButton = document.getElementById('addNicknameButton')
const editNicknameButton = document.getElementById('editNicknameButton')
const removeNicknameButton = document.getElementById('removeNicknameButton')

const addNicknameDialogTemplate = document.getElementById('addNicknameDialogTemplate')
const addNicknameCheckTemplate = document.getElementById('addNicknameCheckTemplate')
const addNicknameAuthTemplate = document.getElementById('addNicknameAuthTemplate')
const registerNicknameAuthTemplate = document.getElementById('registerNicknameAuthTemplate')
// const editNicknameDialogTemplate = document.getElementById('editNicknameDialogTemplate')
// const removeNicknameDialogTemplate = document.getElementById('removeNicknameDialogTemplate')

class Profile {
  constructor () {
    addNicknameButton.addEventListener('click', this.showAddNicknameDialog.bind(this), false)
    removeNicknameButton.addEventListener('click', this.toggleRemoveNicknameMode.bind(this), false)
  }

  showAddNicknameDialog () {
    new NicknameDialog()
  }

  toggleEditNicknameMode () {

  }

  toggleRemoveNicknameMode () {

  }
}

class NicknameDialog {
  constructor () {
    let dialog = addNicknameDialogTemplate.content.cloneNode(true)
    document.body.appendChild(dialog)
    this.dialog = document.getElementById('addNicknameDialog')
    this.dialogFooter = this.dialog.querySelector('.modal-footer')

    this.addButton = this.dialog.querySelector('#modalAddNicknameButton')
    this.addButton.addEventListener('click', this.addNicknameButtonClicked.bind(this), false)

    let initialPage = addNicknameCheckTemplate.content.cloneNode(true)
    this.setContents(initialPage)

    jQuery('#addNicknameDialog').modal('show')


  }

  addNicknameButtonClicked () {
    let nicknameField = this.dialog.querySelector('#modalAddNicknameField')

    let request = new XMLHttpRequest()
    request.open('GET', '/nicknames/' + nicknameField.value, true)
    request.onload = () => {
      try {
        this.nickname = nicknameField.value
        let response = JSON.parse(request.responseText)

        console.log(response.data)
        if (response.data && response.data !== {}) {
          let authPage = addNicknameAuthTemplate.content.cloneNode(true)

          this.setContents(authPage)
          this.dialogFooter.removeChild(this.addButton)

          let authButton = document.createElement('button')
          authButton.setAttribute('type', 'button')
          authButton.className = 'btn btn-primary'
          authButton.id = 'connectNicknameAuthButton'
          authButton.textContent = 'Authenticate'
          this.dialogFooter.appendChild(authButton)

          authButton.addEventListener('click', this.authNicknameButtonClicked.bind(this), false)
        } else {
          let registerPage = registerNicknameAuthTemplate.content.cloneNode(true)

          this.setContents(registerPage)
          this.dialogFooter.removeChild(this.addButton)

          let registerButton = document.createElement('button')
          registerButton.setAttribute('type', 'button')
          registerButton.className = 'btn btn-primary'
          registerButton.id = 'registerNicknameAuthButton'
          registerButton.textContent = 'Register'
          this.dialogFooter.appendChild(registerButton)

          registerButton.addEventListener('click', this.registerNicknameButtonClicked.bind(this), false)
        }
      } catch (err) {

      }
    }

    request.onerror = (error) => {
      console.log(error)
    }

    request.send()
  }

  authNicknameButtonClicked () {
    let passwordField = this.dialog.querySelector('#connectNicknamePasswordField')

    let request = new XMLHttpRequest()
    request.open('PUT', '/nicknames/', true)
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.onload = () => {
      document.location.reload()
    }

    request.onerror = () => {
      console.log(request.responseText)

    }

    request.send(JSON.stringify({
      nickname: this.nickname,
      password: passwordField.value
    }))
  }

  registerNicknameButtonClicked () {
    let passwordField = this.dialog.querySelector('#registerNicknamePasswordField')

    let request = new XMLHttpRequest()
    request.open('POST', '/nicknames/', true)
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.onload = () => {
      
    }

    request.onerror = () => {
      console.log(request.responseText)

    }

    request.send(JSON.stringify({
      nickname: this.nickname,
      password: passwordField.value
    }))
  }

  setContents (contents) {
    let dialogBody = this.dialog.querySelector('.modal-body')
    clearContentsOfNode(dialogBody)
    dialogBody.appendChild(contents)
  }
}

function clearContentsOfNode (node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

new Profile()