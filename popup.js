const formSubmit = document.getElementById("loginForm");
const setUsername = document.querySelector('[name="email"]');
const setUserName = document.querySelector(".email");

const logoutBtn = document.querySelector(".logout");
const counterBtn = document.querySelector(".addCounter");
const login = document.querySelector(".login");
const loggedIn = document.querySelector(".logged-in");

const errUsername = document.querySelector(".invalid-feedback.email");
const errPass = document.querySelector(".invalid-feedback.password");

const loginApi = async function (url, formData) {
  const res = await fetch(url, {
    method: "post",    
    body: formData,
  });
  const data = await res.json();
  return data;
};

// Get data in storage
chrome.storage.local.get(function (result) {
  console.log("🚀 ~ file: popup.js ~ line 42 ~ result", result)
  if (result.email) {
    setUsername.value = result.email;
  }
  if (result.token) {
    login.classList.add("d-none");
    loggedIn.classList.add("d-block");
    // setUserName.innerHTML += result.user.name;
  } else {
    return;
  }
});
setUsername.addEventListener("change", function () {
  console.log(this.value);
  chrome.storage.local.set({ email: this.value }, function () {});
});

// Form Login
formSubmit.addEventListener("submit", function (e) {
  e.preventDefault();

  const url = "https://nhattruyen.one/api-login";
  const formData = new FormData(e.target);
  //const data = {};
  //formData.forEach((value, key) => (data[key] = value));

  loginApi(url, formData)
    .then(function (resData) {
      // Login isvalid
      const errorList = resData.error;
      if (errorList) {
        if (errorList["email"]) {
          errUsername.innerHTML += errorList["email"][0];
          errUsername.classList.add("d-block");

          errUsername.addEventListener("focus", function () {
            errUsername.classList.remove("d-block");
          });
        }
        if (errorList["password"]) {
          errPass.innerHTML += errorList["password"][0];
          errPass.classList.add("d-block");

          errPass.addEventListener("focus", function () {
            errUsername.classList.remove("d-block");
          });
        }
      }
      console.log('resData',resData);
      // Login success
      if (resData.success!="") {
        chrome.storage.local.set(
          { token: resData.token },
          function () {
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
              var activeTab = tabs[0];
              chrome.tabs.sendMessage(activeTab.id, {type:'RELOAD_MAIN_PAGE'});
            });
            window.location.reload();
          }
        );
      }
    })
    .catch(function (err) {
      console.log("Fetch Error :-S", err);
    });
});

// Form Logout
logoutBtn.addEventListener("click", function (e) {
  e.preventDefault();
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {type:'RELOAD_MAIN_PAGE'});
  });
  chrome.storage.local.set({email:'',token:null},function(){});
  window.location.reload();
});
 