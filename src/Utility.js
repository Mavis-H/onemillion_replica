
const [board_width, board_height] = [1000, 1000]

function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

const byteArrayToLong = function(/*byte[]*/byteArray) {
    var value = 0;
    for ( var i = 0; i < byteArray.length; i++) {
        value += byteArray[i] << 8*(byteArray.length - 1 - i);
    }
    return value;
};


function unicode_to_bytes(str){
    var bytes = []; // char codes
    for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);
        bytes = bytes.concat([code]);
    }
    return bytes
}

function decode_pixel(pixel){
//    This function takes in a pixel in format of
//    [0:4) as position in int and [4:] as rgb
//    and return array [position, r, g, b] in List[int]
    var position = atob(pixel.slice(0, 4))
    const rgb = atob(pixel.slice(4))
    position = byteArrayToLong(unicode_to_bytes(position))
    const [r, g, b] = unicode_to_bytes(rgb)
    return [position, r, g, b]
}

export function decode_rgb(rgb){
  return unicode_to_bytes(atob(rgb))
}

function decode_matrix(matrix){
//    This take a string matrix and convert into an image that
//    stores on the client side and return the path of the image
    console.log(matrix)
    const pixels = chunkString(matrix, 8)
    console.log(pixels)
    const decoded_pixels =  pixels.map(pixel => decode_pixel(pixel))
    console.log(decoded_pixels)
    const img = generate_image('/matrix.png', decoded_pixels)
    console.log(img);
    return {'image': img.value, 'pixels': decoded_pixels}
}

function generate_image(path, pixels){
    // we create a canvas element
    const canvas = document.createElement('canvas');

    canvas.height=board_height;
    canvas.width=board_width;
// getting the context will allow to manipulate the image
    const context = canvas.getContext("2d");

// We create a new imageData.
    const imageData = context.createImageData(board_width, board_height);
// The property data will contain an array of int8
    const data = imageData.data;
    data.fill(255);
    for (let pixel of pixels){
        const [position, r, g, b] = pixel
        data[position * 4]=r; // Red
        data[position*4+1]=g; // Green
        data[position*4+2]=b; // Blue
        // data[position*4+3]=90; // alpha (transparency)
    }
// we put this random image in the context
    context.putImageData(imageData, 0, 0); // at coords 0,0

    function createData(type, mimetype) {
        var value=canvas.toDataURL(mimetype);
        if (value.indexOf(mimetype)>0) { // we check if the format is supported
            return {
                type:type,
                value:value
            }
        } else {
            return false;
        }
    }
    return createData("png","image/png");
}
