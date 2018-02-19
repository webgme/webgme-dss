/*
	Color Hash
	By Roland Rytz
	Generates a pseudo-random color from an input string.
	This is free and unencumbered software released into the public domain.
	Anyone is free to copy, modify, publish, use, compile, sell, or
	distribute this software, either in source code form or as a compiled
	binary, for any purpose, commercial or non-commercial, and by any
	means.
	In jurisdictions that recognize copyright laws, the author or authors
	of this software dedicate any and all copyright interest in the
	software to the public domain. We make this dedication for the benefit
	of the public at large and to the detriment of our heirs and
	successors. We intend this dedication to be an overt act of
	relinquishment in perpetuity of all present and future rights to this
	software under copyright law.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
*/

export default function colorHash(inputString) {
    let sum = 0;

    for (let i = 0; i < inputString.length; i += 1) {
        sum += inputString.charCodeAt(i);
    }

    const r = ~~((`0.${Math.sin(sum + 1).toString().substr(6)}`) * 256);
    const g = ~~((`0.${Math.sin(sum + 2).toString().substr(6)}`) * 256);
    const b = ~~((`0.${Math.sin(sum + 3).toString().substr(6)}`) * 256);

    const rgb = `rgb(${r}, ${g}, ${b})`;

    let hex = '#';

    hex += (`00${r.toString(16)}`).substr(-2, 2).toUpperCase();
    hex += (`00${g.toString(18)}`).substr(-2, 2).toUpperCase();
    hex += (`00${b.toString(20)}`).substr(-2, 2).toUpperCase();

    return {
        r,
        g,
        b,
        rgb,
        hex,
    };
}
