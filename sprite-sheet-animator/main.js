window.onload = function () {
    const canvas = document.getElementById("main-canvas");
    const context = canvas.getContext("2d");
    const animationCanvas = document.getElementById("animation-canvas");
    const animationContext = animationCanvas.getContext("2d");
    const imageInput = document.getElementById("imageInput");
    const numberCellsInput = document.getElementById("number_cells_input");
    const cellSizeInputX = document.getElementById("cell_size_x_input");
    const cellSizeInputY = document.getElementById("cell_size_y_input");
    const rowCellAmount = document.getElementById("number-cells-row");
    const controlsSubmitButton = document.getElementById(
        "submit_grid_controls_button"
    );
    const gridGapXInput = document.getElementById("gap-size-x");
    const gridGapYInput = document.getElementById("gap-size-y");

    let imageCoordinates = { x: 0, y: 0 };
    let imageDimensions = { width: 0, height: 0 };

    let rowLength = 1;
    let gridOffset = { x: 0, y: 0 };
    let gridStartOffset = { x: 0, y: 0 };
    let gap = { x: 0, y: 0 };
    let cellDimensions = { width: 0, height: 0 };

    let frames = [];

    let cellAmount = 0;

    let mouseDown = false;
    let mouseCoordinates = { x: 0, y: 0 };

    let image = null;
    let file = null;

    let finalDimensions = { width: 0, height: 0 };

    function getMouseCoordinates(e) {
        return {
            x: e.clientX - canvas.getBoundingClientRect().left,
            y: e.clientY - canvas.getBoundingClientRect().top,
        };
    }

    function addCoordinates(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    function subtractCoordinates(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }

    function mainDraw() {
        context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        context.drawImage(
            image,
            imageDimensions.x,
            imageDimensions.y,
            finalDimensions.width,
            finalDimensions.height
        );
        drawGrid();
    }
    function drawGrid() {
        cellDimensions.x = parseInt(cellSizeInputX.value) || 0;
        cellDimensions.y = parseInt(cellSizeInputY.value) || 0;
        cellAmount = parseInt(numberCellsInput.value) || 0;
        rowLength = parseInt(rowCellAmount.value);
        gap.x = parseInt(gridGapXInput.value) || 0;
        gap.y = parseInt(gridGapYInput.value) || 0;

        context.strokeStyle = "red";
        context.lineWidth = 3;

        let columnLength = Math.ceil(cellAmount / rowLength);
        frames = [];
        for (let i = 0; i < columnLength; i++) {
            for (let j = 0; j < rowLength; j++) {
                let x =
                    gridOffset.x +
                    imageCoordinates.x +
                    j * (cellDimensions.x + gap.x);
                let y =
                    gridOffset.y +
                    imageCoordinates.y +
                    i * (cellDimensions.y + gap.y);
                frames.push({ x: x, y: y });
                context.strokeRect(x, y, cellDimensions.x, cellDimensions.y);
            }
        }
        console.log(frames);
    }
    canvas.addEventListener("mousedown", (e) => {
        mouseDown = true;
        mouseCoordinates = getMouseCoordinates(e);
        gridStartOffset = gridOffset;
    });

    canvas.addEventListener("mouseup", (e) => {
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (mouseDown) {
            let distance = subtractCoordinates(
                getMouseCoordinates(e),
                mouseCoordinates
            );
            gridOffset = addCoordinates(gridStartOffset, distance);
            mainDraw();
        }
    });

    controlsSubmitButton.addEventListener("click", (e) => {
        mainDraw();
    });

    imageInput.addEventListener("change", () => {
        if (!file) {
            console.error("No File Found");
            console.log("Trying again.");
            file = imageInput.files[0];
            if (!file) {
                console.error("Still no File Found");
                return;
            }
        }
        const reader = new FileReader();
        image = new Image();
        reader.onload = (e) => {
            image.onload = () => {
                imageDimensions.x = image.width;
                imageDimensions.y = image.height;

                const scale = Math.min(
                    canvas.clientWidth / image.width,
                    canvas.clientHeight / image.height
                );

                finalDimensions.width = image.width * scale;
                finalDimensions.height = image.height * scale;

                const x = (canvas.clientWidth - finalDimensions.width) / 2;
                const y = (canvas.clientHeight - finalDimensions.height) / 2;

                imageDimensions.x = x;
                imageDimensions.y = y;

                context.drawImage(
                    image,
                    x,
                    y,
                    finalDimensions.width,
                    finalDimensions.height
                );
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};
