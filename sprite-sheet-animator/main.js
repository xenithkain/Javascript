window.onload = function () {
    const canvas = document.getElementById("main-canvas");
    const context = canvas.getContext("2d");
    const input = document.getElementById("imageInput");

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

                    const scale = Math.min(
                        canvas.clientWidth / image_width,
                        canvas.clientHeight / image_height
                    );
                    const finalWidth = image_width * scale;
                    const finalHeight = image_height * scale;

                    const x = (canvas.clientWidth - finalWidth) / 2;
                    const y = (canvas.clientHeight - finalHeight) / 2;

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
