window.onload = function () {
    const canvas = document.getElementById("main-canvas");
    const context = canvas.getContext("2d");
    const imageInput = document.getElementById("imageInput");
    const numberCellsInput = document.getElementById("number_cells_input");
    const cellSizeInputX = document.getElementById("cell_size_x_input");
    const cellSizeInputY = document.getElementById("cell_size_y_input");
    const rowCellAmount = document.getElementById("number-cells-row");
    const controlsSubmitButton = document.getElementById(
        "submit_grid_controls_button"
    );
    const gridGapInput = document.getElementById("gap-size");

    let imageCoordinates = { x: 0, y: 0 };
    let imageDimensions = { width: 0, height: 0 };

    let rowLength = 1;
    let gridOffset = { x: 0, y: 0 };
    let gridStartOffset = { x: 0, y: 0 };
    let gap = 0;
    let cellDimensions = { width: 0, height: 0 };

    let cellAmount = 0;

    let mouseDown = false;
    let mouseCoordinates = { x: 0, y: 0 };

    let image = null;

    let finalDimensions = { x: 0, y: 0 };

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

    function mainDraw() {}
    function drawGrid() {}
    function drawPicture() {
        const file = input.files[0];
        if (!file) {
            console.error("No File Found");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            image.onload = () => {
                const image_width = image.width;
                const image_height = image.height;
                image_dimensions_x = image_width;
                image_dimensions_y = image_height;

                const scale = Math.min(
                    canvas.clientWidth / image_width,
                    canvas.clientHeight / image_height
                );
                finalWidth = image_width * scale;
                finalHeight = image_height * scale;

                const x = (canvas.clientWidth - finalWidth) / 2;
                const y = (canvas.clientHeight - finalHeight) / 2;

                image_dimensions_x = x;
                image_dimensions_y = y;

                context.clearRect(
                    0,
                    0,
                    canvas.clientWidth,
                    canvas.clientHeight
                );
                context.drawImage(image, x, y, finalWidth, finalHeight);
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    canvas.addEventListener("mousedown", (e) => {
        mouseDown = true;
        mouseCoordinates = getMouseCoordinates(e);
        gridStartOffset = gridOffset();
    });

    canvas.addEventListener("mouseup", (e) => {
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (mouseDown) {
            let distance = subtractCoordinates(
                getMouseCoordinates(),
                mouseCoordinates
            );
            gridOffset = addCoordinates(gridStartOffset, distance);
            if (image) {
                context.clearRect(
                    0,
                    0,
                    canvas.clientWidth,
                    canvas.clientHeight
                );
                context.drawImage(
                    image,
                    image_dimensions_x,
                    image_dimensions_y,
                    finalWidth,
                    finalHeight
                );
            }
            cellDimensions.x = parseInt(cellSizeInputX.value) || 0;
            cellDimensions.y = parseInt(cellSizeInputY.value) || 0;
            cellAmount = parseInt(numberCellsInput.value) || 0;
            rowLength = parseInt(rowCellAmount.value);

            context.strokeStyle = "red";
            context.lineWidth = 3;

            let columnLength = Math.ceil(cellAmount / rowLength);

            for (let i = 0; i < columnLength; i++) {
                for (let j = 0; j < rowLength; j++) {
                    context.strokeRect(
                        gridOffset.x +
                            imageCoordinates.x +
                            gap +
                            cellDimensions.x * j,
                        gridOffset.y +
                            imageCoordinates.y +
                            gap +
                            cellDimensions.y * i,
                        cell_dimensions_x,
                        cell_dimensions_y
                    );
                }
            }
        }
    });

    submit_grid_controls_button.addEventListener("click", (e) => {
        console.log(cells_size_x);
        context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        cell_dimensions_x = parseInt(cells_size_x.value) || 0;
        cell_dimensions_y = parseInt(cells_size_y.value) || 0;
        number_of_cells = parseInt(num_cells_input.value) || 0;
        row_length = parseInt(number_cells_row.value);
        gap = parseInt(gap_size_input.value) || 0;
        context.strokeStyle = "red";
        context.lineWidth = 3;
        let column_length = Math.ceil(number_of_cells / row_length);
        console.log(image_dimensions_x);
        for (let i = 0; i < column_length; i++) {
            for (let j = 0; j < row_length; j++) {
                context.strokeRect(
                    grid_offset_x + image_dimensions_x + cell_dimensions_x * j,
                    grid_offset_y + image_dimensions_y + cell_dimensions_y * i,
                    cell_dimensions_x,
                    cell_dimensions_y
                );
            }
        }
    });

    input.addEventListener("change", () => {});
};
