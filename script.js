const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginToggle = document.querySelector("label.login");
const signupToggle = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
const signupBtn = document.querySelector("#signUpButton");
const loginBtn = document.querySelector("#loginButton");

let hostname = location.hostname;
let port = location.port;

//to change the toggle screen from login to signUp
signupToggle.onclick = () => {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
};
loginToggle.onclick = () => {
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
};
signupLink.onclick = () => {
  signupToggle.click();
  return false;
};

//post user data - signUp
signupBtn.onclick = () => {
  const username = document.getElementById("signup-user").value;
  const password = document.getElementById("signup-pass").value;
  const postuser = new Promise((resolve, reject) => {
    fetch(`http://${hostname}:${port}/post-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.id === "username") {
          document.getElementById("username-exists").innerHTML = data.msg;
          document.getElementById("user-added").innerHTML = "";
        }
        if (data.id === "password") {
          document.getElementById("username-exists").innerHTML = "";
          document.getElementById("pass-invalid").innerHTML = data.msg;
        }
        if (data.id === "success") {
          document.getElementById("user-added").innerHTML = data.msg;
          document.getElementById("pass-invalid").innerHTML = "";
          document.getElementById("username-exists").innerHTML = "";
          //this logic is added for storing username
          window.sessionStorage.setItem("currentloggedin", data.username);
          window.location.href = "shopping.html";
        }
        resolve(data);
      });
  });
  return postuser;
};

//get user data - login
loginBtn.onclick = async (e) => {
  const username = document.getElementById("login-user").value;
  const password = document.getElementById("login-pass").value;
  e.preventDefault();
  await fetch(`http://${hostname}:${port}/get-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.id === "user-wrong") {
        document.getElementById("login-success").innerHTML = data.msg;
      }
      if (data.id === "pass-wrong") {
        document.getElementById("login-success").innerHTML = data.msg;
      }
      if (data.id === "success") {
        document.getElementById("login-success").style.color = "green";
        document.getElementById("login-success").innerHTML = data.msg;

        //this logic is added for storing username
        window.sessionStorage.setItem("currentloggedin", data.username);
        window.location.href = "shopping.html";
      }
      //resolve(data);
    });
};

//end of login and signUp
