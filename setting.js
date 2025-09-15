let language = localStorage.getItem("language") || "en";
let code = localStorage.getItem("code") || "";

const languageSelect = document.getElementById("language");
const codeInput = document.getElementById("code");
const checkBtn = document.getElementById("checkCode");
const codeResult = document.getElementById("codeResult");

if(languageSelect) languageSelect.value = language;

if(languageSelect){
    languageSelect.addEventListener("change", (e)=>{
        language = e.target.value;
        localStorage.setItem("language", language);
        alert("Language set to " + language);
    });
}

if(checkBtn){
    checkBtn.addEventListener("click", ()=>{
        code = codeInput.value;
        localStorage.setItem("code", code);

        if(code === "42"){
            codeResult.textContent = "Hello World";
        } else if(code.toLowerCase() === "love"){
            codeResult.textContent = "Y + A = ❤️";
        } else {
            codeResult.textContent = "Invalid code";
        }
    });
}