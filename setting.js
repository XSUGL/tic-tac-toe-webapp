// Язык и код
let language = localStorage.getItem("language") || "en";
let code = localStorage.getItem("code") || "";

const languageSelect = document.getElementById("language");
const codeInput = document.getElementById("code");
const checkBtn = document.getElementById("checkCode");
const boardEl = document.getElementById("board");
const titleEl = document.getElementById("title");

// Инициализация значения
languageSelect.value = language;

// Смена языка
languageSelect.addEventListener("change", (e)=>{
    language = e.target.value;
    localStorage.setItem("language", language);
    alert("Language set to " + language);
});

// Проверка кода
checkBtn.addEventListener("click", ()=>{
    code = codeInput.value;
    localStorage.setItem("code", code);

    if(code === "SECRET123"){
        alert("Code accepted!");
    } else if(code === "42"){
        // Вывод Hello World на весь сайт
        document.body.innerHTML = "<h1 style='font-size:5em; text-align:center; margin-top:20%;'>Hello World</h1>";
    } else if(code.toLowerCase() === "love"){
        // Вывод Y + A = сердечко
        document.body.innerHTML = "<h1 style='font-size:4em; text-align:center; margin-top:20%;'>Y + A = ❤️</h1>";
    } else {
        alert("Invalid code");
    }
});