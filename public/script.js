const noteTextArea = document.getElementById('note');
const panelMessage = document.getElementById('panel-message');
const charCount = document.getElementById('char-count');
const lineCount = document.getElementById('line-count');
const wordCount = document.getElementById('word-count');
const saveButton = document.getElementById("save-btn");
const loginButton = document.getElementById("login-btn");
const overlay = document.getElementById("login-overlay");
//const loginForm = document.querySelector(".login-page form");


let saveTimeoutId;

// Load note from localStorage on page load
window.addEventListener('online', () => {
  const savedNote = localStorage.getItem('note');
  if (savedNote){
    fetch('/login',{
      method : 'POST',
      body : JSON.stringify({savedNote}),
      headers:{
        'Content-Type ': 'application/json'
      }
    }).then(()=>{
      localStorage.removeItem("savedNote")
    })
  }

});


// Listen for input events on the textarea
noteTextArea.addEventListener("input", function() {
  const currentLength = this.value.length;

  // Check if the current length is greater than or equal to 1000
  if (currentLength >= 1000) {
    alert("You have reached the limit of 1000 characters. Saving to the cloud would be beneficial. Storage is free as of now.");
  }
});

loginButton.addEventListener("click", function() {
  window.location.href = "/login";
});
// Autosave note to localStorage after 500ms of not typing
noteTextArea.addEventListener('input', () => {
  clearTimeout(saveTimeoutId);
  saveTimeoutId = setTimeout(() => {
    const note = noteTextArea.value;
    localStorage.setItem('note', note);
    displayPanelMessage('Note saved.');
  }, 500);
});

// Function to display a message on the panel
function displayPanelMessage(message) {
  panelMessage.innerText = message;
  setTimeout(() => {
    panelMessage.innerText = '';
  }, 2000);
}
note.addEventListener('input', function() {
  const text = note.value;

  // Count number of characters
  const numChars = text.length;
  charCount.innerText = numChars;

  // Count number of lines
  const numLines = text.split('\n').length;
  lineCount.innerText = numLines;

  // Count number of words
  const numWords = text.match(/\b\w+\b/g);
  wordCount.innerText = numWords ? numWords.length : 0;
});

const termsLink = document.createElement('a');
termsLink.href = 'http://localhost:8000/termsofuse';
termsLink.innerText = 'Terms of Use';
termsLink.style.position = 'fixed';
termsLink.style.right = 0;
document.body.appendChild(termsLink);

const privacyLink = document.createElement('a');
privacyLink.href = 'http://localhost:8000/privacypolicy';
privacyLink.innerText = 'Privacy Policy';
privacyLink.style.position ="fixed";
privacyLink.style.right = 10;
document.body.appendChild(privacyLink);

function showLogin() {
  const loginForm = document.getElementById('login-form');
  loginForm.style.display = 'block';
}

function redirectToSignUp(){
  window.location.href = "http://localhost:8000/signup"
}

function redirectToForgotPassword(){
  window.location.href = "http://localhost:8000/forgot_password"
}


function isValidEmail(email) {
  // Regular expression for validating email
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
}



const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevents the form from submitting and reloading the page

  // Get the email and password input fields' values
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validate the user's credentials here (e.g., by sending a POST request to a backend server)

  // If the user's credentials are valid, redirect them to the dashboard page
  window.location.href = "/http://localhost:8000/note";

  // If the user's credentials are invalid, display an error message
  const errorMessage = document.createElement("p");
  errorMessage.textContent = "Invalid email or password";
  loginForm.appendChild(errorMessage);
});
