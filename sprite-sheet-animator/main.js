const ImageLoader = {
    image: null,
    width: 0,
    height: 0,
    scaledWidth: 0,
    scaledHeight: 0,
    centeredX: 0,
    centeredY: 0,

    load(file, callback) {
        const reader = new FileReader();
        this.image = new Image();
        reader.onload = (e) => {
            this.image.onload = (e) => {
                this.width = this.image.width;
                this.height = this.image.height;
                callback(this);
            };
            this.image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    getCenteredCoordinates(canvas) {
        let dimensions = this.getScaledDimensions(canvas.width, canvas.height);
        this.centeredX = (canvas.clientWidth - dimensions.width) / 2;
        this.centeredY = (canvas.clientHeight - dimensions.height) / 2;
        return {
            x: this.centeredX,
            y: this.centeredY,
        };
    },
    getScaledDimensions(canvasWidth, canvasHeight) {
        let scale = Math.min(
            canvasWidth / this.width,
            canvasHeight / this.height
        );
        this.scaledWidth = this.width * scale;
        this.scaledHeight = this.height * scale;
        return { width: this.scaledWidth, height: this.scaledHeight };
    },
};

const Grid = {
    frameAmount: 0,
    rows: 0,
    cellWidth: 0,
    cellHeight: 0,
    gapX: 0,
    gapY: 0,
    gridOffset: { x: 0, y: 0 },
    frames: [],
    thickness: 2,
    color: "red",

    drawGrid(context) {
        if (!this.frameAmount > 0) {
            console.log("No frames");
            return;
        }
        this.frames = [];
        let columns = Math.ceil(this.frameAmount / this.rows);
        const scaleX = ImageLoader.scaledWidth / ImageLoader.width;
        const scaleY = ImageLoader.scaledHeight / ImageLoader.height;
        console.log("hi");
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < this.rows; j++) {
                console.log(columns, scaleX, scaleY, this.rows);
                let drawX =
                    ImageLoader.centeredX +
                    this.gridOffset.x +
                    j * (this.cellWidth * scaleX + this.gapX);
                let drawY =
                    ImageLoader.centeredY +
                    this.gridOffset.y +
                    i * (this.cellHeight * scaleY + this.gapY);
                let sourceX = (drawX - ImageLoader.width) / scaleX;
                let sourceY = (drawY - ImageLoader.height) / scaleY;
                this.frames.push({
                    x: sourceX,
                    y: sourceY,
                    width: this.cellWidth,
                    height: this.cellHeight,
                }); // store source coords for animation
                context.strokeRect(
                    drawX,
                    drawY,
                    this.cellWidth * scaleX,
                    this.cellHeight * scaleY
                );
            }
        }
    },
    getFrames() {},
};

window.onload = function () {
    //Canvases
    const canvas = document.getElementById("main-canvas");
    const context = canvas.getContext("2d");
    const animationCanvas = document.getElementById("animation-canvas");
    const animationContext = animationCanvas.getContext("2d");

    //Option Inputs
    const imageInput = document.getElementById("imageInput");
    const frameAmountInput = document.getElementById("frameAmountInput");
    const cellWidthInput = document.getElementById("cellWidthInput");
    const cellHeightInput = document.getElementById("cellHeightInput");
    const rowAmountInput = document.getElementById("rowAmountInput");
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
    const gapXInput = document.getElementById("gapXInput");
    const gapYInput = document.getElementById("gapYInput");

    //Image settings
    let imageCoordinates = { x: 0, y: 0 };
    let imageDimensions = { width: 0, height: 0 };
    let image = null;
    let file = null;
    let finalDimensions = { width: 0, height: 0 };

    //Animation Settings
    let lastFrameTime = 0;
    let currentFrame = 0;
    let frames = [];

    //Grid Settings
    let rowLength = 1;
    let gridOffset = { x: 0, y: 0 };
    let gridStartOffset = { x: 0, y: 0 };
    let gap = { x: 0, y: 0 };
    let cellDimensions = { width: 0, height: 0 };
    let cellAmount = 0;

    //Mouse
    let mouseDown = false;
    let mouseCoordinates = { x: 0, y: 0 };

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

            console.log(frame.sourceX, frame.sourceY);

            animationContext.drawImage(
                image,
                frame.sourceX,
                frame.sourceY,
                cellDimensions.x,
                cellDimensions.y,
                0,
                0,
                animationCanvas.width,
                animationCanvas.height
            );

            currentFrame = (currentFrame + 1) % frames.length;
        }

        requestAnimationFrame(drawFrames);
    }

    framesPerSecondInput.addEventListener("input", () => {
        framesPerSecondAmount.textContent = parseInt(
            framesPerSecondInput.value
        );
        Grid.frameAmount = frameAmountInput.value;
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
        Grid.drawGrid(context);
    });

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        console.log(file);
        if (!file) return;
        ImageLoader.load(file, (loader) => {
            console.log("loaded image", loader.width, loader.height);
            loader.getScaledDimensions(canvas.width, canvas.height);
            loader.getCenteredCoordinates(canvas);
            console.log("centered: ", loader.centeredX, loader.centeredY);

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
                loader.image,
                loader.centeredX,
                loader.centeredY,
                loader.scaledWidth,
                loader.scaledHeight
            );
        });
    });

    //Option inputs mouse wheel listeners

    cellWidthInput.addEventListener("wheel", (e) => {
        e.preventDefault();
        const step = parseFloat(cellWidthInput.step) || 1;
        let value = parseFloat(cellWidthInput.value) || 0;

        if (e.deltaY < 0) {
            value += step;
        } else {
            value -= step;
            if (value < 0) {
                value = 0;
            }
        }
        cellWidth.value = value;
        Grid.cellWidth = value;
    });
    cellHeightInput.addEventListener("wheel", (e) => {
        e.preventDefault();
        const step = parseFloat(cellHeightInput.step) || 1;
        let value = parseFloat(cellHeightInput.value) || 0;

        if (e.deltaY < 0) {
            value += step;
        } else {
            value -= step;
            if (value < 0) {
                value = 0;
            }
        }
        cellHeightInput.value = value;
        Grid.cellHeight = value;
    });
    gapXInput.addEventListener("wheel", (e) => {
        e.preventDefault();
        const step = parseFloat(gapXInput.step) || 1;
        let value = parseFloat(gapXInput.value) || 0;

        if (e.deltaY < 0) {
            value += step;
        } else {
            value -= step;
            if (value < 0) {
                value = 0;
            }
        }
        gapXInput.value = value;
        Grid.gapX = value;
    });
    gapYInput.addEventListener("wheel", (e) => {
        e.preventDefault();
        const step = parseFloat(gapYInput.step) || 1;
        let value = parseFloat(gapYInput.value) || 0;

        if (e.deltaY < 0) {
            value += step;
        } else {
            value -= step;
            if (value < 0) {
                value = 0;
            }
        }
        gapYInput.value = value;
        Grid.gapY = value;
    });
    rowAmountInput.addEventListener("wheel", (e) => {
        e.preventDefault();
        const step = parseFloat(rowAmountInput.step) || 1;
        let value = parseFloat(rowAmountInput.value) || 0;

        if (e.deltaY < 0) {
            value += step;
        } else {
            value -= step;
            if (value < 0) {
                value = 0;
            }
        }
        rowAmountInput.value = value;
        Grid.rows = value;
    });
    frameAmountInput.addEventListener("wheel", (e) => {
        e.preventDefault();
        const step = parseFloat(frameAmountInput.step) || 1;
        let value = parseFloat(frameAmountInput.value) || 0;

        if (e.deltaY < 0) {
            value += step;
        } else {
            value -= step;
            if (value < 0) {
                value = 0;
            }
        }
        frameAmountInput.value = value;
        Grid.frameAmount = value;
    });
};
