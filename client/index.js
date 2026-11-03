'use strict';

const canvas = document.getElementById('plane');
const context = canvas.getContext('2d');

let points = [];

const space = 15;
const arrowWidth = 7;
const arrowHeight = 10;
const rCoeff = (canvas.width / 2 - 2 * space) / 3;

context.lineWidth = 1.5;
context.font = '15px Arial';

context.translate(canvas.width / 2, canvas.height / 2);


function draw() {
    drawPlane();
}

function drawPlane() {
    context.fillStyle = '#000';
    context.strokeStyle = '#000';

    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width / 2, canvas.height / 2);

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
}

function drawFigures(rList) {}

function drawPoints() {}

function drawPoint() {}

function drawTable() {}

function loadHistory() {}

function submit() {}

function checkX() {}

function checkR() {}

function validNumbers(x, y, r) {}


loadHistory();
drawTable();
draw()