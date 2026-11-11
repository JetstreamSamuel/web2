'use strict';

const canvas = document.getElementById('plane');
const context = canvas.getContext('2d');
const form = document.getElementById('form');
const submitButton = document.getElementById('submit_button');
const clearButton = document.getElementById('clear_button');
const yInput = document.getElementById('yInput');

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
const rCoeff = (canvas.width / 2 - 2.5 * space) / 3;

context.lineWidth = 1.5;
context.font = '15px Arial';

context.translate(canvas.width / 2, canvas.height / 2);

function draw() {
    const rList = Array.from(document.querySelectorAll('input[name="R"]:checked'),
            checkbox => {return Number(checkbox.value)});

    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    drawPlane(rList[rList.length - 1] || 0);
    drawFigures(rList);
    drawText(rList[rList.length - 1] || 0);
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

function drawPoints() {}

function drawPoint() {}

function drawTable() {}

function loadHistory() {}

function submit() {}

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

function checkForm() {
    submitButton.disabled = !validY();
}

function checkClear() {
    clearButton.disabled = points.length < 1;
}

form.addEventListener('submit', event => {
    event.preventDefault();
});
document.querySelectorAll('input[name="R"]').forEach(element => {
    element.addEventListener('change', draw)});

yInput.addEventListener('input', validY);
yInput.addEventListener('change', () => {if (!validY()) yInput.reportValidity();});

submitButton.addEventListener('click', submit);

loadHistory();
drawTable();
draw()