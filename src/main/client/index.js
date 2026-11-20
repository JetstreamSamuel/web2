'use strict';

const canvas = document.getElementById('plane');
const context = canvas.getContext('2d');
const form = document.getElementById('form');
const submitButton = document.getElementById('submit_button');
const clearButton = document.getElementById('clear_button');
const yInput = document.getElementById('yInput');
const message = document.getElementById('message');
const table = document.getElementById('results');
const serverUrl = 'fcgi-bin/app'

const fillMap = {
    1.0 : 'rgba(180, 140, 255, 0.4)',
    1.5 : 'rgba(0, 255, 255, 0.4)',
    2.0 : 'rgba(255, 192, 203, 0.4)',
    2.5 : 'rgba(144, 238, 180, 0.4)',
    3.0 : 'rgba(255, 255, 0, 0.4)'
}
const strokeMap = {
    1.0 : 'rgba(180, 140, 255, 1)',
    1.5 : 'rgba(0, 255, 255, 1)',
    2.0 : 'rgba(255, 192, 203, 1)',
    2.5 : 'rgba(144, 238, 180, 1)',
    3.0 : 'rgba(255, 255, 0, 1)'
}
let points = [];

const space = 15;
const textSpace = 10;
const arrowWidth = 7;
const arrowHeight = 10;
const rCoeff = (canvas.width / 2 - 2.5 * space) / 4;
const pointRadius = 4;

context.lineWidth = 1.5;
context.font = '15px Arial';

context.translate(canvas.width / 2, canvas.height / 2);

function validNumbers(xList, y, rList) {
    for (const x of xList) {
        if (![-4, -3, -2, -1, 0, 1, 2, 3, 4].contains(x)) {
            return false;
        }
    }
    if(!Number.isFinite(y) || y <= -3 || y>= 3){
        return false;
    }
    for (const r of rList) {
        if (![1, 1.5, 2, 2.5, 3].contains(r)) {
            return false;
        }
    }
    return true;

}

function draw() {
    const rList = Array.from(document.querySelectorAll('input[name="R"]:checked'),
            checkbox => {return Number(checkbox.value)});

    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    drawPlane(rList[rList.length - 1] || 0);
    drawFigures(rList);
    drawText(rList[rList.length - 1] || 0);
    drawPoints(rList);
    drawTable();
}

function drawPlane(r) {
    context.fillStyle = '#000';
    context.strokeStyle = '#000';
    context.globalCompositeOperation = 'source-over';
    context.lineWidth = 1.5;

    context.beginPath();
    context.moveTo(-canvas.width / 2 + space, 0);
    context.lineTo(canvas.width / 2 - space, 0);
    context.moveTo(canvas.width / 2 - space + 1, 0);
    context.lineTo(canvas.width / 2 - space + 1 -arrowHeight, -arrowWidth);
    context.moveTo(canvas.width / 2 - space + 1, 0);
    context.lineTo(canvas.width / 2 - space + 1 - arrowHeight, arrowWidth);
    context.stroke();

    context.beginPath();
    context.moveTo(0, canvas.height / 2 - space);
    context.lineTo(0, -canvas.height / 2 + space);
    context.moveTo(0, -canvas.height / 2 + space - 1);
    context.lineTo(-arrowWidth, -canvas.height / 2 + space - 1 + arrowHeight);
    context.moveTo(0, -canvas.height / 2 + space - 1);
    context.lineTo(arrowWidth, -canvas.height / 2 + space - 1 + arrowHeight);
    context.stroke();

    context.fillText('X', canvas.width / 2 - space - arrowHeight, -textSpace);
    context.fillText('Y', textSpace, -canvas.width / 2 + space + arrowHeight);

    if (r !== 0) {
        for (const char of [-r, -r/2, r/2, r]) {
            context.beginPath();
            context.moveTo(char * rCoeff, textSpace/2);
            context.lineTo(char * rCoeff, -textSpace/2);
            context.stroke();

            context.beginPath();
            context.moveTo(-textSpace/2, -char * rCoeff);
            context.lineTo(textSpace/2, -char * rCoeff);
            context.stroke();

        }
    }
}

function drawFigures(rList) {
    context.globalCompositeOperation = 'destination-over';
    context.lineWidth = 2.5;
    for (const r of rList) {
        context.fillStyle = fillMap[r];
        context.strokeStyle = strokeMap[r];

        context.fillRect(0, -r / 2 * rCoeff, r * rCoeff, r / 2 * rCoeff);
        context.beginPath();
        context.moveTo(0, -r/2 * rCoeff);
        context.lineTo(r * rCoeff, -r/2 * rCoeff);
        context.lineTo(r * rCoeff, 0);
        context.stroke();

        context.beginPath();
        context.moveTo(-r * rCoeff, 0);
        context.lineTo(0, r/2 * rCoeff);
        context.stroke();

        context.beginPath();
        context.lineTo(0, r / 2 * rCoeff);
        context.lineTo(-r * rCoeff, 0);
        context.lineTo(0, 0)
        context.fill();


        context.beginPath();
        context.arc(0, 0, r/2 * rCoeff, 0, Math.PI / 2, false);
        context.lineTo(0, 0);
        context.fill();
        context.stroke();
    }
}

function drawText(r) {
    if (r !== 0) {
        context.fillStyle = '#000';
        for (const char of [-r, -r/2, r/2, r]) {
            context.fillText(char, char * rCoeff, -textSpace);
            context.fillText(char, textSpace, -char * rCoeff);
        }
    }
}

function drawPoints(rList) {
    for (const point of points) {
        if (rList.includes(point.r)) {
            drawPoint(point);
        }
    }
}

function drawPoint(point) {
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = point.hit ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)";
    context.beginPath();
    context.arc(point.x * rCoeff, -point.y * rCoeff, pointRadius, 0, 2 * Math.PI);
    context.fill();
}

function drawTable() {
    table.textContent = '';

    for (const point of points) {
        const row = table.insertRow();
        row.insertCell().textContent = point.x;
        row.insertCell().textContent = point.y;
        row.insertCell().textContent = point.r;
        row.insertCell().textContent = point.hit ? "Попадание" : "Промах";
        const time = document.createElement('time');
        time.dateTime = point.time;
        time.textContent = new Date(point.time).toLocaleString('ru-RU');
        row.insertCell().append(time);
        row.insertCell().textContent = point.workTime;
    }
    updateDate();
}

function updateDate(){
    for(const time of document.querySelectorAll('time')){
        time.textContent = new Date(time.dateTime).toLocaleString('ru-Ru');
    }
}

async function clear(){
    if(!confirm('Очистить историю?')) return;
    try{
        await request(new URLSearchParams({clear:"true"}))
        message.textContent = 'История очищена';
    } catch{
        message.textContent = 'Браузер не разрешил очистить историю';
    }
}

async function request(params = null) {
    const options = {
        method: params === null ? 'GET' : 'POST'
    };

    if (params !== null) {
        options.body = params;
    }

    const response = await fetch(form.action, options);

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error('Сервер вернул некорректный JSON');
    }

    if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Ошибка сервера');
    }

    points = data.history;

    drawTable();
    draw();

    return data;
}

async function submit(event) {
    event.preventDefault();

    if (submitButton.disabled) return;

    validY();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const params = new URLSearchParams();

    formData.forEach((value, name) => {
        if (typeof value === 'string') {
            params.append(name, value);
        }
    });

    if (!params.has('X')) {
        message.textContent = 'Выберите хотя бы одно значение X';
        return;
    }

    if (!params.has('R')) {
        message.textContent = 'Выберите хотя бы одно значение R';
        return;
    }

    submitButton.disabled = true;
    clearButton.disabled = true;
    message.textContent = 'Проверяем точки…';

    try {
        const data = await request(params);
        const hits = data.current.filter(point => point.hit).length;

        message.textContent = `Попаданий: ${hits} из ${data.current.length}`;
    } catch (error) {
        message.textContent = error.message;
    } finally {
        submitButton.disabled = false;
        clearButton.disabled = points.length === 0;
    }
}

function validY() {
    const text_Y = yInput.value.replaceAll(",", ".");
    const Y = Number(text_Y);
    if (-3 <= Y && Y <= 3 && !(text_Y === '')) {
        yInput.setCustomValidity("");
        return true;
    }
    yInput.setCustomValidity("Введите число строго между -3 и 3");
    return false;
}

request().catch(e => {
    message.textContent = e.message;
})


form.addEventListener('submit', event => {
    event.preventDefault();
});

document.querySelectorAll('input[name="R"]').forEach(element => {
    element.addEventListener('change', draw)});

yInput.addEventListener('input', validY);
yInput.addEventListener('change', () => {if (!validY()) yInput.reportValidity();});

submitButton.addEventListener('click', submit);
clearButton.addEventListener('click', clear);

draw()