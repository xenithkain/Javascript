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
        this.centeredX = (canvas.width - dimensions.width) / 2;
        this.centeredY = (canvas.height - dimensions.height) / 2;
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
    gridStartOffset: { x: 0, y: 0 },
    frames: [],
    thickness: 2,
    color: "red",

    drawGrid(context) {
        if (!(this.frameAmount > 0 && this.rows > 0)) return;

        this.frames = [];

        // rows == frames per row (i.e., columns horizontally)
        const framesPerRow = this.rows;
        const numRows = Math.ceil(this.frameAmount / framesPerRow);

        // uniform scale because getScaledDimensions uses Math.min(...)
        const scale = ImageLoader.scaledWidth / ImageLoader.width;

        const scaledCellW = this.cellWidth * scale;
        const scaledCellH = this.cellHeight * scale;
        const scaledGapX = this.gapX * scale;
        const scaledGapY = this.gapY * scale;

        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < framesPerRow; c++) {
                const idx = r * framesPerRow + c;
                if (idx >= this.frameAmount) break;

                const drawX =
                    ImageLoader.centeredX +
                    this.gridOffset.x +
                    c * (scaledCellW + scaledGapX);
                const drawY =
                    ImageLoader.centeredY +
                    this.gridOffset.y +
                    r * (scaledCellH + scaledGapY);

                // Map canvas-space back to image-space
                const srcX = (drawX - ImageLoader.centeredX) / scale;
                const srcY = (drawY - ImageLoader.centeredY) / scale;

                // IMPORTANT: source rect in IMAGE pixels (no scaling here)
                this.frames.push({
                    x: srcX,
                    y: srcY,
                    width: this.cellWidth,
                    height: this.cellHeight,
                });

                context.strokeRect(drawX, drawY, scaledCellW, scaledCellH);
            }
        }
    },
};

const Animator = {
    fps: 0,
    currentFrame: 0,
    lastFrameTime: 0,
    frameDuration: 0,
    animationId: null,
    play(timestamp, context, canvas) {
        if (!ImageLoader.image) return;
        if (ImageLoader.frames) {
            if (ImageLoader.frames.length <= 0) return;
        }
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.frameDuration = 1000 / this.fps;
        if (timestamp - this.lastFrameTime >= this.frameDuration) {
            const frame = Grid.frames[this.currentFrame];
            this.lastFrameTime = timestamp;
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.drawImage(
                ImageLoader.image,
                frame.x,
                frame.y,
                frame.width,
                frame.height,
                0,
                0,
                canvas.width,
                canvas.height
            );

            this.currentFrame = (this.currentFrame + 1) % Grid.frames.length;
        }

        this.animationId = requestAnimationFrame((timestamp) =>
            this.play(timestamp, context, canvas)
        );
    },
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
    const fpsInput = document.getElementById("fpsInput");
    const controlsSubmitButton = document.getElementById(
        "submit_grid_controls_button"
    );
    const fpsAmount = document.getElementById("fpsAmount");
    fpsAmount.textContent = parseInt(fpsInput.value);
    const gapXInput = document.getElementById("gapXInput");
    const gapYInput = document.getElementById("gapYInput");

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

    function drawFrames(timestamp) {}

    function redraw() {
        if (!ImageLoader.image) return;
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.drawImage(
            ImageLoader.image,
            ImageLoader.centeredX,
            ImageLoader.centeredY,
            ImageLoader.scaledWidth,
            ImageLoader.scaledHeight
        );

        Grid.drawGrid(context);
    }

    fpsInput.addEventListener("input", () => {
        fpsAmount.textContent = parseInt(fpsInput.value);
        Animator.fps = parseInt(fpsInput.value);
        requestAnimationFrame((timestamp) => {
            Animator.play(timestamp, animationContext, animationCanvas);
        });
    });

    canvas.addEventListener("mousedown", (e) => {
        mouseDown = true;
        mouseCoordinates = getMouseCoordinates(e);
        Grid.gridStartOffset = Grid.gridOffset;
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
            Grid.gridOffset = addCoordinates(Grid.gridStartOffset, distance);

            redraw();
        }
    });

    controlsSubmitButton.addEventListener("click", (e) => {
        Grid.frameAmount = parseInt(frameAmountInput.value) || 0;
        Grid.rows = parseInt(rowAmountInput.value) || 0;
        Grid.cellWidth = parseInt(cellWidthInput.value) || 0;
        Grid.cellHeight = parseInt(cellHeightInput.value) || 0;
        Grid.gapX = parseInt(gapXInput.value) || 0;
        Grid.gapY = parseInt(gapYInput.value) || 0;
        redraw();
    });

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) return;
        ImageLoader.load(file, (loader) => {
            loader.getScaledDimensions(canvas.width, canvas.height);
            loader.getCenteredCoordinates(canvas);
            redraw();
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
        cellWidthInput.value = value;
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
    fpsInput.addEventListener("wheel", (e) => {
        e.preventDefault();
        const step = parseFloat(fpsInput.step) || 1;
        let value = parseFloat(fpsInput.value) || 0;

        if (e.deltaY < 0) {
            value += step;
        } else {
            value -= step;
            if (value < 0) {
                value = 0;
            }
        }
        fpsInput.value = value;
        Grid.frameAmount = value;
    });
};
