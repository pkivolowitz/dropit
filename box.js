;

class Box
{
	constructor()
	{
		this.lvrts = [];
		this.tvrts = [];
		this.lvrts_buffer = null;
		this.tvrts_buffer = null;
	}

	Initialize(width = 1, height = 1)
	{
		this.width = width;
		this.height = height;
		
		width /= 2.0;
		height /= 2.0;
		var inner_width = width * 0.2;
		var inner_height = height * 0.2;
		inner_width = inner_height = Math.min(inner_width, inner_height);

		this.lvrts_buffer = gl.createBuffer();
		this.tvrts_buffer = gl.createBuffer();

		// The frame - upper edge.
		PushVertex(this.lvrts, vec3.fromValues(-width,  height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  height - inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width,  height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  height - inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width,  height - inner_height, 0));
		// The frame - lower edge.
		PushVertex(this.lvrts, vec3.fromValues(-width,  -height + inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  -height + inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  -height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width,  -height + inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  -height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width,  -height, 0));
		// The frame - right edge.
		PushVertex(this.lvrts, vec3.fromValues( width - inner_width,  height - inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  height - inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  -height + inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width - inner_width,  height - inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width,  -height + inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues( width - inner_width,  -height + inner_height, 0));
		// The frame - left edge.
		PushVertex(this.lvrts, vec3.fromValues(-width,  height - inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width + inner_width,  height - inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width + inner_width,  -height + inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width,  height - inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width + inner_width,  -height + inner_height, 0));
		PushVertex(this.lvrts, vec3.fromValues(-width,  -height + inner_height, 0));
		// The background.
		PushVertex(this.tvrts, vec3.fromValues(-width,  height, 0));
		PushVertex(this.tvrts, vec3.fromValues( width,  height, 0));
		PushVertex(this.tvrts, vec3.fromValues( width, -height, 0));
		PushVertex(this.tvrts, vec3.fromValues(-width,  height, 0));
		PushVertex(this.tvrts, vec3.fromValues( width, -height, 0));
		PushVertex(this.tvrts, vec3.fromValues(-width, -height, 0));

		gl.bindBuffer(gl.ARRAY_BUFFER, this.lvrts_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.lvrts), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tvrts_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tvrts), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		this.InitializeShader();				
	}

	InitializeShader()
	{
		this.p_shader = CreateShader("vertex_shader", "fragment_shader");
		gl.useProgram(this.p_shader);
		this.p_coordinates = gl.getAttribLocation(this.p_shader, "vertex_coordinates");
		this.p_modelview_matrix_handle = gl.getUniformLocation(this.p_shader, "modelview_matrix");
		this.p_projection_matrix_handle = gl.getUniformLocation(this.p_shader, "projection_matrix");
		this.p_color_handle = gl.getUniformLocation(this.p_shader, "color");
		gl.useProgram(null);
	}

	Draw(model_matrix, view_matrix, projection_matrix, line_color = vec4.fromValues(1,0,0,1), fill_color = vec4.fromValues(0,1,0,1))
	{
		var modelview_matrix = mat4.create();
		mat4.multiply(modelview_matrix, view_matrix, model_matrix);
		
		gl.useProgram(this.p_shader);
		gl.uniformMatrix4fv(this.p_projection_matrix_handle, false, projection_matrix);
		gl.uniformMatrix4fv(this.p_modelview_matrix_handle, false, modelview_matrix);		
		gl.uniform4fv(this.p_color_handle, fill_color);
		gl.enableVertexAttribArray(this.p_coordinates);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tvrts_buffer);
		gl.vertexAttribPointer(this.p_coordinates, 3, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, this.tvrts.length / 3);

		gl.uniform4fv(this.p_color_handle, line_color);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.lvrts_buffer);
		gl.vertexAttribPointer(this.p_coordinates, 3, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, this.lvrts.length / 3);
		gl.disableVertexAttribArray(this.p_coordinates);


		gl.useProgram(null);
	}
}
