/***********************/
/* Share functionality */
async function createImageWithNumber(number) {
    const img = new Image();
    img.crossOrigin = "anonymous"; // needed if the image is remote
    img.src = "/assets/share-image.png";

    await img.decode();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    // draw the base image
    ctx.drawImage(img, 0, 0);

    // draw the number
    const fontSize = 200;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const x = canvas.width / 2;
    const y = canvas.height / 2 + fontSize * 0.08; // small downward nudge

    if (number === 1) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0,   "#fff7b1"); // bright highlight
        gradient.addColorStop(0.3, "#f7d774");
        gradient.addColorStop(0.5, "#d4a017"); // rich gold
        gradient.addColorStop(0.7, "#b8860b");
        gradient.addColorStop(1,   "#f7d774");

        ctx.fillStyle = gradient;
        ctx.strokeStyle = "#8a6b00"; // optional outline
        ctx.lineWidth = 4;

        ctx.strokeText(number, x, y);
    }
    if (number === 2) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0,   "#ffffff");
        gradient.addColorStop(0.25,"#d9d9d9");
        gradient.addColorStop(0.5, "#b5b5b5");
        gradient.addColorStop(0.75,"#e5e5e5");
        gradient.addColorStop(1,   "#ffffff");

        ctx.fillStyle = gradient;
        ctx.strokeStyle = "#7a7a7a";
        ctx.lineWidth = 3;

        ctx.strokeText(number, x, y);
    }
    if (number === 3) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0,   "#ffd7a1");
        gradient.addColorStop(0.3, "#c47a3a");
        gradient.addColorStop(0.6, "#8b4b1f");
        gradient.addColorStop(1,   "#c47a3a");

        ctx.fillStyle = gradient;
        ctx.strokeStyle = "#5a2e12";
        ctx.lineWidth = 4;

        ctx.strokeText(number, x, y);
    }
    if (number > 3) {
        ctx.fillStyle = "white";
    }
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(number, x, y);

    const imgEl = document.querySelector(".share__image");
    imgEl.src = canvas.toDataURL("image/png");
    document.querySelector(".share__caption").innerHTML = `You have completed today's challenge, congratulations! You did it in ${number} checks.`

    return canvas;
}

async function canvasToFile(canvas, filename = "shared.png") {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    return new File([blob], filename, { type: "image/png" });
}

async function generateImageWithNumber(number) {
    const canvas = await createImageWithNumber(number);
    generatedFile = await canvasToFile(canvas);
    generatedNumber = number;
}

async function shareImageWithNumber(image, number) {
    if (navigator.canShare && navigator.canShare({ files: [image] })) {
        await navigator.share({
        files: [image],
        text: `I completed today's challenge in ${number} checks. Why don't you have a go at https://5words.co.uk`
        });
    } else {
        console.log("Sharing not supported on this device");
        navigator.clipboard.writeText(image).then(() => {
            alert("Sharing not supported on this device. Link copied to clipboard");
        });
    }
}

const shareBtn = document.getElementById('share--button');
shareBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    while (!generatedFile) {
        await new Promise(r => setTimeout(r, 50));
    }

    shareImageWithNumber(generatedFile, generatedNumber);
});