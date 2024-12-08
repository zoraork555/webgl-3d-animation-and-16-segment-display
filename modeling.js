// Ashton Johnson, CS535, Project #3
//
// This program shows a 3d rendering of a playground carousel with handlebars.
// On the handlebars sit up to 12 letters that can be letters or spaces.
// The letters will be capitalized when displayed
// The carousel rotates as if it were being used.
// There is a button that on load, says "Stop." Clicking it will stop the carousel.
// The button will change to "Start." Clicking again will resume the carousel.
// Under this button is a text field that takes in the text that will ride the carousel.
// Throughout the program, the logic is explained.
//
// Bit mapping for 16-segment letter display in letters()

// Edit word in "selectedWord" to change the letters on the handlebars
// 
//          15         14
//     ----------- -----------
//    |  \        |        /  |
//    |   \       |       /   |
//    |    \      |      /    |
//   8|     \     |6    /     |13
//    |      \7   |    /5     |
//    |       \   |   /       |
//    |    0   \  |  /   4    |
//     ----------- -----------
//    |        /  |  \        |
//    |       /   |   \       |
//    |      /1   |    \3     |
//   9|     /     |2    \     |12
//    |    /      |      \    |
//    |   /       |       \   |
//    |  /        |        \  |
//     ----------- -----------
//          10         11
//
 
// Global Variables
var canvas;
var gl;

var NumVertices = 0;
// Sides of circle
var NumSides = 12;
// Num rectangular prisms made
var NumBoxes = 0;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;
var theta = [ -10, 0, 0 ];
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var thetaLoc;
var play = true;

function getWord() {
    const urlParams = new URLSearchParams(window.location.search);
    const word = urlParams.get('str');
    return word;
}

var selectedWord = getWord();

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // creating the shape
    carousel();
    printing(vec4(0, 0, 0, 1.0), selectedWord);
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    //event listeners for buttons
    
    // document.getElementById( "xButton" ).onclick = function () {
    //     axis = xAxis;
    // };
    // document.getElementById( "yButton" ).onclick = function () {
    //     axis = yAxis;
    // };
    // document.getElementById( "zButton" ).onclick = function () {
    //     axis = zAxis;
    // };
    document.getElementById( "submitStr" ).onsubmit = function () {
        selectedWord = document.getElementById("submitStr").value;
        printing(vec4(0,0,0,1), selectedWord);
        render();
    }
    
    // buttons to start and stop the spinning of the carousel
    document.getElementById("StartButton").hidden = true;
    document.getElementById("StartButton").onclick = function(){
        document.getElementById("StartButton").hidden = true;
        document.getElementById("StopButton").hidden = false;
        play = true;
        render();
    };
    document.getElementById("StopButton").onclick = function(){
        document.getElementById("StartButton").hidden = false;
        document.getElementById("StopButton").hidden = true;
        play = false;
        render();
    };
    
    render();
}


function carousel()
{
    // grouped calls for the cylinder and handlebars
    cylinder(vec4(0.5, 0.5, 0.5, 1.0), 0, 0, 0, 0.75, 0.05);

    //handlebar 1
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), 0.25, 0, 0.65, 0.03, 0.03, 0.35);
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), -0.25, 0, 0.65, 0.03, 0.03, 0.35);
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), 0, 0.29, 0.65, 0.22, 0.03, 0.06);

    //handlebar 2
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), 0.25, 0, -0.65, 0.03, 0.03, 0.35);
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), -0.25, 0, -0.65, 0.03, 0.03, 0.35);
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), 0, 0.29, -0.65, 0.22, 0.03, 0.06);

    //handlebar 3
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), 0.65, 0, 0.25, 0.03, 0.03, 0.35);
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), 0.65, 0, -0.25, 0.03, 0.03, 0.35);
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), 0.65, 0.29, 0, 0.03, 0.22, 0.06);

    //handlebar 4
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), -0.65, 0, 0.25, 0.03, 0.03, 0.35);
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), -0.65, 0, -0.25, 0.03, 0.03, 0.35);
    colorBox(vec4(0.8, 0.8, 1.0, 1.0), -0.65, 0.29, 0, 0.03, 0.22, 0.06);
}


function colorBox(color, bx, by, bz, w, d, h)
{
    // takes a bottom center coord and dimensions and draws using quad2()
    NumVertices+=36;
    NumBoxes+=1;
    quad2( color, bx, by, bz, w, d, h, 1, 0, 3, 2 );
    quad2( color, bx, by, bz, w, d, h, 2, 3, 7, 6 );
    quad2( color, bx, by, bz, w, d, h, 3, 0, 4, 7 );
    quad2( color, bx, by, bz, w, d, h, 6, 5, 1, 2 );
    quad2( color, bx, by, bz, w, d, h, 4, 5, 6, 7 );
    quad2( color, bx, by, bz, w, d, h, 5, 4, 0, 1 );
}


function quad2(color, bx, by, bz, w, z, h, a, b, c, d) 
{
    // based on coord and dimensions, shape is drawn
    var vertices = [
        vec4( bx-w, by  , bz+z, 1.0 ),
        vec4( bx-w, by+h, bz+z, 1.0 ),
        vec4( bx+w, by+h, bz+z, 1.0 ),
        vec4( bx+w, by  , bz+z, 1.0 ),
        vec4( bx-w, by  , bz-z, 1.0 ),
        vec4( bx-w, by+h, bz-z, 1.0 ),
        vec4( bx+w, by+h, bz-z, 1.0 ),
        vec4( bx+w, by  , bz-z, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[a]);
    }
}


function colorDia(color, bx, by, bz, tx, ty, tz, w, d, h)
{
    // takes top middle and bottom middle coord and dimensions and draws diagonal shape using quad3()
    NumVertices+=36;
    NumBoxes+=1;
    quad3( color, bx, by, bz, tx, ty, tz, w, d, h, 1, 0, 3, 2 );
    quad3( color, bx, by, bz, tx, ty, tz, w, d, h, 2, 3, 7, 6 );
    quad3( color, bx, by, bz, tx, ty, tz, w, d, h, 3, 0, 4, 7 );
    quad3( color, bx, by, bz, tx, ty, tz, w, d, h, 6, 5, 1, 2 );
    quad3( color, bx, by, bz, tx, ty, tz, w, d, h, 4, 5, 6, 7 );
    quad3( color, bx, by, bz, tx, ty, tz, w, d, h, 5, 4, 0, 1 );
}


function quad3(color, bx, by, bz, tx, ty, tz, w, z, h, a, b, c, d) 
{
    // function used for diagonal shapes; takes top middle coord and bottom middle coord along with dimensions
    var vertices = [
        vec4( bx-z, by, bz+z, 1.0 ),
        vec4( tx-z, ty, tz+z, 1.0 ),
        vec4( tx+z, ty, tz+z, 1.0 ),
        vec4( bx+z, by, bz+z, 1.0 ),
        vec4( bx-z, by, bz-z, 1.0 ),
        vec4( tx-z, ty, tz-z, 1.0 ),
        vec4( tx+z, ty, tz-z, 1.0 ),
        vec4( bx+z, by, bz-z, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];
    
    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[a]);
    }
}



function cylinder(color, bcx, bcy, bcz, r, h) {
    // counts vertices for every cylinder
    NumVertices+=56;

    // Bottom circle
    var bx = bcx;
    var by = bcy;
    var bz = bcz;
    var bc = vec4(bx, by, bz, 1.0);
    points.push(bc);
    for (i = 0; i <= NumSides; i++){
        points.push(vec4(bx+r*Math.cos(i * 2 * Math.PI / NumSides), by, bz+r*Math.sin(i * 2 * Math.PI / NumSides), 1.0));
    }

    // Walls
    for (i = 0; i <= NumSides+1; i++){
        points.push(vec4(bx+r*Math.cos(i * 2 * Math.PI / NumSides), by, bz+r*Math.sin(i * 2 * Math.PI / NumSides), 1.0));
        points.push(vec4(bx+r*Math.cos(i * 2 * Math.PI / NumSides), by-h, bz+r*Math.sin(i * 2 * Math.PI / NumSides), 1.0));
    }

    // Top circle
    var tc = vec4(bx+h, by-h, bz, 1.0);
    points.push(tc);
    for (i = 0; i <= NumSides; i++){
        points.push(vec4(bx+r*Math.cos(i * 2 * Math.PI / NumSides), by-h, bz+r*Math.sin(i * 2 * Math.PI / NumSides), 1.0));
    }

    // pushing color through for cylinder
    for (i=0; i<(4*NumSides)+8; i++) {
        colors.push(color);
    }
}


function letters(letter)
{
    // change to uppercase
    letter = letter.toUpperCase();

    // switch returns the binary for the given letter
    switch(letter){
        case 'A':
            return ["1000100011001111"]
        case 'B':
            return ["0010101000111111"]
        case 'C':
            return ["0000000011110011"]
        case 'D':
            return ["0010001000111111"]
        case 'E':
            return ["1000000011110011"]
        case 'F':
            return ["1000000011000011"]
        case 'G':
            return ["0000100011111011"]
        case 'H':
            return ["1000100011001100"]
        case 'I':
            return ["0010001000110011"]
        case 'J':
            return ["0000000001111100"]
        case 'K':
            return ["1001010011000000"]
        case 'L':
            return ["0000000011110000"]
        case 'M':
            return ["0000010111001100"]
        case 'N':
            return ["0001000111001100"]
        case 'O':
            return ["0000000011111111"]
        case 'P':
            return ["1000100011000111"]
        case 'Q':
            return ["0001000011111111"]
        case 'R':
            return ["1001100011000111"]
        case 'S':
            return ["1000100010111011"]
        case 'T':
            return ["0010001000000011"]
        case 'U':
            return ["0000000011111100"]
        case 'V':
            return ["0100010011000000"]
        case 'W':
            return ["0101000011001100"]
        case 'X':
            return ["0101010100000000"]
        case 'Y':
            return ["1000100010111100"]
        case 'Z':
            return ["0100010000110011"]
        case ' ':
            return ["0000000000000000"]
        default:
            console.log("error in letters switch");
            break;
    }
}


function letter(color, bx, by, bz, w=0.06, z=0.015, h=0.24, ch, dir)
{
    // calls letters() to get the binary representation of the character for use below
    var bits = letters(ch);

    // each if block is a different cardinal direction each with the call to colorBox() for each of the 16 segments
    if (dir==0) {
        if (parseInt(bits[0][0]))  { colorBox(color, bx-(w/2), by+(h/2)-z, bz, w/2, z, h/8); }
        if (parseInt(bits[0][1]))  { colorDia(color, bx-w+z,   by,         bz, bx,  by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][2]))  { colorBox(color, bx,       by,         bz, w/4, z, h/2); }
        if (parseInt(bits[0][3]))  { colorDia(color, bx+w-z,   by,         bz, bx,  by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][4]))  { colorBox(color, bx+(w/2), by+(h/2)-z, bz, w/2, z, h/8); }
        if (parseInt(bits[0][5]))  { colorDia(color, bx+w-z,   by+h,       bz, bx,  by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][6]))  { colorBox(color, bx,       by+(h/2),   bz, w/4, z, h/2); }
        if (parseInt(bits[0][7]))  { colorDia(color, bx-w+z,   by+h,       bz, bx,  by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][8]))  { colorBox(color, bx-w+z,   by+(h/2),   bz, w/4, z, h/2); }
        if (parseInt(bits[0][9]))  { colorBox(color, bx-w+z,   by,         bz, w/4, z, h/2); }
        if (parseInt(bits[0][10])) { colorBox(color, bx-(w/2), by,         bz, w/2, z, h/8); }
        if (parseInt(bits[0][11])) { colorBox(color, bx+(w/2), by,         bz, w/2, z, h/8); }
        if (parseInt(bits[0][12])) { colorBox(color, bx+w-z,   by,         bz, w/4, z, h/2); }
        if (parseInt(bits[0][13])) { colorBox(color, bx+w-z,   by+(h/2),   bz, w/4, z, h/2); }
        if (parseInt(bits[0][14])) { colorBox(color, bx+(w/2), by+h-(2*z), bz, w/2, z, h/8); }
        if (parseInt(bits[0][15])) { colorBox(color, bx-(w/2), by+h-(2*z), bz, w/2, z, h/8); }
    }
    else if (dir == 1) { 
        if (parseInt(bits[0][0]))  { colorBox(color, bx, by+(h/2)-z, bz-(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][1]))  { colorDia(color, bx, by,         bz-w+z,   bx,     by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][2]))  { colorBox(color, bx, by,         bz,       z, w/4, h/2); }
        if (parseInt(bits[0][3]))  { colorDia(color, bx, by,         bz+w-z,   bx,     by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][4]))  { colorBox(color, bx, by+(h/2)-z, bz+(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][5]))  { colorDia(color, bx, by+h,       bz+w-z,   bx,     by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][6]))  { colorBox(color, bx, by+(h/2),   bz,       z, w/4, h/2); }
        if (parseInt(bits[0][7]))  { colorDia(color, bx, by+h,       bz-w+z,   bx,     by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][8]))  { colorBox(color, bx, by+(h/2),   bz-w+z,   z, w/4, h/2); }
        if (parseInt(bits[0][9]))  { colorBox(color, bx, by,         bz-w+z,   z, w/4, h/2); }
        if (parseInt(bits[0][10])) { colorBox(color, bx, by,         bz-(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][11])) { colorBox(color, bx, by,         bz+(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][12])) { colorBox(color, bx, by,         bz+w-z,   z, w/4, h/2); }
        if (parseInt(bits[0][13])) { colorBox(color, bx, by+(h/2),   bz+w-z,   z, w/4, h/2); }
        if (parseInt(bits[0][14])) { colorBox(color, bx, by+h-(2*z), bz+(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][15])) { colorBox(color, bx, by+h-(2*z), bz-(w/2), z, w/2, h/8); }
    }
    else if (dir == 2) {
        if (parseInt(bits[0][0]))  { colorBox(color, bx+(w/2), by+(h/2)-z, bz, w/2, z, h/8); }
        if (parseInt(bits[0][1]))  { colorDia(color, bx+w-z,   by,         bz, bx,  by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][2]))  { colorBox(color, bx,       by,         bz, w/4, z, h/2); }
        if (parseInt(bits[0][3]))  { colorDia(color, bx-w+z,   by,         bz, bx,  by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][4]))  { colorBox(color, bx-(w/2), by+(h/2)-z, bz, w/2, z, h/8); }
        if (parseInt(bits[0][5]))  { colorDia(color, bx-w+z,   by+h,       bz, bx,  by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][6]))  { colorBox(color, bx,       by+(h/2),   bz, w/4, z, h/2); }
        if (parseInt(bits[0][7]))  { colorDia(color, bx+w-z,   by+h,       bz, bx,  by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][8]))  { colorBox(color, bx+w-z,   by+(h/2),   bz, w/4, z, h/2); }
        if (parseInt(bits[0][9]))  { colorBox(color, bx+w-z,   by,         bz, w/4, z, h/2); }
        if (parseInt(bits[0][10])) { colorBox(color, bx+(w/2), by,         bz, w/2, z, h/8); }
        if (parseInt(bits[0][11])) { colorBox(color, bx-(w/2), by,         bz, w/2, z, h/8); }
        if (parseInt(bits[0][12])) { colorBox(color, bx-w+z,   by,         bz, w/4, z, h/2); }
        if (parseInt(bits[0][13])) { colorBox(color, bx-w+z,   by+(h/2),   bz, w/4, z, h/2); }
        if (parseInt(bits[0][14])) { colorBox(color, bx-(w/2), by+h-(2*z), bz, w/2, z, h/8); }
        if (parseInt(bits[0][15])) { colorBox(color, bx+(w/2), by+h-(2*z), bz, w/2, z, h/8); }
    }
    else if (dir == 3) {
        if (parseInt(bits[0][0]))  { colorBox(color, bx, by+(h/2)-z, bz+(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][1]))  { colorDia(color, bx, by,         bz+w-z,   bx,     by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][2]))  { colorBox(color, bx, by,         bz,       z, w/4, h/2); }
        if (parseInt(bits[0][3]))  { colorDia(color, bx, by,         bz-w+z,   bx,     by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][4]))  { colorBox(color, bx, by+(h/2)-z, bz-(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][5]))  { colorDia(color, bx, by+h,       bz-w+z,   bx,     by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][6]))  { colorBox(color, bx, by+(h/2),   bz,       z, w/4, h/2); }
        if (parseInt(bits[0][7]))  { colorDia(color, bx, by+h,       bz+w-z,   bx,     by+(h/2), bz, w, z, h); }
        if (parseInt(bits[0][8]))  { colorBox(color, bx, by+(h/2),   bz+w-z,   z, w/4, h/2); }
        if (parseInt(bits[0][9]))  { colorBox(color, bx, by,         bz+w-z,   z, w/4, h/2); }
        if (parseInt(bits[0][10])) { colorBox(color, bx, by,         bz+(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][11])) { colorBox(color, bx, by,         bz-(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][12])) { colorBox(color, bx, by,         bz-w+z,   z, w/4, h/2); }
        if (parseInt(bits[0][13])) { colorBox(color, bx, by+(h/2),   bz-w+z,   z, w/4, h/2); }
        if (parseInt(bits[0][14])) { colorBox(color, bx, by+h-(2*z), bz-(w/2), z, w/2, h/8); }
        if (parseInt(bits[0][15])) { colorBox(color, bx, by+h-(2*z), bz+(w/2), z, w/2, h/8); }
    }
}


function printing(color, str)
{
    // pads te=he string so the following code works
    str = str.padEnd(12, ' ');

    // each group of three is a different cardinal direction and the positions of each letter are given as well as dimensions
    letter(color, -0.2, 0.35, -0.65, 0.06, 0.015, 0.24,  str[0], 0);
    letter(color,    0, 0.35, -0.65, 0.06, 0.015, 0.24,  str[1], 0);
    letter(color,  0.2, 0.35, -0.65, 0.06, 0.015, 0.24,  str[2], 0);

    letter(color,  0.65, 0.35, -0.2, 0.06, 0.015, 0.24,  str[3], 1);
    letter(color,  0.65, 0.35,    0, 0.06, 0.015, 0.24,  str[4], 1);
    letter(color,  0.65, 0.35,  0.2, 0.06, 0.015, 0.24,  str[5], 1);

    letter(color,  0.2, 0.35,  0.65, 0.06, 0.015, 0.24,  str[6], 2);
    letter(color,    0, 0.35,  0.65, 0.06, 0.015, 0.24,  str[7], 2);
    letter(color, -0.2, 0.35,  0.65, 0.06, 0.015, 0.24,  str[8], 2);

    letter(color, -0.65, 0.35,  0.2, 0.06, 0.015, 0.24,  str[9], 3);
    letter(color, -0.65, 0.35,    0, 0.06, 0.015, 0.24, str[10], 3);
    letter(color, -0.65, 0.35, -0.2, 0.06, 0.015, 0.24, str[11], 3);
}


function render()
{
    // this flag allows the start/stop button to work
    if(play) {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        theta[axis] += 0.5;
        gl.uniform3fv(thetaLoc, theta);    

        //cylinder
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 2+NumSides);
        gl.drawArrays( gl.TRIANGLE_STRIP, 2+NumSides, (2*NumSides)+4);
        gl.drawArrays( gl.TRIANGLE_FAN, 6+(3*NumSides), 2+NumSides);
        //everything else (handlebars, letters)
        for (i=0; i<NumBoxes; i++) {
            gl.drawArrays( gl.TRIANGLES, 8+(4*NumSides)+(i*36), 36+1);
        }

        points = [];
        requestAnimFrame( render );
    }
}

