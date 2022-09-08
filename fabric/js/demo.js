var pic = null;
var imgUrl = null;


function rotatedPoint(point, angle, center) {
	angle = (Math.PI / 180) * angle;
	return {
		x: (point.x - center.x) * Math.cos(angle) -
			(point.y - center.y) * Math.sin(angle) +
			center.x,
		y: (point.x - center.x) * Math.sin(angle) +
			(point.y - center.y) * Math.cos(angle) +
			center.y,
	};
}

function changeAction(target) {
	['select', 'draw'].forEach(action => {
		const t = document.getElementById(action);
		t.classList.remove('active');
	});
	if (typeof target === 'string') target = document.getElementById(target);
	target.classList.add('active');
	switch (target.id) {
		case "loadImage":
			loadImage();
			break;
		case "loadFromJson":
			loadFromJson();
			break;
		case "select":
			canvas.isDrawingMode = false;
			break;
		case "draw":
			canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
			canvas.freeDrawingBrush.width = 10;
			canvas.freeDrawingBrush.color = 'yellow';
			canvas.isDrawingMode = true;
			break;
		case "fangda":
			fangda();
			break;
		case "suoxiao":
			suoxiao();
			break;
		case "crop":
			initCrop();
			break;
		case "cropFinish":
			cropFinish();
			break;
		case "addRect":
			addRect();
			break;
		case "addText":
			addText();
			break;
		case "addTriangle":
			addTriangle();
			break;
		default:
			break;
	}
}

/** 重置画布尺寸 */
function resizeCanvas(imgHeight, imgWidth) {
	var cw = 390 - 20;
	var ch = imgHeight / imgWidth * cw;
	canvas.setHeight(ch);
	canvas.setWidth(cw);
}

/** 添加背景图 */
function loadImage() {
	imgUrl = document.getElementById("imgUrl").value;
	fabric.Image.fromURL(imgUrl,
		function(img) {
			// img.scaleToWidth(500,true);
			img.set({
				id: "original",
				state: "xxx",
			});

			var cropInfo = {
				top: 0,
				left: 0,
				width: img.width,
				height: img.height,
				initiated: false,
			};

			resizeCanvas(img.height, img.width);

			fabric.Image.fromURL(imgUrl, (c) => {
				c.set({
					selectable: false,
					evented: false,
				});
				c.scaleToWidth(canvas.getWidth(), true);
				c._original = img;
				c._cropInfo = cropInfo;
				pic = c;
				canvas.add(c);
			});

		}, {
			crossOrigin: "anonymous"
		}
	);
}

function initCrop() {
	const cropped = pic;
	const cropInfo = cropped._cropInfo;
	const original = cropped._original;
	const np = rotatedPoint({
			x: cropped.left - cropInfo.left * cropped.scaleX,
			y: cropped.top - cropInfo.top * cropped.scaleY,
		},
		cropped.angle - original.angle, {
			x: cropped.left,
			y: cropped.top
		}
	);

	fabric.Image.fromURL(imgUrl, (background) => {
		fabric.Image.fromURL(imgUrl, (nextCropped) => {
			background.set({
				id: "background",
				state: "xxx",
				left: np.x,
				top: np.y,
				width: original.width,
				height: original.height,
				scaleX: cropped.scaleX,
				scaleY: cropped.scaleY,
				angle: cropped.angle,
				selectable: false,
				evented: false,
			});

			nextCropped.set({
				id: "cropped",
				state: "cropped",
				left: np.x,
				top: np.y,
				width: original.width,
				height: original.height,
				scaleX: cropped.scaleX,
				scaleY: cropped.scaleY,
				angle: cropped.angle,
				selectable: false,
				evented: false,
			});

			const cropper = new fabric.Rect({
				id: "cropper",
				state: "xxx",
				top: 0,
				left: 0,
				absolutePositioned: true,
				backgroundColor: "rgba(0,0,0,0)",
				opacity: 0.00001,
			});

			cropper.set({
				top: cropped.top,
				left: cropped.left,
				width: cropped.width,
				height: cropped.height,
				scaleX: cropped.scaleX,
				scaleY: cropped.scaleY,
				angle: cropped.angle,
			});

			cropper.setControlsVisibility({
				mtr: true,
				mt: true,
				ml: true,
				mr: true,
				mb: true,
			});

			nextCropped.clipPath = cropper;

			const overlay = new fabric.Rect({
				id: "overlay",
				state: "xxx",
				width: 1400,
				height: 800,
				fill: "#000000",
				opacity: 0.25,
				selectable: false,
				evented: false,
			});

			canvas.add(background);
			canvas.add(overlay);
			canvas.add(nextCropped);
			canvas.add(cropper);
			nextCropped.bringToFront();
			cropper.bringToFront();
			canvas.requestRenderAll();
			cropper._original = original;
			cropper._cropped = nextCropped;
			canvas.remove(cropped);
			
			cropper.set({
				borderColor: '#fff',
				cornerColor: '#fff',
				cornerStyle: 'circle',
				cornerSize: 15,
				lockRotation: true,
				transparentCorners: false
			});
			
			canvas.setActiveObject(cropper);
		});
	});
}

// 剪裁完成
function cropFinish() {
	if (canvas) {
		const cropper = canvas.getActiveObject();
		const original = cropper._original;
		const cropped = cropper._cropped;
		const sX = cropped.scaleX;
		const sY = cropped.scaleY;

		// debugger;

		original.set({
			angle: 0,
			scaleX: sX,
			scaleY: sY,
		});

		cropper.set({
			width: cropper.width * cropper.scaleX, //this.width * this.scaleX
			height: cropper.height * cropper.scaleY,
			scaleX: 1,
			scaleY: 1,
		});

		canvas.remove(cropped);
		original.set({
			scaleX: 1,
			scaleY: 1,
			top: cropped.top,
			left: cropped.left,
		});

		const np = rotatedPoint({
				x: cropper.left,
				y: cropper.top
			},
			-cropper.angle, {
				x: original.left,
				y: original.top
			}
		);

		const cropInfo = {
			top: (np.y - original.top) / sY,
			left: (np.x - original.left) / sX,
			width: cropper.width / cropped.scaleX,
			height: cropper.height / cropped.scaleY,
		};

		// resizeCanvas(cropInfo.height, cropInfo.width);

		fabric.Image.fromURL(original.toDataURL(cropInfo), (cropped) => {
			cropped.set({
				left: cropper.left,
				top: cropper.top,
				angle: cropper.angle,
				lockScalingFlip: true,
				scaleX: sX,
				scaleY: sY,
				width: cropper.width / sX,
				height: cropper.height / sY,
				selectable: false,
				evented: false,
			});

			// cropped.scaleToWidth(canvas.getWidth(), true);

			cropped._original = original;

			cropped._cropInfo = {
				...cropInfo,
				initiated: true
			};
			canvas.add(cropped);
			pic = cropped;

			canvas.getObjects().forEach((o) => {
				if (o.state === "xxx") {
					canvas.remove(o);
				}
			});
		});
	}

}

/** 放大 */
function fangda() {
	canvas.setHeight(canvas.height * 1.2);
	canvas.setWidth(canvas.width * 1.2);
	canvas.setZoom(canvas.getZoom() * 1.2);
	// canvas.backgroundImage.scaleToWidth(canvas.width)
}

/** 缩小 */
function suoxiao() {
	canvas.setHeight(canvas.height / 1.2);
	canvas.setWidth(canvas.width / 1.2);
	canvas.setZoom(canvas.getZoom() / 1.2);
	// canvas.backgroundImage.scaleToWidth(canvas.width)
}

function addText() {
	canvas.add(
		new fabric.Textbox('テキスト',{
			top: 50,
			left: 100,
            fill: '#0DB1DF',
			fontSize: 60,
		})
	);
}

/** 添加矩形 */
function addRect() {
	canvas.add(
		new fabric.Rect({
			top: 50,
			left: 100,
			width: 50,
			height: 50,
			fill: "#2db8ff",
			opacity: 0.5
		})
	);
}
/** 添加三角形 */
function addTriangle() {
	var triangle = new fabric.Triangle({
		top: 50,
		left: 300,
		width: 100,
		height: 100,
		fill: "red"
	});

	triangle.set({
		borderColor: '#fff',
		cornerColor: '#fff',
		cornerStyle: 'circle',
		cornerSize: 15,
		transparentCorners: false
	});
	canvas.add(triangle);
	canvas.setActiveObject(triangle);
}

function loadFromJson() {
	var jsonValue = document.getElementById("jsonValue").value
	canvas.loadFromJSON(JSON.parse(jsonValue), canvas.renderAll.bind(canvas));

}

function init() {

	var imgObj = {
		"type": "image",
		"version": "4.6.0",
		"originX": "left",
		"originY": "top",
		"left": 0,
		"top": 0,
		"width": 4608,
		"height": 3456,
		"fill": "rgb(0,0,0)",
		"stroke": null,
		"strokeWidth": 0,
		"strokeDashArray": null,
		"strokeLineCap": "butt",
		"strokeDashOffset": 0,
		"strokeLineJoin": "miter",
		"strokeUniform": false,
		"strokeMiterLimit": 4,
		"scaleX": 0.08,
		"scaleY": 0.08,
		"angle": 0,
		"flipX": false,
		"flipY": false,
		"opacity": 1,
		"shadow": null,
		"visible": true,
		"backgroundColor": "",
		"fillRule": "nonzero",
		"paintFirst": "fill",
		"globalCompositeOperation": "source-over",
		"skewX": 0,
		"skewY": 0,
		"cropX": 0,
		"cropY": 0,
		"src": "http://localhost:8080/pic/demo.jpg",
		"crossOrigin": "anonymous",
		"filters": []
	};

	imgUrl = imgObj.src;
	resizeCanvas(imgObj.height, imgObj.width);

	fabric.Image.fromObject(imgObj, (img) => {
		img.set({
			id: "original",
			state: "xxx",
		});

		var cropInfo = {
			top: 0,
			left: 0,
			width: img.width,
			height: img.height,
			initiated: false,
		};

		resizeCanvas(img.height, img.width);

		fabric.Image.fromObject(imgObj, (c) => {
			c.set({
				selectable: false,
				evented: false,
			});
			c.scaleToWidth(canvas.getWidth(), true);
			c._original = img;
			c._cropInfo = cropInfo;
			pic = c;
			canvas.add(c);
		});
	});
};

const downloadImage = () => {
	const ext = "png";
	const base64 = canvas.toDataURL({
		format: ext,
		enableRetinaScaling: true
	});
	const link = document.createElement("a");
	link.href = base64;
	link.download = `eraser_example.${ext}`;
	link.click();
};

const downloadSVG = () => {
	const svg = canvas.toSVG();
	const a = document.createElement("a");
	const blob = new Blob([svg], {
		type: "image/svg+xml"
	});
	const blobURL = URL.createObjectURL(blob);
	a.href = blobURL;
	a.download = "eraser_example.svg";
	a.click();
	URL.revokeObjectURL(blobURL);
};

const toJSON = async () => {
	const json = canvas.toDatalessJSON(["clipPath"]);
	const out = JSON.stringify(json, null, "\t");
	const blob = new Blob([out], {
		type: "text/plain"
	});
	const clipboardItemData = {
		[blob.type]: blob
	};
	try {
		navigator.clipboard &&
			(await navigator.clipboard.write([
				new ClipboardItem(clipboardItemData)
			]));
	} catch (error) {
		console.log(error);
	}
	const blobURL = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = blobURL;
	a.download = "demo.json";
	a.click();
	URL.revokeObjectURL(blobURL);
};
const canvas = this.__canvas = new fabric.Canvas('c');
init();
changeAction('select');

function onMoving() {
	canvas.on('object:moving', function(e) {
		var obj = e.target;
		// if object is too big ignore
		if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
			return;
		}
		obj.setCoords();
		// top-left  corner
		if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
			obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
			obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
		}
		// bot-right corner
		if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj
			.getBoundingRect()
			.left + obj.getBoundingRect().width > obj.canvas.width) {
			obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj
				.getBoundingRect().top);
			obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj
				.getBoundingRect().left);
		}
	});
}
