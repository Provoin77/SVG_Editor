// получаем и записываем элементы в переменные
const SvgEditor = document.getElementById('editor');      
const ResizeEditor = document.getElementById('razmer');
const SvgCanvass = document.getElementById('svgCanvas');


let Resing = false; // флаг для отслеживания происходит ли изменение чтобы не срабатывало везде где не надо :)
let StartXResize, StartYResize, StartWidth, StartHeight, StartWidthSvg, StartHeightSvg; // Глобальные переменные для изменения размера самого редактора

ResizeEditor.addEventListener('mousedown', function(event){ // event - объект события, для отслеживания изменений 
    Resing = true; // флаг для отслеживания происходит ли изменение 
    StartXResize = event.clientX; // Начальные координаты мыши по x, берём относительно окна 
    StartYResize = event.clientY; // Начальные Координаты мыши по y, берём относительно окна

    StartWidthSvg = parseInt(getComputedStyle(SvgCanvass).width, 10); // Начальная ширина для самого свг блока
    StartHeightSvg = parseInt(getComputedStyle(SvgCanvass).height, 10); // Начальная высота для самого свг блока

    StartWidth = parseInt(getComputedStyle(SvgEditor).width, 10); // Начальная ширина редактора в десятичном виде
    StartHeight = parseInt(getComputedStyle(SvgEditor).height, 10); // Начальная высота редактора в десятичном виде
    event.preventDefault(); //Предотвращение выделения текста 
});


document.addEventListener('mousemove', function(event){ 
    if (Resing){
        const newWidth = StartWidth + event.clientX - StartXResize; // Новая ширина редактора. Стартовая ширина + координаты мыши, но при этом минусуем начальные координаты ибо, 
        //будет что ширина увеличиться сразу например на 200, а не начнет с нуля
        const newHeight = StartHeight + event.clientY - StartYResize; // Новая высота редактора

        const newWidthSvg = StartWidthSvg + event.clientX-StartXResize; // Новая ширина для свг блока
        const newHeightSvg = StartHeightSvg + event.clientY-StartYResize; // Новая высота для свг блока
        SvgEditor.style.width = newWidth + 'px'; // Меняем ширину у редактора через стили 
        SvgEditor.style.height = newHeight + 'px'; // Меняем высоту у редактора через стили
        SvgCanvass.style.width = newWidthSvg + 'px'; // Смена ширины у свг блока
        SvgCanvass.style.height = newHeightSvg + 'px'; // Смена высоты у свг блока
    }
    generateSvgCode();
});

document.addEventListener('mouseup', function(){
    Resing = false;  // Ставим флаг на фолс, чтобы не срабатывало везде где не надо :)
});


// Функция двойного клика для увеличения масштаба редактора 
ResizeEditor.addEventListener('dblclick', mashtab); // Событие на двойной клик по иконке для размера
function mashtab() {
    // извлекаем значения у стилей редактора и преобразовываем в целочисленный тип 
    // извлекаем конкретно стили в css, а не инлайновые стили через 'style'
    let maxw = parseInt(getComputedStyle(SvgEditor).getPropertyValue('max-width'), 10); // извлекаем максимальную ширину стилей у самого редактора
    let minw = parseInt(getComputedStyle(SvgEditor).getPropertyValue('min-width'), 10); // извлекаем минимальную ширину стилей у самого редактора
    let maxh = parseInt(getComputedStyle(SvgEditor).getPropertyValue('max-height'), 10); 
    let minh = parseInt(getComputedStyle(SvgEditor).getPropertyValue('min-height'), 10);
    
    let currentWidth = parseInt(getComputedStyle(SvgEditor).getPropertyValue('width'), 10); // извлекаем текущею ширину стилей у самого редактора
    let currentHeight = parseInt(getComputedStyle(SvgEditor).getPropertyValue('height'), 10); 

    if (currentWidth <= (maxw + minw) / 2 || currentHeight <= (maxh + minh) / 2) { // Если (max-width + min-width)/2 или тоже самое с высотой больше
        // чем размер в стилях, то увеличиваем до 100% размер редактора и свг блока

        // Увеличиваем до максимальных значений
        SvgEditor.style.width = maxw + 'px'; // меняем ширину у самого редактора на максимум
        SvgEditor.style.height = maxh + 'px';
        SvgCanvass.style.width = maxw + 'px'; // меняем ширину у свг блока на максимум 
        SvgCanvass.style.height = maxh + 'px';
        
    } else { // иначе (или если (max-width + min-width)/2 меньше чем размер в стилях), то уменьшаем до 1% размер редактора и свг блока

        // Уменьшаем до минимальных значений
        SvgEditor.style.width = minw + 'px'; 
        SvgEditor.style.height = minh + 'px'; // меняем высоту у самого редактора на минимум
        SvgCanvass.style.width = minw + 'px';
        SvgCanvass.style.height = minh + 'px'; // меняем высоту у свг блока на минимум
    }
    updateSvgHeaderFooter();
}

const startButton = document.getElementById('startfigure'); // записываем кнопку в переменную 
let flagFigure = false; // флаг для старта/конца создания фигуры
let indexPoin = 1;  // Индекс для точек
let indexPoly = 1; // Индекс для полигонов 
let massivePoints = []; // Массив для точек
let massivePolygons = []; // Массив для полигонов 


startButton.addEventListener('click', startFigure); // создаем событие на клик по кнопке и вызываем функцию 
function startFigure(){ // Функция пока что для смены названия у кнопки и редактирования флажка создания фигуры 

    if (!flagFigure) { // если флаг false - то есть фигура ещё не создается, то после нажатия на кнопку, фигура создается 
        flagFigure = true; // флаг в true 
        startButton.textContent = 'Завершить создание полигона'; // меняем текст на кнопке, показывая что новая фигура создается 
        showNotification('Создание полигона началось.', 'info');

    }
    else { // иначе (при повторном нажатии на кнопку) 
        flagFigure = false; // флаг в false
        startButton.textContent = 'Начать создание полигона'; // меняем текст на кнопке, показывая что новая фигура не создается 
        indexPoly ++; // Увеличиваем индекс полигона на 1, так как создание фигуры - полигона завершено
        showNotification('Полигон успешно создан.', 'success');
    
    }
}

SvgCanvass.addEventListener('click', function (event) {
    if (flagFigure) {
        createPoint(event); // создаем событие на клик по области Svg канваса (блока) и запускаем функцию создания точек
        generateSvgCode(); // Обновляем SVG-код
    }
});


function createPoint(event){ // Функция для создания точек
    if (flagFigure){ // Если фигура создается, то создаем и точки 

    let x = event.offsetX; // записываем в переменную текущее положение курсора по x в пикселях, берём координату относительно блока свг, а не всего окна
    let y = event.offsetY; // текущее положение курсора по y 

    const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); // созданиём круг через svg и записываем её в переменную 
    point.setAttribute('cx', x); // создаём встроенный атрибут cx и задаём для неё координаты, как координаты курсора по x
    point.setAttribute('cy', y); // создаём встроенный атрибут cy и задаём для неё координаты, как координаты курсора по y
    point.setAttribute('r', 5); // радиус для круга 
    point.setAttribute('fill', 'blue'); // цвет заливки и сама заливка 
    
    point.setAttribute('index-point', indexPoin); // создаём атрибут для круга с индексом точки
    point.setAttribute('index-polygon', indexPoly); // создаём атрибут для круга с индексом полигона - соответсвенно к какому полигону эта точка относится 


    massivePoints.push(point); // заносим полученную точку в массив 
    SvgCanvass.appendChild(point); // отображаем эту точку на блоке свг - создаем дочерний элемент в канвасе  

    createPolygon(); // запускаем функцию по созданию полигона

    indexPoin ++; // увеличиваем индекс точки на 1

    }
}


    // Функция создания полигона
function createPolygon() {
    let tekushiimassivtochek = massivePoints.filter(point => point.getAttribute('index-polygon') == indexPoly);

    if (tekushiimassivtochek.length >= 1) {
        let existingPolygon = massivePolygons.find(polygon => polygon.getAttribute('index-polygon') == indexPoly);

        let points = '';
        tekushiimassivtochek.forEach((point) => {
            const x = point.getAttribute('cx');
            const y = point.getAttribute('cy');
            points += `${x},${y} `;
        });

        if (existingPolygon) {
            existingPolygon.setAttribute('points', points.trim());
        } else {
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', points.trim());
            polygon.setAttribute('fill', currentFillColor);
            polygon.setAttribute('stroke', currentStrokeColor);
            polygon.setAttribute('stroke-width', currentStrokeWidth);
            polygon.setAttribute('index-polygon', indexPoly);
            polygon.classList.add('polygon-glow');

            polygon.addEventListener('click', function (event) {
                if (flagRedactorFigure) {
                    activePolygon = event.target;
                    fillColorInput.value = activePolygon.getAttribute('fill');
                    strokeColorInput.value = activePolygon.getAttribute('stroke');
                    strokeWidthInput.value = activePolygon.getAttribute('stroke-width');
                }
            });

            massivePolygons.push(polygon);
            SvgCanvass.appendChild(polygon);
        }
    }
}


let activePoint = null; 


SvgCanvass.addEventListener('mousedown', function(event){
    const target = event.target;
    

    if (target.hasAttribute('index-point')){
        activePoint = target;
        SvgCanvass.addEventListener('mousemove', movePoints);
        
    }
});

function movePoints(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    

    const indexcurrentpoint = activePoint.getAttribute('index-point');
    const indexcurrentpolygon = activePoint.getAttribute('index-polygon');

    activePoint.setAttribute('cx', x);
    activePoint.setAttribute('cy', y);

    const currentpolygon = massivePolygons.find(polygon => polygon.getAttribute('index-polygon') == indexcurrentpolygon);

    updatePolygon(currentpolygon, indexcurrentpolygon);
    generateSvgCode();

}

function updatePolygon(polygon, polygonIndex){

    let relatedPoints = massivePoints.filter(point => point.getAttribute('index-polygon') == polygonIndex);

    let strokapoints = relatedPoints.map(point =>  {
        const cx = point.getAttribute('cx');
        const cy = point.getAttribute('cy');
        return `${cx},${cy}`;
    }).join(' ');

    polygon.setAttribute('points', strokapoints);
}


SvgCanvass.addEventListener('mouseup', function(){
    SvgCanvass.removeEventListener('mousemove', movePoints);
    activePoint = null;

});


let buttonfullclear = document.getElementById('ohistka');
let buttonclearlastpoint = document.getElementById('deletelasttochku');
let buttonclearlastpolygon = document.getElementById('deletelastpolygon');
let buttonredactorpolygon = document.getElementById('redactorpolygonn');
let flagRedactorFigure = false; 
let activePolygon = null;

buttonredactorpolygon.addEventListener('click', function(){
    if (!flagRedactorFigure){
        flagRedactorFigure = true;
        SvgCanvass.addEventListener('click', redactorpolygon); // либо же добавить в функцию redactorpolygon просто или через флаг, если флаг true, то выполняем событие
        // если false, то удаляем событие на клик
        isPolygonSelected = false;
        activePolygon = null;
        showNotification('Редактирование началось. Выберите полигон для продолжения.', 'info');
        buttonredactorpolygon.textContent = 'Завершить редактирование полигонов';  
    } 
    else {
        flagRedactorFigure = false;
        SvgCanvass.removeEventListener('click', redactorpolygon);
        isPolygonSelected = false;
        activePolygon = null;
        showNotification('Редактирование завершено.', 'success');
        buttonredactorpolygon.textContent = 'Редактировать полигоны'
    }
    
});

let isPolygonSelected = false; // Флаг для отслеживания выбора полигона
let addingPointsEnabled = false; // Флаг для отслеживания возможности добавления точек

function redactorpolygon(event) {
    if (flagRedactorFigure) {
        if (!isPolygonSelected) { 
            // Первый клик: выбираем полигон
            activePolygon = event.target; 
            isPolygonSelected = true; // Отмечаем, что полигон выбран
            addingPointsEnabled = false; // Блокируем добавление точек при первом клике
            showNotification('Полигон успешно выбран. Вы можете начинать его редактирование.', 'success');
            //showNotification('Ошибка! Полигон не найден.', 'error');
        } else {
            // Если полигон уже выбран и добавление точек разрешено, добавляем точку
            if (addingPointsEnabled) {
                let x = event.offsetX;
                let y = event.offsetY;

                const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                point.setAttribute('cx', x);
                point.setAttribute('cy', y);
                point.setAttribute('r', 5);
                point.setAttribute('fill', 'blue');
                point.setAttribute('index-point', indexPoin);
                point.setAttribute('index-polygon', activePolygon.getAttribute('index-polygon'));

                massivePoints.push(point);
                SvgCanvass.appendChild(point);

                indexPoin++;

                // Обновляем полигон с новой точкой
                const polygonIndex = activePolygon.getAttribute('index-polygon');
                updatePolygon(activePolygon, polygonIndex);
            } else {
                // Второй клик: активируем добавление точек
                addingPointsEnabled = true;
                
            }
        }
    }

    generateSvgCode();
}

// Сброс флага выбора полигона при завершении редактирования
buttonredactorpolygon.addEventListener('click', function () {
    if (!flagRedactorFigure) {
        isPolygonSelected = false; // Сброс флага, чтобы при следующем редактировании выбирался новый полигон
    }
});

buttonfullclear.addEventListener('click', function(){
    indexPoin = 1;
    indexPoly = 1;
    SvgCanvass.innerHTML = '';
    massivePoints = [];
    massivePolygons = [];
    generateSvgCode();
});


buttonclearlastpoint.addEventListener('click', function(){

    if (flagFigure || flagRedactorFigure) {
        // Проверяем, что массив точек не пуст
        if (massivePoints.length === 0) return;

        // Получаем последнюю точку
        const lastPoint = massivePoints[massivePoints.length - 1];

        const polygonIndex = lastPoint.getAttribute('index-polygon');

        // Находим текущий полигон, к которому принадлежит последняя точка
        const currentPolygon = massivePolygons.find(polygon => polygon.getAttribute('index-polygon') == polygonIndex);

        // Проверяем, что текущий полигон существует и у него есть точки
        if (currentPolygon) {
            let pointsString = currentPolygon.getAttribute('points').trim().split(' ');

            // Удаляем последнию точку через преобразование атрибута points из строки в массив и обратно после удаления
            // Как вариант просто обратиться к функции updatePolygon
            // Удаляем последнюю точку, если в полигоне больше одной точки
            if (pointsString.length > 1) {
                pointsString.pop(); // Удаляем последнюю точку
                currentPolygon.setAttribute('points', pointsString.join(' '));

                // Удаляем последнюю точку из канваса
                SvgCanvass.removeChild(lastPoint);
                massivePoints.pop(); // Удаляем точку из массива massivePoints
                indexPoin --;
                //massivePolygons = massivePolygons.filter(polygon => polygon !== currentPolygon); // вариант удаления последнего полигона из массива 
            } 
        }
    }
    else{
        showNotification('Удаление последней точки возможно только при создании полигона или при его редактировании!', 'error');
    }
    generateSvgCode();
    
    
});


buttonclearlastpolygon.addEventListener('click', function(){
    if (massivePolygons.length > 0) {

    let lastpolygon = massivePolygons[massivePolygons.length - 1];
    const indexPolygonaa = lastpolygon.getAttribute('index-polygon');
    const kolvotochekypolygona = lastpolygon.getAttribute('points').trim().split(' ');

    const massivetochek = massivePoints.filter(point => point.getAttribute('index-polygon') == indexPolygonaa);
    
    for (i=0; i < kolvotochekypolygona.length; i++){
        SvgCanvass.removeChild(massivetochek[i]);
        massivePoints.pop();
        indexPoin --;

    }

    SvgCanvass.removeChild(lastpolygon);
    massivePolygons.pop();
    indexPoly-- ;
    }
    generateSvgCode();
})




let isUserEditingTextarea = false; // Флаг для отслеживания редактирования текстового поля

// Фиксированные части SVG-кода
const textarea = document.getElementById('svgCode');

// Фиксированные части SVG-кода
let svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="650">`;
let svgFooter = `</svg>`;
let defaultEmptyLines = 3; // Количество пустых строк для отступа

// Функция для генерации SVG-кода
// Функция для генерации SVG-кода
function generateSvgCode() {
    if (isUserEditingTextarea) return;

    let svgContent = '';
    for (let i = 0; i < massivePolygons.length; i++) {
        const polygon = massivePolygons[i];
        const points = polygon.getAttribute('points');
        const fill = polygon.getAttribute('fill');
        const stroke = polygon.getAttribute('stroke');
        const strokeWidth = polygon.getAttribute('stroke-width');
        svgContent += `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"></polygon>\n\n`;
    }

    svgContent = svgContent.trimEnd();
    const emptyLines = '\n'.repeat(defaultEmptyLines);
    textarea.value = `${svgHeader}\n${emptyLines}${svgContent}${emptyLines}${svgFooter}`;
}



// Обновление заголовка/окончания при изменении размеров канваса
function updateSvgHeaderFooter() {
    // Обновляем строку заголовка с актуальными размерами
    svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="${SvgCanvass.clientWidth}" height="${SvgCanvass.clientHeight}">`;
    generateSvgCode(); // Перегенерация кода
}

// Привязываем обновление заголовка к событиям изменения размеров
document.addEventListener('mouseup', () => {
    if (Resing) {
        updateSvgHeaderFooter();
    }
});

document.addEventListener('mousemove', () => {
    if (Resing) {
        updateSvgHeaderFooter();
    }
});

// Предотвращаем изменения фиксированных строк
textarea.addEventListener('input', () => {
    const cursorPosition = textarea.selectionStart;

    let content = textarea.value;

    // Убираем лишние пробелы
    if (!content.startsWith(svgHeader) || !content.endsWith(svgFooter)) {
        const bodyContent = content
            .replace(svgHeader, '') // Убираем заголовок
            .replace(svgFooter, '') // Убираем окончание
            .trim();

        const emptyLines = '\n'.repeat(defaultEmptyLines);
        textarea.value = `${svgHeader}\n${emptyLines}${bodyContent}${emptyLines}${svgFooter}`;

        // Восстанавливаем позицию курсора внутри редактируемой части
        textarea.selectionStart = Math.max(cursorPosition, svgHeader.length + defaultEmptyLines);
        textarea.selectionEnd = textarea.selectionStart;
    }
});

// Ограничиваем ввод текста только в редактируемой части
textarea.addEventListener('keydown', (e) => {
    const cursorPosition = textarea.selectionStart;
    const editableStart = svgHeader.length + defaultEmptyLines;
    const editableEnd = textarea.value.length - svgFooter.length - defaultEmptyLines;

    // Если курсор вне редактируемой области, возвращаем его
    if (cursorPosition < editableStart || cursorPosition > editableEnd) {
        e.preventDefault();
        textarea.selectionStart = Math.min(Math.max(cursorPosition, editableStart), editableEnd);
        textarea.selectionEnd = textarea.selectionStart;
    }
});

// Парсинг содержимого текстового поля
function parseSvgCodeFromTextarea() {
    const content = textarea.value
        .replace(svgHeader, '') // Убираем заголовок
        .replace(svgFooter, '') // Убираем окончание
        .trim();

    SvgCanvass.innerHTML = '';
    massivePoints = [];
    massivePolygons = [];
    indexPoin = 1;
    indexPoly = 1;

    const tempContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tempContainer.innerHTML = content;

    const polygons = tempContainer.querySelectorAll('polygon');

    polygons.forEach((polygon) => {
        const points = polygon.getAttribute('points');
        const fill = polygon.getAttribute('fill') || 'lime';
        const stroke = polygon.getAttribute('stroke') || 'black';
        const strokeWidth = polygon.getAttribute('stroke-width') || 2;

        const newPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        newPolygon.setAttribute('points', points.trim());
        newPolygon.setAttribute('fill', fill);
        newPolygon.setAttribute('stroke', stroke);
        newPolygon.setAttribute('stroke-width', strokeWidth);
        newPolygon.setAttribute('index-polygon', indexPoly);
        newPolygon.classList.add('polygon-glow');

        massivePolygons.push(newPolygon);
        SvgCanvass.appendChild(newPolygon);

        const pointCoords = points.trim().split(' ');
        pointCoords.forEach((coord) => {
            const [x, y] = coord.split(',').map(Number);

            const newPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            newPoint.setAttribute('cx', x);
            newPoint.setAttribute('cy', y);
            newPoint.setAttribute('r', 5);
            newPoint.setAttribute('fill', 'blue');
            newPoint.setAttribute('index-point', indexPoin);
            newPoint.setAttribute('index-polygon', indexPoly);

            massivePoints.push(newPoint);
            SvgCanvass.appendChild(newPoint);
            indexPoin++;
        });

        indexPoly++;
    });
}


// Добавляем обработчик событий для текстового поля
textarea.addEventListener('input', () => {
    const cursorPosition = textarea.selectionStart;

    let content = textarea.value.trim();

    // Проверяем, если заголовок или окончание изменены
    if (!content.startsWith(svgHeader) || !content.endsWith(svgFooter)) {
        const bodyContent = content
            .replace(svgHeader, '') // Убираем заголовок
            .replace(svgFooter, '') // Убираем окончание
            .trim();

        const emptyLines = '\n'.repeat(defaultEmptyLines); // Обеспечиваем отступ
        textarea.value = `${svgHeader}\n${emptyLines}${bodyContent}${emptyLines}${svgFooter}`;

        textarea.selectionStart = textarea.selectionEnd = cursorPosition; // Восстанавливаем позицию курсора
    }

    // Немедленно применяем изменения
    parseSvgCodeFromTextarea();
});



// Параметры для нового полигона
let currentFillColor = "#ffffff";
let currentStrokeColor = "#000000";
let currentStrokeWidth = 2;

// Захватываем элементы управления
const fillColorInput = document.getElementById('fillColor');
const strokeColorInput = document.getElementById('strokeColor');
const strokeWidthInput = document.getElementById('strokeWidth');

// Слушатели для изменения параметров
fillColorInput.addEventListener('input', (e) => {
    currentFillColor = e.target.value;
    if (flagRedactorFigure && activePolygon) {
        activePolygon.setAttribute('fill', currentFillColor);
        generateSvgCode();
    }
});

strokeColorInput.addEventListener('input', (e) => {
    currentStrokeColor = e.target.value;
    if (flagRedactorFigure && activePolygon) {
        activePolygon.setAttribute('stroke', currentStrokeColor);
        generateSvgCode();
    }
});

strokeWidthInput.addEventListener('input', (e) => {
    currentStrokeWidth = e.target.value;
    if (flagRedactorFigure && activePolygon) {
        activePolygon.setAttribute('stroke-width', currentStrokeWidth);
        generateSvgCode();
    }
});


function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    // Добавляем уведомление в контейнер
    container.appendChild(notification);

    // Удаляем уведомление через 5 секунд
    setTimeout(() => {
        notification.remove();
    }, 5000);
}