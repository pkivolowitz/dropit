/**
* Compile and link shader programs
* @param {string} id string for the vertex shader
* @param {string} id string for the fragment shader 
* @return {Number} the gl shader program number
*
* Some elements drawn from: https://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html
*/
function CreateShader(vrtx_id, frag_id)
{
	if (!vrtx_id)
		throw"Parameter 1 to CreateShader may be missing.";

	if (!frag_id)
		throw "Parameter 2 to CreateShader may be missing.";

	var success;

	var vrtx = document.getElementById(vrtx_id);
	if (!vrtx)
		throw "Could not find script element " + vrtx_id;
	vrtx = vrtx.text;

	var frag = document.getElementById(frag_id);
	if (!frag)
		throw "Could not find script element " + frag_id;
	frag = frag.text;

	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, vrtx);
	gl.compileShader(vertShader);
	success = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
	if (!success)
		throw "Could not compile vertex shader:" + gl.getShaderInfoLog(vertShader);

	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, frag);
	gl.compileShader(fragShader);
	success = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
	if (!success)
		throw "Could not compile fragment shader:" + gl.getShaderInfoLog(fragShader);

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertShader); 
	gl.attachShader(shaderProgram, fragShader);
	gl.linkProgram(shaderProgram);
	success = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
	if (!success)
		throw ("Shader program filed to link:" + gl.getProgramInfoLog (shaderProgram));
		
	return shaderProgram;
}