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
    const framesPerSecondAmount = document.getElementById(
        "frames-per-second-amount"
    );
    const controlsSubmitButton = document.getElementById(
        "submit_grid_controls_button"
    );
    const framesPerSecondInput = document.getElementById(
        "frames-per-second-input"
    );
    framesPerSecondAmount.textContent = parseInt(framesPerSecondInput.value);
    const gridGapXInput = document.getElementById("gap-size-x");
    const gridGapYInput = document.getElementById("gap-size-y");

    let imageCoordinates = { x: 0, y: 0 };
    let imageDimensions = { width: 0, height: 0 };

    let rowLength = 1;
    let gridOffset = { x: 0, y: 0 };
    let gridStartOffset = { x: 0, y: 0 };
    let gap = { x: 0, y: 0 };
    let cellDimensions = { width: 0, height: 0 };
    let timestamp = 0;
    let lastFrameTime = 0;
    let currentFrame = 0;

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
        rowLength = parseInt(rowCellAmount.value) || 1;
        gap.x = parseInt(gridGapXInput.value) || 0;
        gap.y = parseInt(gridGapYInput.value) || 0;

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw scaled image
        context.drawImage(
            image,
            imageDimensions.x,
            imageDimensions.y,
            finalDimensions.width,
            finalDimensions.height
        );

        context.strokeStyle = "red";
        context.lineWidth = 2;

        let columnLength = Math.ceil(cellAmount / rowLength);
        frames = [];

        // Calculate scale between original image and canvas
        const scaleX = finalDimensions.width / image.width;
        const scaleY = finalDimensions.height / image.height;

        for (let i = 0; i < columnLength; i++) {
            for (let j = 0; j < rowLength; j++) {
                let sourceX = j * cellDimensions.x;
                let sourceY = i * cellDimensions.y;

                // Where the grid should appear on the canvas, now with gridOffset
                let drawX =
                    imageDimensions.x +
                    gridOffset.x +
                    j * (cellDimensions.x * scaleX + gap.x);
                let drawY =
                    imageDimensions.y +
                    gridOffset.y +
                    i * (cellDimensions.y * scaleY + gap.y);

                frames.push({ sourceX, sourceY }); // store source coords for animation
                context.strokeRect(
                    drawX,
                    drawY,
                    cellDimensions.x * scaleX,
                    cellDimensions.y * scaleY
                );
            }
        }
    }
    function drawFrames(timestamp) {
        if (!image) return;
        if (frames.length <= 0) return;
        const fps = parseInt(framesPerSecondInput.value) || 1;
        const frameDuration = 1000 / fps;
        if (timestamp - lastFrameTime >= frameDuration) {
            const frame = frames[currentFrame];
            lastFrameTime = timestamp;
            animationContext.clearRect(
                0,
                0,
                animationCanvas.width,
                animationCanvas.height
            );

            // Calculate scale to fit the frame inside the animation canvas
            const scale = Math.min(
                animationCanvas.width / cellDimensions.x,
                animationCanvas.height / cellDimensions.y
            );

            const drawWidth = cellDimensions.x * scale;
            const drawHeight = cellDimensions.y * scale;

            // Center the frame
            const centeredX = (animationCanvas.width - drawWidth) / 2;
            const centeredY = (animationCanvas.height - drawHeight) / 2;

            // Use frame.sourceX and frame.sourceY for correct cropping
            animationContext.drawImage(
                image,
                frame.sourceX,
                frame.sourceY,
                cellDimensions.x,
                cellDimensions.y,
                centeredX,
                centeredY,
                drawWidth,
                drawHeight
            );

            // Advance frame
            currentFrame = (currentFrame + 1) % frames.length;
        }

        requestAnimationFrame(drawFrames);
    }

    framesPerSecondInput.addEventListener("input", () => {
        framesPerSecondAmount.textContent = parseInt(
            framesPerSecondInput.value
        );
        requestAnimationFrame(drawFrames);
    });

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
