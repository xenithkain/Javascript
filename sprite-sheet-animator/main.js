window.onload = function () {
    const canvas = document.getElementById("main-canvas");
    const context = canvas.getContext("2d");
    const input = document.getElementById("imageInput");
    const num_cells_input = document.getElementById("number_cells_input");
    const cells_size_x = document.getElementById("cell_size_x_input");
    const cells_size_y = document.getElementById("cell_size_y_input");
    const number_cells_row = document.getElementById("number-cells-row");
    const submit_grid_controls_button = document.getElementById(
        "submit_grid_controls_button"
    );
    let image_dimensions_x = 0;
    let image_dimensions_y = 0;

    let cell_dimensions_x = 0;
    let cell_dimensions_y = 0;
    let number_of_cells = 0;
    let row_length = 1;

    submit_grid_controls_button.addEventListener("click", (e) => {
        console.log(cells_size_x);
        context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        cell_dimensions_x = parseInt(cells_size_x.value) || 0;
        cell_dimensions_y = parseInt(cells_size_y.value) || 0;
        number_of_cells = parseInt(num_cells_input.value) || 0;
        row_length = parseInt(number_cells_row.value);
        context.strokeStyle = "red";
        context.lineWidth = 3;
        let column_length = Math.ceil(number_of_cells / row_length);
        console.log(image_dimensions_x);
        for (let i = 0; i < column_length; i++) {
            for (let j = 0; j < row_length; j++) {
                context.strokeRect(
                    image_dimensions_x + cell_dimensions_x * j,
                    image_dimensions_y + cell_dimensions_y * i,
                    cell_dimensions_x,
                    cell_dimensions_y
                );
            }
        }
    });

    input.addEventListener("change", () => {
        const file = input.files[0];
        console.log(file);
        const image = new Image();

        if (file) {
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
                    const finalWidth = image_width * scale;
                    const finalHeight = image_height * scale;

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
    });
};
