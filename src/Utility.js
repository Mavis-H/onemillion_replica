export function unicode_to_bytes(str){
    var bytes = []; // char codes
    for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);
        bytes = bytes.concat([code]);
    }
    return bytes
}

export function decode_rgb(rgb){
  return unicode_to_bytes(atob(rgb))
}